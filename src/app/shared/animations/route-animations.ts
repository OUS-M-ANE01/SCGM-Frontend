import { trigger, transition, style, query, animate, group } from '@angular/animations';

/**
 * Animations pour les transitions de routes
 * 
 * Crée une transition fluide entre les pages
 */
export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // Style initial pour la nouvelle page
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(10px)'
      })
    ], { optional: true }),
    
    // Animation de sortie et d'entrée en parallèle
    group([
      // Page sortante
      query(':leave', [
        animate('200ms ease-out', style({
          opacity: 0,
          transform: 'translateY(-10px)'
        }))
      ], { optional: true }),
      
      // Page entrante
      query(':enter', [
        animate('300ms 100ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ], { optional: true })
    ])
  ])
]);

/**
 * Animation de fade simple
 */
export const fadeAnimation = trigger('fadeAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),
    
    query(':leave', [
      animate('150ms', style({ opacity: 0 }))
    ], { optional: true }),
    
    query(':enter', [
      animate('300ms 100ms', style({ opacity: 1 }))
    ], { optional: true })
  ])
]);
