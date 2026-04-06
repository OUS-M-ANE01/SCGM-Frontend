import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Intercepteur JWT
 * 
 * Pourquoi un intercepteur ?
 * - Ajoute automatiquement le token JWT à TOUTES les requêtes HTTP
 * - Évite de répéter le code dans chaque service
 * - Centralise la gestion de l'authentification
 * 
 * Comment ça marche ?
 * 1. Intercepte chaque requête HTTP sortante
 * 2. Récupère le token depuis AuthService
 * 3. Ajoute le header "Authorization: Bearer TOKEN"
 * 4. Laisse passer la requête
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si un token existe, l'ajouter au header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
