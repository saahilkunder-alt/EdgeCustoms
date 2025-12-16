import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { RouterLink } from '@angular/router';

interface HeroSlide {
  image: string;
  taglines: { text: string; color: 'green' | 'white' }[];
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mechanicVideo') mechanicVideo!: ElementRef<HTMLVideoElement>;

  // Hero carousel
  heroSlides: HeroSlide[] = [
    {
      image: 'mechanic-hero.png',
      taglines: [
        { text: 'BUILD.', color: 'green' },
        { text: 'DRIVE.', color: 'white' },
        { text: 'REPEAT.', color: 'green' }
      ]
    },
    {
      image: 'carousel-ppf.png',
      taglines: [
        { text: 'PROTECT.', color: 'green' },
        { text: 'PRESERVE.', color: 'white' },
        { text: 'PERFECT.', color: 'green' }
      ]
    },
    {
      image: 'carousel-vinyl.png',
      taglines: [
        { text: 'WRAP.', color: 'green' },
        { text: 'TRANSFORM.', color: 'white' },
        { text: 'STAND OUT.', color: 'green' }
      ]
    },
    {
      image: 'carousel-detailing.png',
      taglines: [
        { text: 'DETAIL.', color: 'green' },
        { text: 'SHINE.', color: 'white' },
        { text: 'IMPRESS.', color: 'green' }
      ]
    },
  ];
  currentSlideIndex = 0;
  private slideInterval: any;
  private uiService = inject(UiService);

  ngOnInit(): void {
    this.startSlideshow();
  }

  ngAfterViewInit(): void {
    if (this.mechanicVideo && this.mechanicVideo.nativeElement) {
      this.mechanicVideo.nativeElement.muted = true;
      this.mechanicVideo.nativeElement.play().catch(err => {
        console.warn('Video autoplay failed:', err);
      });
    }
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  startSlideshow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopSlideshow(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.heroSlides.length;
  }

  openServicesMenu(): void {
    this.uiService.triggerOpenServices();
  }
}
