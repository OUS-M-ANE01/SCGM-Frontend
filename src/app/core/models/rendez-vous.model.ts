import { Patient } from './patient.model';
import { Medecin } from './medecin.model';

/**
 * Modèle RendezVous
 */
export interface RendezVous {
  _id?: string;
  dateHeure: Date | string;
  statut: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE';
  motif: string;
  notes?: string;
  patientId: string | Patient; // Peut être un ID ou un objet Patient (populate)
  medecinId: string | Medecin; // Peut être un ID ou un objet Medecin (populate)
  
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
  
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Réponse paginée pour les rendez-vous
 */
export interface RendezVousPageResponse {
  success: boolean;
  data: {
    content: RendezVous[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  };
}
