import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, shareReplay } from 'rxjs';
import { Patient, PatientPageResponse } from '../models/patient.model';
import { environment } from '../../../environments/environment';

/**
 * Service Patient avec cache
 * 
 * Gère toutes les opérations CRUD pour les patients
 * Utilise BehaviorSubject pour partager l'état
 */
@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/patients`;

  // Cache des patients
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  private patientsCache: Map<string, Observable<PatientPageResponse>> = new Map();
  private cacheTime: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 300000; // 5 minutes (plus long pour éviter les rechargements)

  /**
   * Récupérer la liste paginée des patients avec cache
   */
  getPatients(page: number = 0, size: number = 10, sortBy: string = 'nom'): Observable<PatientPageResponse> {
    const cacheKey = `${page}-${size}-${sortBy}`;
    const now = Date.now();
    const cachedTime = this.cacheTime.get(cacheKey) || 0;

    // Vérifier le cache
    if (this.patientsCache.has(cacheKey) && (now - cachedTime) < this.CACHE_DURATION) {
      return this.patientsCache.get(cacheKey)!;
    }

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy);

    const request$ = this.http.get<PatientPageResponse>(this.API_URL, { params }).pipe(
      tap(response => {
        // Mettre à jour le BehaviorSubject avec le tableau de patients
        this.patientsSubject.next(response.data.content);
      }),
      shareReplay(1)
    );

    this.patientsCache.set(cacheKey, request$);
    this.cacheTime.set(cacheKey, now);

    return request$;
  }

  /**
   * Rechercher des patients par mot-clé
   */
  searchPatients(keyword: string, page: number = 0, size: number = 10): Observable<PatientPageResponse> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PatientPageResponse>(`${this.API_URL}/search`, { params }).pipe(
      tap(response => {
        // Mettre à jour le BehaviorSubject avec le tableau de patients
        this.patientsSubject.next(response.data.content);
      })
    );
  }

  /**
   * Récupérer un patient par ID
   */
  getPatientById(id: string): Observable<{ success: boolean; data: Patient }> {
    return this.http.get<{ success: boolean; data: Patient }>(`${this.API_URL}/${id}`);
  }

  /**
   * Créer un nouveau patient
   */
  createPatient(patient: Patient): Observable<{ success: boolean; message: string; data: Patient }> {
    return this.http.post<{ success: boolean; message: string; data: Patient }>(this.API_URL, patient).pipe(
      tap(() => this.clearCache())
    );
  }

  /**
   * Mettre à jour un patient
   */
  updatePatient(id: string, patient: Patient): Observable<{ success: boolean; message: string; data: Patient }> {
    return this.http.put<{ success: boolean; message: string; data: Patient }>(`${this.API_URL}/${id}`, patient).pipe(
      tap(() => this.clearCache())
    );
  }

  /**
   * Supprimer un patient
   */
  deletePatient(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  /**
   * Vider le cache
   */
  private clearCache(): void {
    this.patientsCache.clear();
    this.cacheTime.clear();
  }
}
