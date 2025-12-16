import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { UiService } from './services/ui.service';

interface HeroSlide {
  image: string;
  taglines: { text: string; color: 'green' | 'white' }[];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'EdgeCustoms';
  isMobileMenuOpen = false;
  isServicesExpanded = false;
  expandedService: string | null = null;
  
  // Services page
  selectedService: string | null = null;

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
    }
  ];
  currentSlideIndex = 0;
  private slideInterval: any;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (!this.isMobileMenuOpen) {
      this.isServicesExpanded = false;
      this.expandedService = null;
    }
  }

  toggleServices(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isServicesExpanded = !this.isServicesExpanded;
    if (!this.isServicesExpanded) {
      this.expandedService = null;
    }
  }

  toggleServiceSubmenu(service: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.expandedService = this.expandedService === service ? null : service;
  }

  private router = inject(Router);
  private uiService = inject(UiService);

  ngOnInit(): void {
    this.startSlideshow();

    // Listen to UI Service events
    this.uiService.openServices$.subscribe(() => {
        this.openServicesMenu();
    });

    // Listen for navigation events to handle fragment scrolling manually
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Close menus on navigation
        this.isServicesExpanded = false;
        this.isMobileMenuOpen = false;
        // Optional: keep sub-menu open or close it? usually close.
        // this.expandedService = null; // User didn't explicitly ask to reset inner state, but collapsing main menu hides it anyway.

        const tree = this.router.parseUrl(this.router.url);
        if (tree.fragment) {
          // Small delay to ensure DOM is fully rendered
          setTimeout(() => {
            this.scrollToFragment(tree.fragment!);
          }, 100);
        } else {
          // No fragment, scroll to top
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    });
  }

  private scrollToFragment(fragment: string): void {
    const element = document.getElementById(fragment);
    if (element) {
      const headerOffset = 180;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  startSlideshow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  stopSlideshow(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.heroSlides.length;
  }

  prevSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.heroSlides.length) % this.heroSlides.length;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    // Reset interval when manually changing slides
    this.stopSlideshow();
    this.startSlideshow();
  }

  openServicesMenu(): void {    
    // Wait for scroll to complete, then open services menu
    setTimeout(() => {
      this.isServicesExpanded = true;
      // On mobile, also open the mobile menu
      if (window.innerWidth <= 900) {
        this.isMobileMenuOpen = true;
      }
    }, 500);
  }

  selectService(service: string): void {
    this.selectedService = this.selectedService === service ? null : service;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideMenu = target.closest('.nav-menu');
    const clickedToggle = target.closest('.mobile-menu-toggle');

    // If click is outside the menu AND outside the toggle button
    if (!clickedInsideMenu && !clickedToggle) {
      // Close mobile menu if open
      if (this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
        // Also reset services expansion
        this.isServicesExpanded = false;
        this.expandedService = null;
      }
      
      // Close desktop services dropdown if open
      if (this.isServicesExpanded) {
         this.isServicesExpanded = false;
         this.expandedService = null;
      }
    }
  }
}
