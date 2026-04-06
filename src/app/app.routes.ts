import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { AuthPageComponent } from './features/auth/auth-page/auth-page.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PatientListComponent } from './features/patients/patient-list/patient-list.component';
import { MedecinListComponent } from './features/medecins/medecin-list/medecin-list.component';
import { RendezVousListComponent } from './features/rendez-vous/rendez-vous-list/rendez-vous-list.component';
import { MonCompteComponent } from './features/mon-compte/mon-compte.component';

/**
 * Configuration des routes
 * 
 * IMPORTANT: Pas de lazy loading pour une navigation instantanée
 * Tous les composants sont chargés au démarrage pour une expérience fluide
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: AuthPageComponent
  },
  {
    path: 'register',
    component: AuthPageComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'patients',
        component: PatientListComponent
      },
      {
        path: 'medecins',
        component: MedecinListComponent
      },
      {
        path: 'rendez-vous',
        component: RendezVousListComponent
      },
      {
        path: 'mon-compte',
        component: MonCompteComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
