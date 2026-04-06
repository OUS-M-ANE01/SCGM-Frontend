import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedecinService } from '../../../core/services/medecin.service';
import { Medecin } from '../../../core/models/medecin.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-medecin-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medecin-list.component.html',
  styleUrl: './medecin-list.component.css'
})
export class MedecinListComponent implements OnInit {
  private medecinService = inject(MedecinService);

  medecins: Medecin[] = [];
  loading = false;
  error = '';

  currentPage = 0;
  pageSize = 12;
  totalPages = 0;
  totalElements = 0;

  searchKeyword = '';
  filterDisponibilite = '';
  filterSpecialite = '';
  private searchSubject = new Subject<string>();

  // Vue
  viewMode: 'grid' | 'list' = 'grid';

  // Modal détails
  showDetailsModal = false;
  medecinDetails: Medecin | null = null;

  // Modal suppression
  showDeleteModal = false;
  medecinToDelete: Medecin | null = null;

  ngOnInit(): void {
    this.loadMedecins();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(keyword => {
      this.currentPage = 0;
      if (keyword.trim()) {
        this.searchMedecins(keyword);
      } else {
        this.loadMedecins();
      }
    });
  }

  loadMedecins(): void {
    this.loading = true;
    this.medecinService.getMedecins(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.medecins = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des médecins';
        this.loading = false;
      }
    });
  }

  searchMedecins(keyword: string): void {
    this.loading = true;
    this.medecinService.searchMedecins(keyword, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.medecins = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors de la recherche';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchKeyword);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      if (this.searchKeyword.trim()) {
        this.searchMedecins(this.searchKeyword);
      } else {
        this.loadMedecins();
      }
    }
  }

  toggleDisponibilite(medecin: Medecin): void {
    if (!medecin._id) return;
    
    const updatedMedecin = { ...medecin, disponible: !medecin.disponible };
    this.medecinService.updateMedecin(medecin._id, updatedMedecin).subscribe({
      next: () => this.loadMedecins(),
      error: () => alert('Erreur lors de la mise à jour')
    });
  }

  deleteMedecin(medecin: Medecin): void {
    this.medecinToDelete = medecin;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.medecinToDelete = null;
  }

  confirmDelete(): void {
    if (!this.medecinToDelete?._id) return;

    this.medecinService.deleteMedecin(this.medecinToDelete._id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadMedecins();
      },
      error: () => {
        alert('Erreur lors de la suppression');
        this.closeDeleteModal();
      }
    });
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

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

  getStatsByDisponibilite(disponible: boolean): number {
    return this.medecins.filter(m => m.disponible === disponible).length;
  }

  getUniqueSpecialites(): string[] {
    const specialites = this.medecins.map(m => m.specialite);
    return [...new Set(specialites)].sort();
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadMedecins();
  }

  viewDetails(medecin: Medecin): void {
    this.medecinDetails = medecin;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.medecinDetails = null;
  }
}
