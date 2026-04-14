import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { ApiService } from '../../services/api.service';
import { Customer } from '../../models/job.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  private storage = inject(StorageService);
  private api = inject(ApiService);

  allCustomers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchQuery = '';
  isLoading = false;

  ngOnInit(): void {
    this.fetchCustomers();
  }

  fetchCustomers(): void {
    this.isLoading = true;
    this.api.getCustomers(this.searchQuery).subscribe({
      next: (customers: Customer[]) => {
        this.allCustomers = customers;
        this.filteredCustomers = customers;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to fetch customers', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.fetchCustomers();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
