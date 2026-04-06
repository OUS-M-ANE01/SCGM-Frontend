import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, shareReplay } from 'rxjs';
import { DashboardResponse, DashboardStats } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

/**
 * Service Dashboard avec cache
 * 
 * Utilise BehaviorSubject pour partager l'état entre composants
 * et éviter les rechargements inutiles
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  // Cache des statistiques avec BehaviorSubject
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  // Cache de la requête HTTP
  private statsCache$: Observable<DashboardResponse> | null = null;
  private cacheTime = 0;
  private readonly CACHE_DURATION = 300000; // 5 minutes

  /**
   * Récupérer les stats avec cache
   */
  getStats(forceRefresh = false): Observable<DashboardResponse> {
    const now = Date.now();
    
    // Si cache valide et pas de refresh forcé, retourner le cache
    if (!forceRefresh && this.statsCache$ && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.statsCache$;
    }

    // Sinon, faire une nouvelle requête
    this.cacheTime = now;
    this.statsCache$ = this.http.get<DashboardResponse>(`${this.API_URL}/stats`).pipe(
      tap(response => {
        // Mettre à jour le BehaviorSubject
        this.statsSubject.next(response.data);
      }),
      shareReplay(1) // Partager le résultat entre tous les abonnés
    );

    return this.statsCache$;
  }

  /**
   * Forcer le rafraîchissement des stats
   */
  refreshStats(): Observable<DashboardResponse> {
    return this.getStats(true);
  }

  /**
   * Obtenir les stats actuelles sans requête HTTP
   */
  getCurrentStats(): DashboardStats | null {
    return this.statsSubject.value;
  }
}
