/**
 * Modèle pour les statistiques du dashboard
 */
export interface DashboardStats {
  totalPatients: number;
  totalMedecins: number;
  totalRendezVous: number;
  rendezVousParStatut: {
    enAttente: number;
    confirme: number;
    annule: number;
    termine: number;
  };
  rdvAujourdhui: number;
  rdvAVenir: number;
  rdvParSpecialite: {
    specialite: string;
    count: number;
  }[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}
