import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mon-compte.component.html',
  styleUrl: './mon-compte.component.css'
})
export class MonCompteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  currentUser: any = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  showPasswordSection = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  loading = false;

  constructor() {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileForm.patchValue({
        username: this.currentUser.username,
        email: this.currentUser.email,
        phone: this.currentUser.phone || ''
      });
    }
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.toast.warning('Veuillez remplir tous les champs correctement', 'Formulaire incomplet');
      return;
    }

    this.loading = true;
    // TODO: Implémenter l'appel API pour mettre à jour le profil
    setTimeout(() => {
      this.toast.success('Profil mis à jour avec succès', 'Succès');
      this.loading = false;
    }, 1000);
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.toast.warning('Veuillez remplir tous les champs', 'Formulaire incomplet');
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toast.error('Les mots de passe ne correspondent pas', 'Erreur');
      return;
    }

    this.loading = true;
    // TODO: Implémenter l'appel API pour changer le mot de passe
    setTimeout(() => {
      this.toast.success('Mot de passe modifié avec succès', 'Succès');
      this.passwordForm.reset();
      this.showPasswordSection = false;
      this.loading = false;
    }, 1000);
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.passwordForm.reset();
    }
  }

  getRoleBadgeColor(): string {
    switch (this.currentUser?.role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'MEDECIN':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'USER':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getRoleLabel(): string {
    switch (this.currentUser?.role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'MEDECIN':
        return 'Médecin';
      case 'USER':
        return 'Patient';
      default:
        return this.currentUser?.role || 'Utilisateur';
    }
  }
}
