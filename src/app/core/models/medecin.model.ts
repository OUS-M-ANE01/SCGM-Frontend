/**
 * Modèle Medecin
 */
export interface Medecin {
  _id?: string;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  matricule: string;
  disponible: boolean;
  
  // NOUVEAU: Relations
  userId?: string | {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  
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
 * Réponse paginée pour les médecins
 */
export interface MedecinPageResponse {
  success: boolean;
  data: {
    content: Medecin[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  };
}
