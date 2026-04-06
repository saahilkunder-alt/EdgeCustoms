import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
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

  allJobs: JobCard[] = [];
  filteredJobs: JobCard[] = [];
  searchQuery = '';
  activeFilter: string = 'All';

  statusFilters = ['All', 'Received', 'In Progress', 'Waiting', 'Completed', 'Delivered'];

  ngOnInit(): void {
    this.allJobs = this.storage.getAllJobs();
    this.applyFilter();
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  onSearch(): void {
    this.applyFilter();
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
