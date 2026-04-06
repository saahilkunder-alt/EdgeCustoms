import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fuel-gauge',
  standalone: true,
  template: `
    <div class="gauge-container">
      <label class="gauge-label">Fuel Level</label>
      <div class="gauge-track">
        @for (segment of segments; track segment) {
          <button class="gauge-segment"
            [class.filled]="segment <= level"
            [class.low]="segment <= 25"
            [class.mid]="segment > 25 && segment <= 50"
            [class.high]="segment > 50"
            (click)="setLevel(segment)">
          </button>
        }
      </div>
      <div class="gauge-labels">
        <span class="gauge-e">E</span>
        <span class="gauge-value">{{ level }}%</span>
        <span class="gauge-f">F</span>
      </div>
    </div>
  `,
  styles: [`
    .gauge-container { width: 100%; }
    .gauge-label {
      display: block;
      color: #a0a0a0;
      font-size: 13px;
      margin-bottom: 8px;
      font-family: 'Outfit', sans-serif;
    }
    .gauge-track {
      display: flex;
      gap: 3px;
      padding: 12px;
      background: #1a1a1a;
      border-radius: 12px;
      border: 2px solid #2a2a2a;
    }
    .gauge-segment {
      flex: 1;
      height: 32px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #222;
      transition: all 0.15s;
    }
    .gauge-segment:hover { opacity: 0.8; transform: scaleY(1.1); }
    .gauge-segment.filled.low { background: #ef4444; }
    .gauge-segment.filled.mid { background: #f59e0b; }
    .gauge-segment.filled.high { background: #22c55e; }
    .gauge-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
      padding: 0 4px;
    }
    .gauge-e, .gauge-f {
      font-size: 12px;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      color: #666;
    }
    .gauge-e { color: #ef4444; }
    .gauge-f { color: #22c55e; }
    .gauge-value {
      font-size: 14px;
      font-weight: 600;
      color: #ADFF2F;
      font-family: 'Outfit', sans-serif;
    }
  `]
})
export class FuelGaugeComponent {
  @Input() level = 50;
  @Output() levelChange = new EventEmitter<number>();

  segments = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  setLevel(val: number): void {
    this.level = val;
    this.levelChange.emit(val);
  }
}
