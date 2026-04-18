import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { JobCard } from '../../models/job.model';
import { ApiService, DashboardData } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private api = inject(ApiService);

  stats = { total: 0, inProgress: 0, completed: 0, revenue: 0 };
  recentJobs: JobCard[] = [];
  totalCustomers = 0;
  isAdmin = false;
  isLoading = true;
  selectedDate: string = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin;
    this.loadDashboardData();
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.selectedDate = input.value;
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.api.getDashboardData(this.selectedDate).subscribe({
      next: (data: DashboardData) => {
        this.stats = data.stats;
        this.recentJobs = data.recentJobs;
        this.totalCustomers = data.totalCustomers;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading dashboard:', err);
        this.isLoading = false;
      }
    });
  }

  exportData(): void {
    const data = this.storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edge-customs-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const success = this.storage.importData(reader.result as string);
      if (success) {
        alert('Data imported successfully!');
        this.ngOnInit(); // Refresh
      } else {
        alert('Import failed. Invalid file.');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }
}
