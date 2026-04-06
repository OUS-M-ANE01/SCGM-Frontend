import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';
import { PatientFormComponent } from '../patient-form/patient-form.component';
import { debounceTime, Subject } from 'rxjs';

/**
 * Composant Patient List
 * 
 * Fonctionnalités :
 * - Liste paginée des patients
 * - Recherche avec debounce (évite trop de requêtes)
 * - Création, modification, suppression
 * - Modal pour le formulaire
 */
@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PatientFormComponent],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);

  patients: Patient[] = [];
  loading = false;
  error = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Recherche et filtres
  searchKeyword = '';
  filterSexe = '';
  private searchSubject = new Subject<string>();

  // Modal
  showModal = false;
  selectedPatient: Patient | null = null;
  modalMode: 'create' | 'edit' = 'create';

  // Modal détails
  showDetailsModal = false;
  patientDetails: Patient | null = null;

  // Modal suppression
  showDeleteModal = false;
  patientToDelete: Patient | null = null;

  // Vue
  viewMode: 'grid' | 'list' = 'grid';

  ngOnInit(): void {
    this.loadPatients();
    this.setupSearch();
  }

  /**
   * Configurer la recherche avec debounce
   * 
   * Pourquoi debounce ?
   * - Évite de faire une requête à chaque frappe
   * - Attend 300ms après la dernière frappe
   * - Améliore les performances
   */
  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(keyword => {
      this.currentPage = 0;
      if (keyword.trim()) {
        this.searchPatients(keyword);
      } else {
        this.loadPatients();
      }
    });
  }

  /**
   * Charger la liste des patients
   */
  loadPatients(): void {
    this.loading = true;
    this.error = '';

    this.patientService.getPatients(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.patients = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement patients', error);
        this.error = 'Erreur lors du chargement des patients';
        this.loading = false;
      }
    });
  }

  /**
   * Rechercher des patients
   */
  searchPatients(keyword: string): void {
    this.loading = true;
    this.error = '';

    this.patientService.searchPatients(keyword, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.patients = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur recherche patients', error);
        this.error = 'Erreur lors de la recherche';
        this.loading = false;
      }
    });
  }

  /**
   * Déclencher la recherche
   */
  onSearch(): void {
    this.searchSubject.next(this.searchKeyword);
  }

  /**
   * Changer de page
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      if (this.searchKeyword.trim()) {
        this.searchPatients(this.searchKeyword);
      } else {
        this.loadPatients();
      }
    }
  }

  /**
   * Ouvrir le modal pour créer un patient
   */
  openCreateModal(): void {
    this.selectedPatient = null;
    this.modalMode = 'create';
    this.showModal = true;
  }

  /**
   * Ouvrir le modal pour modifier un patient
   */
  openEditModal(patient: Patient): void {
    this.selectedPatient = { ...patient }; // Copie pour éviter la modification directe
    this.modalMode = 'edit';
    this.showModal = true;
  }

  /**
   * Fermer le modal
   */
  closeModal(): void {
    this.showModal = false;
    this.selectedPatient = null;
  }

  /**
   * Callback après sauvegarde
   */
  onPatientSaved(): void {
    this.closeModal();
    this.loadPatients();
  }

  /**
   * Supprimer un patient
   */
  deletePatient(patient: Patient): void {
    this.patientToDelete = patient;
    this.showDeleteModal = true;
  }

  /**
   * Fermer la modal de suppression
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.patientToDelete = null;
  }

  /**
   * Confirmer la suppression
   */
  confirmDelete(): void {
    if (!this.patientToDelete?._id) return;

    this.patientService.deletePatient(this.patientToDelete._id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadPatients();
      },
      error: (error) => {
        console.error('Erreur suppression patient', error);
        alert('Erreur lors de la suppression du patient');
        this.closeDeleteModal();
      }
    });
  }

  /**
   * Formater la date
   */
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  /**
   * Générer le tableau des pages pour la pagination
   */
  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  /**
   * Obtenir les pages visibles pour la pagination
   */
  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      return this.getPages();
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

  /**
   * Obtenir les statistiques par sexe
   */
  getStatsBySexe(sexe: string): number {
    return this.patients.filter(p => p.sexe === sexe).length;
  }

  /**
   * Appliquer les filtres
   */
  applyFilters(): void {
    this.currentPage = 0;
    this.loadPatients();
  }

  /**
   * Voir les détails d'un patient
   */
  viewDetails(patient: Patient): void {
    this.patientDetails = patient;
    this.showDetailsModal = true;
  }

  /**
   * Fermer la modal de détails
   */
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.patientDetails = null;
  }

  /**
   * Calculer l'âge à partir de la date de naissance
   */
  calculateAge(dateNaissance: Date | string): number {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Obtenir le nom du médecin traitant
   */
  getMedecinTraitantName(patient: Patient): string {
    if (!patient.medecinTraitant) return '';
    if (typeof patient.medecinTraitant === 'string') return '';
    return `${patient.medecinTraitant.prenom} ${patient.medecinTraitant.nom}`;
  }

  /**
   * Obtenir la spécialité du médecin traitant
   */
  getMedecinTraitantSpecialite(patient: Patient): string {
    if (!patient.medecinTraitant) return '';
    if (typeof patient.medecinTraitant === 'string') return '';
    return patient.medecinTraitant.specialite || '';
  }

  /**
   * Obtenir le nom du créateur
   */
  getCreatedByName(patient: Patient): string {
    if (!patient.createdBy) return '';
    if (typeof patient.createdBy === 'string') return patient.createdBy;
    return patient.createdBy.username || patient.createdBy.email;
  }

  /**
   * Obtenir le nom du modificateur
   */
  getUpdatedByName(patient: Patient): string {
    if (!patient.updatedBy) return '';
    if (typeof patient.updatedBy === 'string') return patient.updatedBy;
    return patient.updatedBy.username || patient.updatedBy.email;
  }
}
