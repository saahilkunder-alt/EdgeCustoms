import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';
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

  customer: Customer | null = null;
  jobs: JobCard[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.customer = this.storage.getCustomer(id);
      if (this.customer) {
        this.jobs = this.customer.jobIds
          .map(jid => this.storage.getJob(jid))
          .filter((j): j is JobCard => j !== null)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
    if (!this.customer) {
      this.router.navigate(['/edge-staff/customers']);
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
