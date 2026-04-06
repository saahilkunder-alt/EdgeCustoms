import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  template: `
    <div class="photo-section">
      <label class="photo-label">{{ label }}</label>
      <div class="photo-grid">
        @for (photo of photos; track $index) {
          <div class="photo-thumb">
            <img [src]="photo" alt="Photo {{ $index + 1 }}">
            <button class="photo-remove" (click)="removePhoto($index)">✕</button>
          </div>
        }
        <label class="photo-add" [class.disabled]="photos.length >= maxPhotos">
          <input type="file" accept="image/*" [attr.capture]="useCamera ? 'environment' : null"
            (change)="onFileSelected($event)" [disabled]="photos.length >= maxPhotos" multiple>
          <span class="add-icon">📷</span>
          <span class="add-text">{{ photos.length >= maxPhotos ? 'Max reached' : 'Add Photo' }}</span>
        </label>
      </div>
    </div>
  `,
  styles: [`
    .photo-section { width: 100%; }
    .photo-label {
      display: block;
      color: #a0a0a0;
      font-size: 13px;
      margin-bottom: 8px;
      font-family: 'Outfit', sans-serif;
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 8px;
    }
    .photo-thumb {
      position: relative;
      aspect-ratio: 1;
      border-radius: 10px;
      overflow: hidden;
      border: 2px solid #2a2a2a;
    }
    .photo-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-remove {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: none;
      background: rgba(239,68,68,0.9);
      color: white;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .photo-add {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      border: 2px dashed #333;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      background: #1a1a1a;
    }
    .photo-add:hover:not(.disabled) {
      border-color: #ADFF2F;
      background: rgba(173,255,47,0.05);
    }
    .photo-add.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .photo-add input { display: none; }
    .add-icon { font-size: 24px; margin-bottom: 4px; }
    .add-text {
      font-size: 10px;
      color: #666;
      font-family: 'Outfit', sans-serif;
    }
  `]
})
export class PhotoUploadComponent {
  @Input() label = 'Photos';
  @Input() photos: string[] = [];
  @Input() maxPhotos = 5;
  @Input() useCamera = true;
  @Output() photosChange = new EventEmitter<string[]>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const remaining = this.maxPhotos - this.photos.length;
    const files = Array.from(input.files).slice(0, remaining);

    for (const file of files) {
      this.compressAndAdd(file);
    }
    input.value = '';
  }

  private compressAndAdd(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        this.photos = [...this.photos, compressed];
        this.photosChange.emit(this.photos);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removePhoto(index: number): void {
    this.photos = this.photos.filter((_, i) => i !== index);
    this.photosChange.emit(this.photos);
  }
}
