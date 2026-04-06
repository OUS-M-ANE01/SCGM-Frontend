import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models/dashboard.model';
import { AuthService } from '../../core/services/auth.service';

/**
 * Composant Dashboard
 * 
 * Affiche les statistiques de la clinique :
 * - Nombre total de patients, médecins, rendez-vous
 * - Rendez-vous par statut
 * - Rendez-vous aujourd'hui et à venir
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  stats: DashboardStats | null = null;
  loading = true;
  error = '';
  currentUser: any = null;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement stats', error);
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Calculer le pourcentage
   */
  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  /**
   * Calculer la longueur d'une tranche du camembert
   * Circonférence = 2 * PI * r = 2 * 3.14159 * 80 = 502.4
   */
  getPieSlice(value: number, total: number): number {
    if (total === 0) return 0;
    const circumference = 502.4; // 2 * PI * 80
    return (value / total) * circumference;
  }

  /**
   * Obtenir l'heure actuelle formatée
   */
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  /**
   * Vérifier si l'utilisateur est médecin
   */
  isMedecin(): boolean {
    return this.currentUser?.role === 'MEDECIN';
  }

  /**
   * Vérifier si l'utilisateur est patient
   */
  isPatient(): boolean {
    return this.currentUser?.role === 'USER';
  }

  /**
   * Naviguer vers une route
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
