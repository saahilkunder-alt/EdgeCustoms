import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
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

  allCustomers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchQuery = '';

  ngOnInit(): void {
    this.allCustomers = this.storage.getAllCustomers();
    this.filteredCustomers = this.allCustomers;
  }

  onSearch(): void {
    this.filteredCustomers = this.storage.searchCustomers(this.searchQuery);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
