import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { FuelGaugeComponent } from '../../components/fuel-gauge/fuel-gauge.component';
import { PhotoUploadComponent } from '../../components/photo-upload/photo-upload.component';

import {
  JobCard, JobStatus, ServiceItem, ServiceCatalogItem, SERVICE_CATALOG,
  CAR_BRANDS, BIKE_BRANDS, CAR_COLORS, BIKE_COLORS, CAR_TYPES, BIKE_TYPES,
  ServiceCategory, VehicleCategory, VehicleType, CarType, BikeType
} from '../../models/job.model';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [FormsModule, FuelGaugeComponent, PhotoUploadComponent],
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.css'
})
export class JobFormComponent implements OnInit {
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  currentStep = 1;
  totalSteps = 4;
  isLoading = false;
  private isChangingCategory = false;

  // Step 1 - Customer & Vehicle
  customerPhone = '';
  customerName = '';
  vehicleCategory: VehicleCategory | '' = '';
  vehicleType: VehicleType | '' = '';
  private _carBrand = '';
  private _carModel = '';

  get carBrand() { return this._carBrand; }
  set carBrand(v: string) {
    if (this._carBrand && !v && this.currentStep > 1) {
      console.warn('OVERRIDE BLOCKED: carBrand being cleared on step', this.currentStep);
      console.trace();
      return;
    }
    this._carBrand = v;
  }

  get carModel() { return this._carModel; }
  set carModel(v: string) {
    if (this._carModel && !v && this.currentStep > 1) {
      console.warn('OVERRIDE BLOCKED: carModel being cleared on step', this.currentStep);
      console.trace();
      return;
    }
    this._carModel = v;
  }

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


  // Step 4 - Pricing
  discountType: 'flat' | 'percent' = 'flat';
  discountValue = 0;

  // Data for dropdowns
  brands: string[] = [];
  models: string[] = [];
  colors: string[] = [];
  vehicleTypeOptions: string[] = [];
  existingCustomer = false;

  ngOnInit(): void {
    // We no longer default to 'Car' - the user must select CAR or BIKE first.
    // This ensures the correct subcategory is chosen before Brand/Model.
    this.vehicleCategory = '';
    this.onVehicleCategoryChange();
  }

  // ── Vehicle Category / Type helpers ──
  onVehicleCategoryChange(newCat?: VehicleCategory): void {
    if (newCat && this.vehicleCategory === newCat && this.brands.length > 0) {
      return; // No change, don't reset
    }

    if (newCat) {
      this.vehicleCategory = newCat;
    }

    this.isChangingCategory = true;

    try {
      const oldBrand = this.carBrand;
      const oldModel = this.carModel;
      const oldCustomBrand = this.customBrand;
      const oldCustomModel = this.customModel;

      this.vehicleType = '';

      if (this.vehicleCategory === 'Car') {
        this.vehicleTypeOptions = [...CAR_TYPES];
        this.brands = Object.keys(CAR_BRANDS).sort();
        this.colors = CAR_COLORS;
      } else if (this.vehicleCategory === 'Bike') {
        this.vehicleTypeOptions = [...BIKE_TYPES];
        this.brands = Object.keys(BIKE_BRANDS).sort();
        this.colors = BIKE_COLORS;
      } else {
        this.vehicleTypeOptions = [];
        this.brands = [];
        this.colors = [];
      }

      // Check if the old brand is valid in the new category
      if (oldBrand && this.brands.includes(oldBrand)) {
        this.carBrand = oldBrand;
        this.onBrandChange(false); // Populates this.models
        // Check if the old model is valid for this brand in the new category
        if (oldModel && this.models.includes(oldModel)) {
          this.carModel = oldModel;
        } else {
          this.carModel = '';
        }
        this.customBrand = oldCustomBrand;
        this.customModel = oldCustomModel;
      } else {
        // Reset if incompatible or if it was "Other" (since "Other" models vary)
        if (oldBrand === 'Other') {
          this.carBrand = 'Other';
          this.onBrandChange(false);
          this.customBrand = oldCustomBrand;
          this.customModel = oldCustomModel;
        } else {
          this.carBrand = '';
          this.carModel = '';
          this.customBrand = '';
          this.customModel = '';
          this.models = [];
        }
      }
    } finally {
      this.isChangingCategory = false;
    }

    this.buildServiceList();
  }

