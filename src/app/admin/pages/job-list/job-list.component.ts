import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { ApiService } from '../../services/api.service';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { JobCard, JobStatus } from '../../models/job.model';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [RouterLink, FormsModule, StatusBadgeComponent],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.css'
})
export class JobListComponent implements OnInit {
  private storage = inject(StorageService);
  private api = inject(ApiService);

  allJobs: JobCard[] = [];
  filteredJobs: JobCard[] = [];
  searchQuery = '';
  activeFilter: string = 'All';
  isLoading = false;

  statusFilters = ['All', 'Received', 'In Progress', 'Completed', 'Delivered'];

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.isLoading = true;
    this.api.getJobs(this.activeFilter, this.searchQuery).subscribe({
      next: (jobs: JobCard[]) => {
        this.allJobs = jobs;
        this.filteredJobs = jobs;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to fetch jobs', err);
        this.isLoading = false;
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.fetchJobs();
  }

  onSearch(): void {
    this.fetchJobs();
  }

  private applyFilter(): void {
    let jobs = this.allJobs;

    // Status filter
    if (this.activeFilter !== 'All') {
      jobs = jobs.filter(j => j.status === this.activeFilter);
    }

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      jobs = jobs.filter(j =>
        j.id.toLowerCase().includes(q) ||
        j.customerName.toLowerCase().includes(q) ||
        j.customerPhone.includes(q) ||
        j.registrationNumber.toLowerCase().includes(q)
      );
    }

    this.filteredJobs = jobs;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }
}
