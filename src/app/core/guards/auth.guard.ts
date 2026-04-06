import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard d'authentification
 * 
 * Pourquoi un guard ?
 * - Protège les routes privées
 * - Redirige vers /login si non connecté
 * - Empêche l'accès non autorisé
 * 
 * Comment l'utiliser ?
 * Dans app.routes.ts :
 * { path: 'patients', component: PatientsComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Autoriser l'accès
  }

  // Rediriger vers login avec l'URL de retour
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
