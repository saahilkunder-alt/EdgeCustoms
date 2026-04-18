import { Component, Input, Output, EventEmitter } from '@angular/core';
import heic2any from 'heic2any';

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
        
        @if (photos.length < maxPhotos) {
          <!-- Camera Option -->
          <label class="photo-add camera">
            <input type="file" accept="image/*" capture="environment"
              (change)="onFileSelected($event)">
            <span class="add-icon">📸</span>
            <span class="add-text">Camera</span>
          </label>

          <!-- Gallery Option -->
          <label class="photo-add gallery">
            <input type="file" accept="image/*"
              (change)="onFileSelected($event)" multiple>
            <span class="add-icon">🖼️</span>
            <span class="add-text">Gallery</span>
          </label>
        } @else {
          <div class="photo-add disabled">
            <span class="add-icon">🚫</span>
            <span class="add-text">Max reached</span>
          </div>
        }
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
    .photo-add.camera:hover:not(.disabled) { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
    .photo-add.gallery:hover:not(.disabled) { border-color: #f59e0b; background: rgba(245,158,11,0.05); }
    
    .photo-add.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .photo-add input { display: none; }
    .add-icon { font-size: 24px; margin-bottom: 4px; }
    .add-text {
      font-size: 10px;
      color: #888;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
    }
  `]
})
export class PhotoUploadComponent {
  @Input() label = 'Photos';
  @Input() photos: string[] = [];
  @Input() maxPhotos = 5;
  @Output() photosChange = new EventEmitter<string[]>();

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const remaining = this.maxPhotos - this.photos.length;
    const files = Array.from(input.files).slice(0, remaining);

    for (const file of files) {
      let blob: Blob = file;
      const lowerName = file.name.toLowerCase();
      const isHeic = lowerName.endsWith('.heic') || lowerName.endsWith('.heif') || 
                     file.type === 'image/heic' || file.type === 'image/heif';

      if (isHeic) {
        try {
          const converted = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9
          });
          blob = Array.isArray(converted) ? converted[0] : converted;
        } catch (e) {
          console.error('HEIC conversion failed', e);
        }
      }
      this.compressAndAdd(blob);
    }
    input.value = '';
  }

  private compressAndAdd(blob: Blob): void {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1200;
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
        const compressed = canvas.toDataURL('image/webp', 0.8);
        this.photos = [...this.photos, compressed];
        this.photosChange.emit(this.photos);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(blob);
  }

  removePhoto(index: number): void {
    this.photos = this.photos.filter((_, i) => i !== index);
    this.photosChange.emit(this.photos);
  }
}
