import './polyfills';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
});

// bootstrapApplication(AppComponent)
//   .catch(err => console.error(err));

// bootstrapApplication(AppComponent, {
//   providers: [provideHttpClient()], // Provide HttpClient
// }).catch((err) => console.error(err));
