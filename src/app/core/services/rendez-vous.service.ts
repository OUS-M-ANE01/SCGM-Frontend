import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, shareReplay } from 'rxjs';
import { RendezVous, RendezVousPageResponse } from '../models/rendez-vous.model';
import { environment } from '../../../environments/environment';

/**
 * Service RendezVous avec cache
 */
@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/rdv`;

  private rdvCache: Map<string, Observable<RendezVousPageResponse>> = new Map();
  private cacheTime: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 300000; // 5 minutes

  getRendezVous(
    page: number = 0,
    size: number = 10,
    statut?: string,
    medecinId?: string,
    patientId?: string
  ): Observable<RendezVousPageResponse> {
    const cacheKey = `${page}-${size}-${statut || ''}-${medecinId || ''}-${patientId || ''}`;
    const now = Date.now();
    const cachedTime = this.cacheTime.get(cacheKey) || 0;

    if (this.rdvCache.has(cacheKey) && (now - cachedTime) < this.CACHE_DURATION) {
      return this.rdvCache.get(cacheKey)!;
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (statut) params = params.set('statut', statut);
    if (medecinId) params = params.set('medecinId', medecinId);
    if (patientId) params = params.set('patientId', patientId);

    const request$ = this.http.get<RendezVousPageResponse>(this.API_URL, { params }).pipe(
      shareReplay(1)
    );

    this.rdvCache.set(cacheKey, request$);
    this.cacheTime.set(cacheKey, now);

    return request$;
  }

  getRendezVousById(id: string): Observable<{ success: boolean; data: RendezVous }> {
    return this.http.get<{ success: boolean; data: RendezVous }>(`${this.API_URL}/${id}`);
  }

  createRendezVous(rdv: RendezVous): Observable<{ success: boolean; message: string; data: RendezVous }> {
    return this.http.post<{ success: boolean; message: string; data: RendezVous }>(this.API_URL, rdv).pipe(
      tap(() => this.clearCache())
    );
  }

  updateRendezVous(id: string, rdv: Partial<RendezVous>): Observable<{ success: boolean; message: string; data: RendezVous }> {
    return this.http.put<{ success: boolean; message: string; data: RendezVous }>(`${this.API_URL}/${id}`, rdv).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteRendezVous(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache(): void {
    this.rdvCache.clear();
    this.cacheTime.clear();
  }
}
