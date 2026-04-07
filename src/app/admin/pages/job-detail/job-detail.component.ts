import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { PdfService } from '../../services/pdf.service';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { PhotoUploadComponent } from '../../components/photo-upload/photo-upload.component';
import { JobCard, JobStatus, PaymentMode } from '../../models/job.model';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, StatusBadgeComponent, PhotoUploadComponent],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.css'
})
export class JobDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private pdf = inject(PdfService);

  job: JobCard | null = null;
  isAdmin = false;
  showPaymentForm = false;
  showEditHistory = false;
  showConfirmModal = false;
  pendingStatus: JobStatus | null = null;

  // Payment form
  paymentMode: PaymentMode = 'UPI';
  paymentAmount = 0;
  paymentTxnId = '';

  paymentModes: PaymentMode[] = ['Cash', 'UPI', 'Card', 'Net Banking', 'Other'];

  statusFlow: JobStatus[] = [
    JobStatus.Received,
    JobStatus.InProgress,
    JobStatus.Completed,
    JobStatus.Delivered
  ];

  get isPaid(): boolean {
    return !!this.job?.payment;
  }

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.job = this.storage.getJob(id);
      if (this.job) {
        this.paymentAmount = this.job.finalAmount || 0;
      }
    }
    if (!this.job) {
      this.router.navigate(['/edge-staff/jobs']);
    }
  }

  updateStatus(status: JobStatus): void {
    if (!this.job) return;

    // Prevent changing back from Completed or Delivered
    if (this.job.status === JobStatus.Completed || this.job.status === JobStatus.Delivered) {
      if (status === JobStatus.Received || status === JobStatus.InProgress) {
        return;
      }
    }

    // Prevent changing to Delivered if not paid
    if (status === JobStatus.Delivered && !this.isPaid) {
      this.showPaymentForm = true;
      return;
    }

    if (status === JobStatus.Completed && this.job.status !== JobStatus.Completed) {
      this.pendingStatus = status;
      this.showConfirmModal = true;
      return;
    }

    this.job = this.storage.updateJob(this.job.id, { status }, this.auth.currentRole || 'staff');
  }

  confirmStatusUpdate(): void {
    if (!this.job || !this.pendingStatus) return;
    this.job = this.storage.updateJob(this.job.id, { status: this.pendingStatus }, this.auth.currentRole || 'staff');
    
    // Auto-expand payment form if changed to Completed
    if (this.pendingStatus === JobStatus.Completed && !this.isPaid) {
      this.showPaymentForm = true;
    }

    this.showConfirmModal = false;
    this.pendingStatus = null;
  }

  cancelStatusUpdate(): void {
    this.showConfirmModal = false;
    this.pendingStatus = null;
  }

  onAfterPhotosChange(photos: string[]): void {
    if (!this.job) return;
    this.job = this.storage.updateJob(this.job.id, { afterPhotos: photos }, this.auth.currentRole || 'staff');
  }

  togglePaymentForm(): void {
    this.showPaymentForm = !this.showPaymentForm;
  }

  savePayment(): void {
    if (!this.job || this.paymentAmount <= 0) return;
    this.job = this.storage.updateJob(this.job.id, {
      payment: {
        mode: this.paymentMode,
        amount: this.paymentAmount,
        transactionId: this.paymentTxnId || undefined,
        paidAt: new Date().toISOString()
      }
    }, this.auth.currentRole || 'staff');
    this.showPaymentForm = false;
  }

  async downloadPdf(): Promise<void> {
    if (!this.job) return;
    if (this.job.status === JobStatus.Completed && !this.isPaid) {
      return;
    }
    await this.pdf.generateJobCardPdf(this.job);
  }

  shareWhatsApp(): void {
    if (!this.job) return;
    if (this.job.status === JobStatus.Completed && !this.isPaid) {
      return;
    }
    const msg = this.pdf.generateWhatsAppMessage(this.job);
    window.open(`https://wa.me/${this.job.customerPhone}?text=${msg}`, '_blank');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatField(field: string): string {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  }
}
