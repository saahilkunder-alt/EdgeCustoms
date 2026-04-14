import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ApiService } from '../../services/api.service';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { Customer, JobCard } from '../../models/job.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.css'
})
export class CustomerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);
  private api = inject(ApiService);

  customer: Customer | null = null;
  jobs: JobCard[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.fetchCustomer();
  }

  fetchCustomer(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.api.getCustomerById(id).subscribe({
        next: (data) => {
          this.customer = data;
          this.jobs = data.jobs;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to fetch customer', err);
          this.isLoading = false;
          this.router.navigate(['/edge-staff/customers']);
        }
      });
    } else {
      this.router.navigate(['/edge-staff/customers']);
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
