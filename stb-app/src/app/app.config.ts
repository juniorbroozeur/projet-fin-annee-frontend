// ✅ app.config.ts
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router'; // ✅ Correction ici
import { routes } from './app.routes';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';

export const appConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes), // ✅ Corrigé ici
    provideAnimations(),
    importProvidersFrom(FontAwesomeModule),
    importProvidersFrom(CommonModule),
  ],
};

