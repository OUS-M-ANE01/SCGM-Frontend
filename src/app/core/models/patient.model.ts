/**
 * Modèle Patient
 */
export interface Patient {
  _id?: string;
  nom: string;
  prenom: string;
  dateNaissance: Date | string;
  cin: string;
  email: string;
  telephone: string;
  sexe: 'M' | 'F';
  groupeSanguin?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  antecedents?: string;
  
  // NOUVEAU: Relations
  medecinTraitant?: string | {
    _id: string;
    nom: string;
    prenom: string;
    specialite: string;
  };
  userId?: string;
  
  // NOUVEAU: Audit Trail
  createdBy?: string | {
    _id: string;
    username: string;
    email: string;
  };
  updatedBy?: string | {
    _id: string;
    username: string;
    email: string;
  };
  deletedAt?: Date | null;
  deletedBy?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Réponse paginée pour les patients
 */
export interface PatientPageResponse {
  success: boolean;
  data: {
    content: Patient[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  };
}
