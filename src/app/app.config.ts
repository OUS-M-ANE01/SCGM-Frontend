import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

/**
 * Configuration de l'application
 * 
 * OPTIMISATIONS POUR LA PERFORMANCE:
 * - Pas de lazy loading (tous les composants chargés au démarrage)
 * - Préchargement des données après connexion
 * - Cache intelligent dans les services
 * - Navigation instantanée
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), // Navigation instantanée sans préchargement
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimations()
  ]
};
