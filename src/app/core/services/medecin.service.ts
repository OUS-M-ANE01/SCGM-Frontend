import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, shareReplay } from 'rxjs';
import { Medecin, MedecinPageResponse } from '../models/medecin.model';
import { environment } from '../../../environments/environment';

/**
 * Service Medecin avec cache
 */
@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/medecins`;

  private medecinsCache: Map<string, Observable<MedecinPageResponse>> = new Map();
  private cacheTime: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 300000; // 5 minutes

  getMedecins(page: number = 0, size: number = 10): Observable<MedecinPageResponse> {
    const cacheKey = `${page}-${size}`;
    const now = Date.now();
    const cachedTime = this.cacheTime.get(cacheKey) || 0;

    if (this.medecinsCache.has(cacheKey) && (now - cachedTime) < this.CACHE_DURATION) {
      return this.medecinsCache.get(cacheKey)!;
    }

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    const request$ = this.http.get<MedecinPageResponse>(this.API_URL, { params }).pipe(
      shareReplay(1)
    );

    this.medecinsCache.set(cacheKey, request$);
    this.cacheTime.set(cacheKey, now);

    return request$;
  }

  searchMedecins(keyword: string, page: number = 0, size: number = 10): Observable<MedecinPageResponse> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<MedecinPageResponse>(`${this.API_URL}/search`, { params });
  }

  getMedecinById(id: string): Observable<{ success: boolean; data: Medecin }> {
    return this.http.get<{ success: boolean; data: Medecin }>(`${this.API_URL}/${id}`);
  }

  createMedecin(medecin: Medecin): Observable<{ success: boolean; message: string; data: Medecin }> {
    return this.http.post<{ success: boolean; message: string; data: Medecin }>(this.API_URL, medecin).pipe(
      tap(() => this.clearCache())
    );
  }

  updateMedecin(id: string, medecin: Medecin): Observable<{ success: boolean; message: string; data: Medecin }> {
    return this.http.put<{ success: boolean; message: string; data: Medecin }>(`${this.API_URL}/${id}`, medecin).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteMedecin(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache(): void {
    this.medecinsCache.clear();
    this.cacheTime.clear();
  }
}
