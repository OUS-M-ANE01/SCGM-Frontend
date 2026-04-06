/**
 * Modèle User - Représente un utilisateur authentifié
 * 
 * Pourquoi des interfaces TypeScript ?
 * - Typage fort : évite les erreurs de frappe
 * - Autocomplétion dans l'IDE
 * - Documentation du code
 * - Détection d'erreurs à la compilation
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'MEDECIN';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  role?: 'ADMIN' | 'USER' | 'MEDECIN';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    username: string;
    email: string;
    role: string;
    token: string;
  };
}