  onVehicleTypeChange(): void {
    this.buildServiceList();
  }

  private buildServiceList(): void {
    if (!this.vehicleCategory) {
      this.serviceCategories = [];
      return;
    }

    // Filter catalog by vehicle category
    const filtered = SERVICE_CATALOG.filter(s => s.forVehicle === this.vehicleCategory);

    // Group by category
    const catMap = new Map<ServiceCategory, ServiceItem[]>();
    for (const catalogItem of filtered) {
      if (!catMap.has(catalogItem.category)) catMap.set(catalogItem.category, []);
      const price = this.vehicleType ? (catalogItem.prices[this.vehicleType] ?? 0) : 0;
      catMap.get(catalogItem.category)!.push({
        id: catalogItem.id,
        name: catalogItem.name,
        category: catalogItem.category,
        price: price,
        selected: false
      });
    }

    // Preserve selections if rebuilding (e.g., when vehicle type changes)
    const previousSelections = new Map<string, { selected: boolean; price: number }>();
    for (const cat of this.serviceCategories) {
      for (const svc of cat.services) {
        if (svc.selected) {
          previousSelections.set(svc.id, { selected: true, price: svc.price });
        }
      }
    }

    this.serviceCategories = Array.from(catMap.entries()).map(([name, services]) => {
      // Restore selections and update prices
      for (const svc of services) {
        const prev = previousSelections.get(svc.id);
        if (prev) {
          svc.selected = true;
          // If the catalog price is 0 (custom), keep previously entered price
          // Otherwise update to the new vehicle type price
          const catalogItem = SERVICE_CATALOG.find(c => c.id === svc.id);
          const catalogPrice = catalogItem && this.vehicleType ? (catalogItem.prices[this.vehicleType] ?? 0) : 0;
          svc.price = catalogPrice > 0 ? catalogPrice : prev.price;
        }
      }
      return { name, services };
    });
  }

