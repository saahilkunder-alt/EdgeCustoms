import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  JobCard, Customer, JobStatus, ServiceItem, EditLog,
  VehicleInfo, UserRole, PaymentInfo
} from '../models/job.model';

const STORAGE_KEYS = {
  JOBS: 'ec_jobs',
  CUSTOMERS: 'ec_customers',
  JOB_COUNTER: 'ec_job_counter'
};

@Injectable({ providedIn: 'root' })
export class StorageService {

  private jobsSubject = new BehaviorSubject<JobCard[]>(this.loadJobs());
  private customersSubject = new BehaviorSubject<Customer[]>(this.loadCustomers());

  jobs$ = this.jobsSubject.asObservable();
  customers$ = this.customersSubject.asObservable();

  // ── Jobs ──

  private loadJobs(): JobCard[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private saveJobs(jobs: JobCard[]): void {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    this.jobsSubject.next(jobs);
  }

  generateJobId(): string {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');

    let counter = parseInt(localStorage.getItem(STORAGE_KEYS.JOB_COUNTER) || '0', 10);
    counter++;
    localStorage.setItem(STORAGE_KEYS.JOB_COUNTER, counter.toString());

    return `EC-${dateStr}-${counter.toString().padStart(3, '0')}`;
  }

  createJob(job: JobCard): JobCard {
    const jobs = this.loadJobs();
    job.createdAt = new Date().toISOString();
    job.updatedAt = job.createdAt;
    jobs.unshift(job);
    this.saveJobs(jobs);

    // Auto-update customer database
    this.upsertCustomerFromJob(job);

    return job;
  }

  updateJob(id: string, updates: Partial<JobCard>, role: UserRole): JobCard | null {
    const jobs = this.loadJobs();
    const idx = jobs.findIndex(j => j.id === id);
    if (idx === -1) return null;

    const oldJob = { ...jobs[idx] };

    // Track edits
    const editLogs: EditLog[] = [];
    for (const key of Object.keys(updates) as (keyof JobCard)[]) {
      if (key === 'editHistory' || key === 'updatedAt') continue;
      const oldVal = JSON.stringify(oldJob[key]);
      const newVal = JSON.stringify(updates[key]);
      if (oldVal !== newVal) {
        editLogs.push({
          timestamp: new Date().toISOString(),
          editorRole: role,
          field: key,
          oldValue: oldVal?.substring(0, 200) || '',
          newValue: newVal?.substring(0, 200) || ''
        });
      }
    }

    jobs[idx] = {
      ...jobs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
      editHistory: [...(jobs[idx].editHistory || []), ...editLogs]
    };

    this.saveJobs(jobs);
    return jobs[idx];
  }

  getJob(id: string): JobCard | null {
    return this.loadJobs().find(j => j.id === id) || null;
  }

  getAllJobs(includeDeleted = false): JobCard[] {
    const jobs = this.loadJobs();
    return includeDeleted ? jobs : jobs.filter(j => !j.isDeleted);
  }

  getJobsByStatus(status: JobStatus): JobCard[] {
    return this.getAllJobs().filter(j => j.status === status);
  }

  getJobsByCustomerPhone(phone: string): JobCard[] {
    return this.getAllJobs().filter(j => j.customerPhone === phone);
  }

  searchJobs(query: string): JobCard[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllJobs();
    return this.getAllJobs().filter(j =>
      j.id.toLowerCase().includes(q) ||
      j.customerName.toLowerCase().includes(q) ||
      j.customerPhone.includes(q) ||
      j.registrationNumber.toLowerCase().includes(q) ||
      j.carModel.toLowerCase().includes(q)
    );
  }

  softDeleteJob(id: string, role: UserRole): boolean {
    if (role !== 'admin') return false;
    const result = this.updateJob(id, { isDeleted: true }, role);
    return result !== null;
  }

  // ── Customers ──

  private loadCustomers(): Customer[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    this.customersSubject.next(customers);
  }

  private upsertCustomerFromJob(job: JobCard): void {
    const customers = this.loadCustomers();
    let customer = customers.find(c => c.phone === job.customerPhone);

    const vehicleInfo: VehicleInfo = {
      brand: job.carBrand,
      model: job.carModel,
      registrationNumber: job.registrationNumber,
      color: job.carColor
    };

    if (customer) {
      customer.name = job.customerName;
      customer.lastVisit = job.createdAt;
      if (!customer.jobIds.includes(job.id)) {
        customer.jobIds.push(job.id);
      }
      customer.totalRevenue += job.finalAmount || 0;

      // Add vehicle if new
      const existingVehicle = customer.vehicles.find(
        v => v.registrationNumber === vehicleInfo.registrationNumber
      );
      if (!existingVehicle) {
        customer.vehicles.push(vehicleInfo);
      }
    } else {
      customer = {
        id: 'CUST-' + Date.now(),
        name: job.customerName,
        phone: job.customerPhone,
        vehicles: [vehicleInfo],
        jobIds: [job.id],
        totalRevenue: job.finalAmount || 0,
        createdAt: new Date().toISOString(),
        lastVisit: job.createdAt
      };
      customers.unshift(customer);
    }

    this.saveCustomers(customers);
  }

  getCustomer(id: string): Customer | null {
    return this.loadCustomers().find(c => c.id === id) || null;
  }

  getCustomerByPhone(phone: string): Customer | null {
    return this.loadCustomers().find(c => c.phone === phone) || null;
  }

  getAllCustomers(): Customer[] {
    return this.loadCustomers();
  }

  searchCustomers(query: string): Customer[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllCustomers();
    return this.getAllCustomers().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.vehicles.some(v => v.registrationNumber.toLowerCase().includes(q))
    );
  }

  // ── Stats ──

  getTodayStats(): { total: number; inProgress: number; completed: number; revenue: number } {
    const today = new Date().toISOString().split('T')[0];
    const todayJobs = this.getAllJobs().filter(j => j.createdAt.startsWith(today));

    return {
      total: todayJobs.length,
      inProgress: todayJobs.filter(j => j.status === JobStatus.InProgress).length,
      completed: todayJobs.filter(j =>
        j.status === JobStatus.Completed || j.status === JobStatus.Delivered
      ).length,
      revenue: todayJobs.reduce((sum, j) => sum + (j.finalAmount || 0), 0)
    };
  }

  // ── Export / Import ──

  exportData(): string {
    const data = {
      jobs: this.loadJobs(),
      customers: this.loadCustomers(),
      counter: localStorage.getItem(STORAGE_KEYS.JOB_COUNTER),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.jobs) {
        localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(data.jobs));
        this.jobsSubject.next(data.jobs);
      }
      if (data.customers) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
        this.customersSubject.next(data.customers);
      }
      if (data.counter) {
        localStorage.setItem(STORAGE_KEYS.JOB_COUNTER, data.counter);
      }
      return true;
    } catch {
      return false;
    }
  }
}
