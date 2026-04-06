import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css']
})
export class AuthPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  activeMode: 'login' | 'register' = 'login';

  // Étapes du formulaire d'inscription
  registerStep: number = 1;
  totalSteps: number = 3;

  // Visibilité des mots de passe
  showLoginPassword = false;
  showRegisterPassword = false;
  showConfirmPassword = false;

  loginForm: FormGroup;
  registerForm: FormGroup;
  
  loginLoading = false;
  registerLoading = false;
  loginError = '';
  registerError = '';

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['USER']
    });
  }

  ngOnInit(): void {
    const path = this.router.url;
    this.activeMode = path.includes('register') ? 'register' : 'login';
  }

  toggleMode(mode: 'login' | 'register'): void {
    this.activeMode = mode;
    this.loginError = '';
    this.registerError = '';
    this.registerStep = 1; // Réinitialiser l'étape
    this.router.navigate([mode === 'login' ? '/login' : '/register']);
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      setTimeout(() => {
        this.toast.warning('Veuillez remplir tous les champs', 'Formulaire incomplet');
      }, 0);
      return;
    }

    this.loginLoading = true;
    this.loginError = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        setTimeout(() => {
          this.toast.success('Connexion réussie!', 'Bienvenue');
        }, 0);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loginError = error.error?.message || 'Identifiants incorrects';
        this.loginLoading = false;
        this.cdr.detectChanges(); // Forcer la détection
        setTimeout(() => {
          this.toast.error(this.loginError, 'Erreur de connexion');
        }, 0);
      }
    });
  }

  onRegister(): void {
    // Si on n'est pas à la dernière étape, passer à la suivante
    if (this.registerStep < this.totalSteps) {
      if (this.isCurrentStepValid()) {
        this.registerStep++;
        this.registerError = '';
      } else {
        setTimeout(() => {
          this.toast.warning('Veuillez remplir tous les champs requis', 'Étape incomplète');
        }, 0);
      }
      return;
    }

    // Dernière étape : soumettre le formulaire
    if (this.registerForm.invalid) {
      setTimeout(() => {
        this.toast.warning('Veuillez remplir tous les champs', 'Formulaire incomplet');
      }, 0);
      return;
    }

    // Vérifier que les mots de passe correspondent
    if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
      this.registerError = 'Les mots de passe ne correspondent pas';
      setTimeout(() => {
        this.toast.error(this.registerError, 'Erreur');
      }, 0);
      return;
    }

    this.registerLoading = true;
    this.registerError = '';

    // Préparer les données sans confirmPassword
    const { confirmPassword, ...userData } = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: () => {
        setTimeout(() => {
          this.toast.success('Compte créé avec succès!', 'Bienvenue');
        }, 0);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.registerError = error.error?.message || 'Erreur lors de l\'inscription';
        this.registerLoading = false;
        this.cdr.detectChanges(); // Forcer la détection
        setTimeout(() => {
          this.toast.error(this.registerError, 'Erreur d\'inscription');
        }, 0);
      }
    });
  }

  /**
   * Revenir à l'étape précédente
   */
  previousStep(): void {
    if (this.registerStep > 1) {
      this.registerStep--;
      this.registerError = '';
    }
  }

  /**
   * Vérifier si l'étape actuelle est valide
   */
  isCurrentStepValid(): boolean {
    switch (this.registerStep) {
      case 1:
        return !!this.registerForm.get('role')?.value;
      case 2:
        const username = this.registerForm.get('username');
        const email = this.registerForm.get('email');
        const phone = this.registerForm.get('phone');
        return !!(username?.valid && email?.valid && phone?.valid);
      case 3:
        const password = this.registerForm.get('password');
        const confirmPassword = this.registerForm.get('confirmPassword');
        return !!(password?.valid && confirmPassword?.valid && 
                  password?.value === confirmPassword?.value);
      default:
        return false;
    }
  }

  hasError(form: FormGroup, field: string, error: string): boolean {
    const control = form.get(field);
    return !!(control && control.hasError(error) && (control.dirty || control.touched));
  }

  toggleLoginPasswordVisibility(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPasswordVisibility(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}