  // Step 1 helpers
  onPhoneInput(): void {
    // Strip non-digits
    this.customerPhone = this.customerPhone.replace(/\D/g, '').slice(0, 10);
    this.phoneError = '';
    this.existingCustomer = false;

    if (this.customerPhone.length === 10) {
      this.api.lookupCustomer(this.customerPhone).subscribe({
        next: (res: { exists: boolean, customer?: any }) => {
          if (res.exists && res.customer) {
            this.customerName = res.customer.name;
            this.existingCustomer = true;
            if (res.customer.lastVehicle) {
              const v = res.customer.lastVehicle;

              // CRITICAL: Set category first so Brand/Model lists are initialized correctly
              if (v.vehicle_category) {
                this.vehicleCategory = v.vehicle_category;
                this.onVehicleCategoryChange();
              }

              if (v.vehicle_type) {
                this.vehicleType = v.vehicle_type;
                this.onVehicleTypeChange();
              }

              // Handle Brand auto-fill
              if (v.brand === 'Other') {
                this.carBrand = 'Other';
                this.customBrand = v.custom_brand || ''; // Use custom field if available
              } else {
                this.carBrand = v.brand;
              }

              this.onBrandChange(false); // Don't reset custom fields yet

              // Handle Model auto-fill
              if (v.model === 'Other' || v.model === 'Custom') {
                this.carModel = v.model;
                this.customModel = v.custom_model || '';
              } else {
                this.carModel = v.model;
                // If it's a standard model, but we had a custom model typed before, 
                // we should probably clear it? Actually, onBrandChange(false) handles it.
              }

              this.registrationNumber = v.registration_number;
              this.carColor = v.color;
              this.odometerReading = v.odometer_reading;
              this.fuelLevel = v.fuel_level || 50;
            }
          }
        },
        error: (err: any) => console.error('Lookup failed', err)
      });
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
    // Priority: customBrand if isOtherBrand, otherwise carBrand. 
    // Fallback to any non-empty value if the primary one is missing.
    console.log(this.customBrand)

    if (this.isOtherBrand && this.customBrand) return this.customBrand;
    if (this.carBrand && this.carBrand !== 'Other') return this.carBrand;
    return this.customBrand || this.carBrand || '';
  }

  get effectiveModel(): string {
    // Priority: customModel if brand is Other/Custom, otherwise carModel.
    // Fallback to any non-empty value.
    if (this.isOtherBrand || this.carModel === 'Other' || this.carModel === 'Custom') {
      if (this.customModel) return this.customModel;
    }
    if (this.carModel && this.carModel !== 'Other' && this.carModel !== 'Custom') return this.carModel;
    return this.customModel || this.carModel || '';
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

  onBrandChange(resetCustom = true): void {
    if (this.isChangingCategory) return;
    
    const brandList = this.vehicleCategory === 'Bike' ? BIKE_BRANDS : CAR_BRANDS;
    const brandModels = brandList[this.carBrand] || [];
    // Ensure 'Other' is always available as a model option
    this.models = brandModels.includes('Other') ? [...brandModels] : [...brandModels, 'Other'];

    // Only reset model if the current one isn't valid for the new brand
    if (!this.models.includes(this.carModel)) {
      this.carModel = '';
    }

    if (resetCustom) {
      this.customBrand = '';
      this.customModel = '';
    }
  }

  // Step 2 helpers
  toggleCategory(name: string): void {
    this.expandedCategory = this.expandedCategory === name ? null : name;
  }

  toggleService(service: ServiceItem): void {
    service.selected = !service.selected;
    // If selecting and price is 0 from catalog (custom), keep it at 0 for manual entry
    // If selecting and price is set from catalog, it's already auto-filled
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

  get servicesMissingPrice(): number {
    return this.selectedServices.filter(s => !s.price || s.price <= 0).length;
  }

  // Check if a service is a "custom price" service (catalog price is 0 for all vehicle types)
  isCustomPriceService(serviceId: string): boolean {
    const catalogItem = SERVICE_CATALOG.find(c => c.id === serviceId);
    if (!catalogItem) return false;
    return Object.values(catalogItem.prices).every(p => p === 0);
  }

  // Step 3 helpers


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
        const hasCategory = !!this.vehicleCategory;
        const hasType = !!this.vehicleType;
        return hasPhone && hasName && hasBrand && hasModel && hasReg && hasCategory && hasType;
      }
      case 2: {
        const hasServices = this.selectedServices.length > 0 && this.selectedServices.every(s => s.price > 0);
        return hasServices;
      }
      case 3: return this.customerAcknowledged;
      case 4: return true;
      default: return false;
    }
  }

  // Submit
  submitJob(): void {
    const jobData = {
      job_id: this.storage.generateJobId(),
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      vehicleCategory: this.vehicleCategory as string,
      vehicleType: this.vehicleType as string,
      carBrand: this.effectiveBrand,
      carModel: this.effectiveModel,
      customBrand: this.customBrand,
      customModel: this.customModel,
      registrationNumber: this.registrationNumber.toUpperCase(),
      carColor: this.effectiveColor,
      odometerReading: this.odometerReading,
      fuelLevel: this.fuelLevel,
      selectedServices: this.selectedServices,
      beforePhotos: this.beforePhotos,
      remarks: this.remarks,
      customerAcknowledged: this.customerAcknowledged,
      subtotal: this.subtotal,
      discountType: this.discountType,
      discountValue: this.discountValue,
      discountAmount: this.discountAmount,
      finalAmount: this.finalAmount
    };

    this.isLoading = true;
    this.api.createJob(jobData).subscribe({
      next: (res: { success: boolean, id: string }) => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/edge-staff/jobs', res.id]);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Submit failed', err);
        alert('Failed to save job card. Please check your connection.');
      }
    });
  }
}
