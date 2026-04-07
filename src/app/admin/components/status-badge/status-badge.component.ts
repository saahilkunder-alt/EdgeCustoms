import { Component, Input } from '@angular/core';
import { JobStatus } from '../../models/job.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge-' + statusClass">{{ status }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      font-family: 'Outfit', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .badge-received { background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); }
    .badge-inprogress { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
    .badge-completed { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
    .badge-delivered { background: rgba(107,114,128,0.15); color: #9ca3af; border: 1px solid rgba(107,114,128,0.3); }
  `]
})
export class StatusBadgeComponent {
  @Input() status: JobStatus = JobStatus.Received;

  get statusClass(): string {
    return this.status.toLowerCase().replace(/\s+/g, '');
  }
}
