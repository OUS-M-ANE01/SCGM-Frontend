import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

/**
 * Composant Layout
 * 
 * Contient :
 * - Sidebar (navigation)
 * - Header (utilisateur, déconnexion)
 * - RouterOutlet (contenu des pages)
 * 
 * OPTIMISÉ: Pas d'animations pour une navigation instantanée
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;
  sidebarOpen = true;
  showLogoutModal = false;

  ngOnInit() {
    // S'abonner aux changements de l'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.showLogoutModal = true;
  }

  /**
   * Fermer la modal de déconnexion
   */
  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  /**
   * Confirmer la déconnexion
   */
  confirmLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout();
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
   * Toggle sidebar
   */
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
