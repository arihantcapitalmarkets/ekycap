import { type ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';

import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxSpinnerModule } from 'ngx-spinner';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideAnimationsAsync(), provideClientHydration(),
  importProvidersFrom(NgxSpinnerModule.forRoot({ type: 'ball-fussion' }))
  ]
};
