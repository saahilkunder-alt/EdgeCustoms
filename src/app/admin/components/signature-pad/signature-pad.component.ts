import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  template: `
    <div class="sig-container">
      <label class="sig-label">Customer Signature</label>
      <canvas #canvas
        class="sig-canvas"
        (mousedown)="startDrawing($event)"
        (mousemove)="draw($event)"
        (mouseup)="stopDrawing()"
        (mouseleave)="stopDrawing()"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchDraw($event)"
        (touchend)="stopDrawing()">
      </canvas>
      <div class="sig-actions">
        <button class="sig-btn clear" (click)="clear()">Clear</button>
        <button class="sig-btn save" (click)="save()">Confirm</button>
      </div>
    </div>
  `,
  styles: [`
    .sig-container {
      width: 100%;
    }
    .sig-label {
      display: block;
      color: #a0a0a0;
      font-size: 13px;
      margin-bottom: 8px;
      font-family: 'Outfit', sans-serif;
    }
    .sig-canvas {
      width: 100%;
      height: 150px;
      background: #1a1a1a;
      border: 2px solid #2a2a2a;
      border-radius: 12px;
      cursor: crosshair;
      touch-action: none;
    }
    .sig-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .sig-btn {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 8px;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sig-btn.clear {
      background: #2a2a2a;
      color: #a0a0a0;
    }
    .sig-btn.clear:hover { background: #333; }
    .sig-btn.save {
      background: #ADFF2F;
      color: #0a0a0a;
    }
    .sig-btn.save:hover { background: #c5ff5a; }
  `]
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signatureSaved = new EventEmitter<string>();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    this.ctx.strokeStyle = '#ADFF2F';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    this.ctx.scale(2, 2);
  }

  startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
    const pos = this.getPos(event);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing) return;
    const pos = this.getPos(event);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.isDrawing = true;
    const pos = this.getTouchPos(event);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  onTouchDraw(event: TouchEvent): void {
    event.preventDefault();
    if (!this.isDrawing) return;
    const pos = this.getTouchPos(event);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  clear(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  save(): void {
    const dataUrl = this.canvasRef.nativeElement.toDataURL('image/png');
    this.signatureSaved.emit(dataUrl);
  }

  private getPos(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private getTouchPos(event: TouchEvent): { x: number; y: number } {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const touch = event.touches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }
}
