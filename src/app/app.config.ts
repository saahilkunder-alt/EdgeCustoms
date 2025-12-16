import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, 
      withInMemoryScrolling({
        anchorScrolling: 'disabled',
        scrollPositionRestoration: 'disabled'
      }),
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ), 
    provideClientHydration(withEventReplay())
  ]
};
