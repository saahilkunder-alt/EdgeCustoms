import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { JobCard, Customer } from '../models/job.model';

export interface DashboardData {
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    revenue: number;
  };
  recentJobs: JobCard[];
  totalCustomers: number;
  monthlyRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  getDashboardData(date?: string): Observable<DashboardData> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);

    return this.http.get<{ success: boolean, data: DashboardData }>('/api/stats/dashboard', { params })
      .pipe(
        map(res => {
          if (!res.success) throw new Error('API Error');
          return res.data;
        })
      );
  }

  lookupCustomer(phone: string): Observable<{ exists: boolean, customer?: any }> {
    const params = new HttpParams().set('phone', phone);
    return this.http.get<{ success: boolean, exists: boolean, customer?: any }>('/api/customers/lookup', { params })
      .pipe(
        map(res => {
          if (!res.success) throw new Error('Lookup failed');
          return { exists: res.exists, customer: res.customer };
        })
      );
  }

  getCustomers(q?: string): Observable<Customer[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);

    return this.http.get<{ success: boolean, data: Customer[] }>('/api/customers', { params })
      .pipe(
        map(res => {
          if (!res.success) throw new Error('Failed to fetch customers');
          return res.data;
        })
      );
  }

  getCustomerById(id: string): Observable<Customer & { jobs: JobCard[] }> {
    return this.http.get<{ success: boolean, data: any }>(`/api/customers/${id}`)
      .pipe(
        map(res => {
          if (!res.success) throw new Error('Customer not found');
          return res.data;
        })
      );
  }

  createJob(jobData: any): Observable<{ success: boolean, id: string }> {
    return this.http.post<{ success: boolean, id: string }>('/api/jobs/create', jobData);
  }

  getJobs(status?: string, q?: string): Observable<JobCard[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (q) params = params.set('q', q);

    return this.http.get<{ success: boolean, data: JobCard[] }>('/api/jobs', { params })
      .pipe(
        map(res => {
          if (!res.success) throw new Error('Failed to fetch jobs');
          return res.data;
        })
      );
  }

  getJobById(id: string): Observable<JobCard> {
    return this.http.get<{ success: boolean, data: JobCard }>(`/api/jobs/${id}`)
      .pipe(
        map(res => {
          if (!res.success) throw new Error('Job not found');
          return res.data;
        })
      );
  }

  updateJob(id: string, updates: any): Observable<void> {
    return this.http.patch<{ success: boolean }>('/api/jobs/update', { id, ...updates })
      .pipe(
        map(res => {
          if (!res.success) throw new Error('Update failed');
          return;
        })
      );
  }

  deleteJob(id: string): Observable<void> {
    return this.http.delete<{ success: boolean }>(`/api/jobs/${id}`)
      .pipe(
        map(res => {
          if (!res.success) throw new Error('Delete failed');
          return;
        })
      );
  }
}
