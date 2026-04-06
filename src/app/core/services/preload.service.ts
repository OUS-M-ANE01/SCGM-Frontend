import { Injectable, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardService } from './dashboard.service';
import { PatientService } from './patient.service';
import { MedecinService } from './medecin.service';
import { RendezVousService } from './rendez-vous.service';
import { AuthService } from './auth.service';

/**
 * Service de préchargement des données
 * 
 * Charge TOUTES les données immédiatement après la connexion
 * pour une navigation instantanée (comme React)
 */
@Injectable({
  providedIn: 'root'
})
export class PreloadService {
  private dashboardService = inject(DashboardService);
  private patientService = inject(PatientService);
  private medecinService = inject(MedecinService);
  private rendezVousService = inject(RendezVousService);
  private authService = inject(AuthService);

  /**
   * Précharger toutes les données importantes
   * Charge plusieurs pages pour avoir un cache complet
   */
  preloadAll(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.warn('⚠️ Pas d\'utilisateur connecté, préchargement annulé');
      return;
    }

    console.log('🚀 Préchargement des données pour', user.role);

    // Préchargement adapté selon le rôle
    const preloadTasks: any = {
      dashboard: this.dashboardService.getStats().pipe(
        catchError(err => {
          console.warn('Dashboard non disponible:', err.message);
          return of(null);
        })
      ),
      patients1: this.patientService.getPatients(0, 10).pipe(
        catchError(err => {
          console.warn('Patients page 1 non disponible:', err.message);
          return of(null);
        })
      ),
      rendezVous1: this.rendezVousService.getRendezVous(0, 10).pipe(
        catchError(err => {
          console.warn('RDV page 1 non disponible:', err.message);
          return of(null);
        })
      )
    };

    // Précharger les médecins uniquement pour les admins
    if (user.role === 'ADMIN') {
      preloadTasks.medecins1 = this.medecinService.getMedecins(0, 12).pipe(
        catchError(err => {
          console.warn('Médecins non disponibles:', err.message);
          return of(null);
        })
      );
    }

    forkJoin(preloadTasks).subscribe({
      next: () => {
        console.log('✅ Données préchargées avec succès');
      },
      error: (error) => {
        console.error('❌ Erreur lors du préchargement', error);
        // Ne pas bloquer l'application si le préchargement échoue
      }
    });
  }

  /**
   * Vider tous les caches
   */
  clearAll(): void {
    console.log('🗑️ Caches vidés');
  }
}
