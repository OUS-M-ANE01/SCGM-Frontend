import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RendezVousService } from '../../../core/services/rendez-vous.service';
import { AuthService } from '../../../core/services/auth.service';
import { RendezVous } from '../../../core/models/rendez-vous.model';

@Component({
  selector: 'app-rendez-vous-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rendez-vous-list.component.html',
  styleUrl: './rendez-vous-list.component.css'
})
export class RendezVousListComponent implements OnInit {
  private rdvService = inject(RendezVousService);
  private authService = inject(AuthService);

  rendezVous: RendezVous[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  filterStatut = '';
  filterPeriode = '';

  // Vue
  viewMode: 'grid' | 'list' = 'grid';

  // Modal détails
  showDetailsModal = false;
  rdvDetails: RendezVous | null = null;

  // Modal suppression
  showDeleteModal = false;
  rdvToDelete: RendezVous | null = null;

  // Modal annulation avec raison
  showCancelModal = false;
  rdvToCancel: RendezVous | null = null;
  cancelReason = '';

  ngOnInit(): void {
    this.loadRendezVous();
  }

  loadRendezVous(): void {
    this.loading = true;
    this.rdvService.getRendezVous(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.rendezVous = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadRendezVous();
    }
  }

  updateStatut(rdv: RendezVous, newStatut: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE'): void {
    if (!rdv._id) return;
    
    // Si annulation, ouvrir le modal pour demander la raison
    if (newStatut === 'ANNULE') {
      this.rdvToCancel = rdv;
      this.showCancelModal = true;
      return;
    }
    
    const updatedRdv: Partial<RendezVous> = { ...rdv, statut: newStatut };
    this.rdvService.updateRendezVous(rdv._id, updatedRdv).subscribe({
      next: () => this.loadRendezVous(),
      error: () => alert('Erreur lors de la mise à jour')
    });
  }

  /**
   * Annuler un RDV avec raison
   */
  cancelRendezVous(): void {
    if (!this.rdvToCancel?._id || !this.cancelReason.trim()) {
      alert('Veuillez indiquer la raison de l\'annulation');
      return;
    }

    const updatedRdv: Partial<RendezVous> = {
      ...this.rdvToCancel,
      statut: 'ANNULE',
      notes: this.cancelReason
    };

    this.rdvService.updateRendezVous(this.rdvToCancel._id, updatedRdv).subscribe({
      next: () => {
        this.closeCancelModal();
        this.loadRendezVous();
      },
      error: () => {
        alert('Erreur lors de l\'annulation');
        this.closeCancelModal();
      }
    });
  }

  /**
   * Fermer le modal d'annulation
   */
  closeCancelModal(): void {
    this.showCancelModal = false;
    this.rdvToCancel = null;
    this.cancelReason = '';
  }

  deleteRendezVous(rdv: RendezVous): void {
    this.rdvToDelete = rdv;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.rdvToDelete = null;
  }

  confirmDelete(): void {
    if (!this.rdvToDelete?._id) return;

    this.rdvService.deleteRendezVous(this.rdvToDelete._id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadRendezVous();
      },
      error: () => {
        alert('Erreur lors de la suppression');
        this.closeDeleteModal();
      }
    });
  }

  getPatientName(rdv: RendezVous): string {
    if (typeof rdv.patientId === 'object' && rdv.patientId) {
      return `${rdv.patientId.prenom} ${rdv.patientId.nom}`;
    }
    return 'N/A';
  }

  getMedecinName(rdv: RendezVous): string {
    if (typeof rdv.medecinId === 'object' && rdv.medecinId) {
      return `Dr. ${rdv.medecinId.prenom} ${rdv.medecinId.nom}`;
    }
    return 'N/A';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'CONFIRME': 'bg-green-100 text-green-800',
      'ANNULE': 'bg-red-100 text-red-800',
      'TERMINE': 'bg-blue-100 text-blue-800'
    };
    return classes[statut] || 'bg-gray-100 text-gray-800';
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      'EN_ATTENTE': 'En attente',
      'CONFIRME': 'Confirmé',
      'ANNULE': 'Annulé',
      'TERMINE': 'Terminé'
    };
    return labels[statut] || statut;
  }

  getStatsByStatut(statut: string): number {
    return this.rendezVous.filter(rdv => rdv.statut === statut).length;
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      return Array.from({ length: this.totalPages }, (_, i) => i);
    }
    
    let start = Math.max(0, this.currentPage - 2);
    let end = Math.min(this.totalPages - 1, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadRendezVous();
  }

  viewDetails(rdv: RendezVous): void {
    this.rdvDetails = rdv;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.rdvDetails = null;
  }

  getStatutGradient(statut: string): string {
    const gradients: any = {
      'EN_ATTENTE': 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      'CONFIRME': 'bg-gradient-to-r from-green-500 to-green-600',
      'ANNULE': 'bg-gradient-to-r from-red-500 to-red-600',
      'TERMINE': 'bg-gradient-to-r from-blue-500 to-blue-600'
    };
    return gradients[statut] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  }

  /**
   * Vérifier si l'utilisateur peut supprimer un RDV
   */
  canDelete(): boolean {
    try {
      return this.authService.hasRole('ADMIN');
    } catch (error) {
      console.error('Erreur canDelete:', error);
      return false;
    }
  }

  /**
   * Obtenir le type d'un objet (pour debug)
   */
  typeof(value: any): string {
    return typeof value;
  }
}
