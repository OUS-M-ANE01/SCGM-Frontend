import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { AuthService } from '../../../core/services/auth.service';
import { Patient } from '../../../core/models/patient.model';
import { Medecin } from '../../../core/models/medecin.model';

/**
 * Composant Patient Form (Modal)
 * 
 * Utilisé pour créer et modifier un patient
 * Affiche un formulaire dans un modal
 */
@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.css'
})
export class PatientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private medecinService = inject(MedecinService);
  private authService = inject(AuthService);

  @Input() patient: Patient | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  patientForm!: FormGroup;
  loading = false;
  error = '';

  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  medecins: Medecin[] = [];
  loadingMedecins = false;
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');
    this.initForm();
    if (this.isAdmin) {
      this.loadMedecins();
    }
  }

  /**
   * Charger la liste des médecins (pour admin uniquement)
   */
  loadMedecins(): void {
    this.loadingMedecins = true;
    this.medecinService.getMedecins(0, 100).subscribe({
      next: (response) => {
        this.medecins = response.data.content;
        this.loadingMedecins = false;
      },
      error: (error) => {
        console.error('Erreur chargement médecins', error);
        this.loadingMedecins = false;
      }
    });
  }

  /**
   * Initialiser le formulaire
   */
  initForm(): void {
    // Extraire l'ID du médecin traitant si c'est un objet
    let medecinTraitantId = '';
    if (this.patient?.medecinTraitant) {
      if (typeof this.patient.medecinTraitant === 'string') {
        medecinTraitantId = this.patient.medecinTraitant;
      } else {
        medecinTraitantId = this.patient.medecinTraitant._id;
      }
    }

    this.patientForm = this.fb.group({
      nom: [this.patient?.nom || '', [Validators.required, Validators.minLength(2)]],
      prenom: [this.patient?.prenom || '', [Validators.required, Validators.minLength(2)]],
      dateNaissance: [this.formatDateForInput(this.patient?.dateNaissance), Validators.required],
      cin: [this.patient?.cin || '', [Validators.required, Validators.minLength(5)]],
      email: [this.patient?.email || '', [Validators.required, Validators.email]],
      telephone: [this.patient?.telephone || '', [Validators.required, Validators.minLength(10)]],
      sexe: [this.patient?.sexe || 'M', Validators.required],
      groupeSanguin: [this.patient?.groupeSanguin || ''],
      antecedents: [this.patient?.antecedents || ''],
      medecinTraitant: [medecinTraitantId]
    });
  }

  /**
   * Formater la date pour l'input type="date"
   */
  formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.patientForm.invalid) {
      Object.keys(this.patientForm.controls).forEach(key => {
        this.patientForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';

    const patientData = { ...this.patientForm.value };
    
    // Ne pas envoyer medecinTraitant si vide
    if (!patientData.medecinTraitant) {
      delete patientData.medecinTraitant;
    }

    if (this.mode === 'create') {
      this.createPatient(patientData);
    } else {
      this.updatePatient(patientData);
    }
  }

  /**
   * Créer un patient
   */
  createPatient(data: Patient): void {
    this.patientService.createPatient(data).subscribe({
      next: () => {
        this.saved.emit();
      },
      error: (error) => {
        console.error('Erreur création patient', error);
        this.error = error.error?.message || 'Erreur lors de la création du patient';
        this.loading = false;
      }
    });
  }

  /**
   * Mettre à jour un patient
   */
  updatePatient(data: Patient): void {
    if (!this.patient?._id) return;

    this.patientService.updatePatient(this.patient._id, data).subscribe({
      next: () => {
        this.saved.emit();
      },
      error: (error) => {
        console.error('Erreur modification patient', error);
        this.error = error.error?.message || 'Erreur lors de la modification du patient';
        this.loading = false;
      }
    });
  }

  /**
   * Fermer le modal
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasError(field: string, error: string): boolean {
    const control = this.patientForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }
}
