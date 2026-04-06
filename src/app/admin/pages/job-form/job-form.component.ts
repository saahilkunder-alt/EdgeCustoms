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
  registrationNumber = '';
  carColor = '';
  odometerReading: number | null = null;
  fuelLevel = 50;

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
  onPhoneChange(): void {
    if (this.customerPhone.length >= 10) {
      const customer = this.storage.getCustomerByPhone(this.customerPhone);
      if (customer) {
        this.customerName = customer.name;
        this.existingCustomer = true;
        // Auto-fill last vehicle if available
        if (customer.vehicles.length > 0) {
          const lastVehicle = customer.vehicles[customer.vehicles.length - 1];
          this.carBrand = lastVehicle.brand;
          this.onBrandChange();
          this.carModel = lastVehicle.model;
          this.registrationNumber = lastVehicle.registrationNumber;
          this.carColor = lastVehicle.color;
        }
      } else {
        this.existingCustomer = false;
      }
    }
  }

  onBrandChange(): void {
    this.models = CAR_BRANDS[this.carBrand] || [];
    if (!this.models.includes(this.carModel)) {
      this.carModel = '';
    }
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
      case 1: return !!(this.customerName && this.customerPhone && this.carBrand && this.carModel && this.registrationNumber);
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
      carBrand: this.carBrand,
      carModel: this.carModel,
      registrationNumber: this.registrationNumber.toUpperCase(),
      carColor: this.carColor,
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
