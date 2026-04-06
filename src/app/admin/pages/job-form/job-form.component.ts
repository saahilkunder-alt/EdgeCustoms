import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { FuelGaugeComponent } from '../../components/fuel-gauge/fuel-gauge.component';
import { PhotoUploadComponent } from '../../components/photo-upload/photo-upload.component';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';
import {
  JobCard, JobStatus, ServiceItem, DEFAULT_SERVICES, CAR_BRANDS, CAR_COLORS,
  ServiceCategory
} from '../../models/job.model';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [FormsModule, FuelGaugeComponent, PhotoUploadComponent, SignaturePadComponent],
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.css'
})
export class JobFormComponent implements OnInit {
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private router = inject(Router);

  currentStep = 1;
  totalSteps = 4;

  // Step 1 - Customer & Vehicle
  customerPhone = '';
  customerName = '';
  carBrand = '';
  carModel = '';
  customBrand = '';
  customModel = '';
  customColor = '';
  registrationNumber = '';
  carColor = '';
  odometerReading: number | null = null;
  fuelLevel = 50;
  phoneError = '';

  // Step 2 - Services
  serviceCategories: { name: ServiceCategory; services: ServiceItem[] }[] = [];
  expandedCategory: string | null = null;

  // Step 3 - Photos & Remarks
  beforePhotos: string[] = [];
  remarks = '';
  customerAcknowledged = false;
  signatureDataUrl = '';

  // Step 4 - Pricing
  discountType: 'flat' | 'percent' = 'flat';
  discountValue = 0;

  // Data for dropdowns
  brands = Object.keys(CAR_BRANDS).sort();
  models: string[] = [];
  colors = CAR_COLORS;
  existingCustomer = false;

  ngOnInit(): void {
    // Group services by category
    const catMap = new Map<ServiceCategory, ServiceItem[]>();
    for (const svc of DEFAULT_SERVICES) {
      if (!catMap.has(svc.category)) catMap.set(svc.category, []);
      catMap.get(svc.category)!.push({ ...svc, selected: false });
    }
    this.serviceCategories = Array.from(catMap.entries()).map(([name, services]) => ({ name, services }));
  }

  // Step 1 helpers
  onPhoneInput(): void {
    // Strip non-digits
    this.customerPhone = this.customerPhone.replace(/\D/g, '').slice(0, 10);
    this.phoneError = '';
    this.existingCustomer = false;

    if (this.customerPhone.length === 10) {
      const customer = this.storage.getCustomerByPhone(this.customerPhone);
      if (customer) {
        this.customerName = customer.name;
        this.existingCustomer = true;
        if (customer.vehicles.length > 0) {
          const lastVehicle = customer.vehicles[customer.vehicles.length - 1];
          this.carBrand = lastVehicle.brand;
          this.onBrandChange();
          this.carModel = lastVehicle.model;
          this.registrationNumber = lastVehicle.registrationNumber;
          this.carColor = lastVehicle.color;
        }
      }
    } else if (this.customerPhone.length > 0 && this.customerPhone.length < 10) {
      this.phoneError = `${10 - this.customerPhone.length} more digits needed`;
    }
  }

  get isPhoneValid(): boolean {
    return this.customerPhone.length === 10;
  }

  get isOtherBrand(): boolean {
    return this.carBrand === 'Other';
  }

  get isOtherModel(): boolean {
    return this.carModel === 'Other' || this.carModel === 'Custom' || (this.isOtherBrand && !!this.customBrand);
  }

  get isOtherColor(): boolean {
    return this.carColor === 'Other';
  }

  get effectiveBrand(): string {
    return this.isOtherBrand ? this.customBrand : this.carBrand;
  }

  get effectiveModel(): string {
    return (this.carModel === 'Other' || this.carModel === 'Custom' || this.isOtherBrand) ? this.customModel : this.carModel;
  }

  get effectiveColor(): string {
    return this.isOtherColor ? this.customColor : this.carColor;
  }

  onPhoneKeydown(event: KeyboardEvent): void {
    // Allow: backspace, delete, tab, escape, enter, arrows
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowed.includes(event.key)) return;
    // Allow Ctrl/Cmd+A, C, V, X
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) return;
    // Block anything that's not a digit
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onBrandChange(): void {
    const brandModels = CAR_BRANDS[this.carBrand] || [];
    // Ensure 'Other' is always available as a model option
    this.models = brandModels.includes('Other') ? [...brandModels] : [...brandModels, 'Other'];
    if (!this.models.includes(this.carModel)) {
      this.carModel = '';
    }
    this.customBrand = '';
    this.customModel = '';
  }

  // Step 2 helpers
  toggleCategory(name: string): void {
    this.expandedCategory = this.expandedCategory === name ? null : name;
  }

  toggleService(service: ServiceItem): void {
    service.selected = !service.selected;
  }

  get selectedServices(): ServiceItem[] {
    return this.serviceCategories
      .flatMap(c => c.services)
      .filter(s => s.selected);
  }

  get subtotal(): number {
    return this.selectedServices.reduce((sum, s) => sum + s.price, 0);
  }

  getCategorySelectedCount(cat: { services: ServiceItem[] }): number {
    return cat.services.filter(s => s.selected).length;
  }

  // Step 3 helpers
  onSignatureSaved(dataUrl: string): void {
    this.signatureDataUrl = dataUrl;
  }

  // Step 4 helpers
  get discountAmount(): number {
    if (this.discountType === 'percent') {
      return Math.round(this.subtotal * (this.discountValue / 100));
    }
    return this.discountValue;
  }

  get finalAmount(): number {
    return Math.max(0, this.subtotal - this.discountAmount);
  }

  // Navigation
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  get canProceed(): boolean {
    switch (this.currentStep) {
      case 1: {
        const hasPhone = this.isPhoneValid;
        const hasName = !!this.customerName;
        const hasBrand = this.isOtherBrand ? !!this.customBrand : !!this.carBrand;
        const hasModel = (this.carModel === 'Custom' || this.isOtherBrand) ? !!this.customModel : !!this.carModel;
        const hasReg = !!this.registrationNumber;
        return hasPhone && hasName && hasBrand && hasModel && hasReg;
      }
      case 2: return this.selectedServices.length > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  }

  // Submit
  submitJob(): void {
    const job: JobCard = {
      id: this.storage.generateJobId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      carBrand: this.effectiveBrand,
      carModel: this.effectiveModel,
      registrationNumber: this.registrationNumber.toUpperCase(),
      carColor: this.effectiveColor,
      odometerReading: this.odometerReading,
      fuelLevel: this.fuelLevel,
      selectedServices: this.selectedServices,
      beforePhotos: this.beforePhotos,
      afterPhotos: [],
      remarks: this.remarks,
      customerAcknowledged: this.customerAcknowledged,
      signatureDataUrl: this.signatureDataUrl,
      status: JobStatus.Received,
      subtotal: this.subtotal,
      discountType: this.discountType,
      discountValue: this.discountValue,
      discountAmount: this.discountAmount,
      finalAmount: this.finalAmount,
      payment: null,
      editHistory: [],
      isDeleted: false
    };

    this.storage.createJob(job);
    this.router.navigate(['/admin/jobs', job.id]);
  }
}
