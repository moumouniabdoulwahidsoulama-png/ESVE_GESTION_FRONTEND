import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/v1/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ✅ CORRIGÉ — lit l'ID depuis localStorage
  getCurrentUserId(): number {
    if (isPlatformBrowser(this.platformId)) {
      return parseInt(localStorage.getItem('user_id') || '0', 10);
    }
    return 0;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login/`, { username: email, password })
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token',  response.access);
            localStorage.setItem('refresh_token', response.refresh);
          }
        })
      );
  }

  chargerProfil(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me/`).pipe(
      tap(profil => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user_role',  profil.role);
          localStorage.setItem('user_email', profil.email);
          localStorage.setItem('user_id',    String(profil.id));
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  getRole(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('user_role') || 'EMPLOYE';
    }
    return 'EMPLOYE';
  }

  isAdmin(): boolean   { return this.getRole() === 'ADMIN'; }
  isEmploye(): boolean { return this.getRole() === 'ADMIN' || this.getRole() === 'EMPLOYE'; }
  isClient(): boolean  { return this.getRole() === 'CLIENT'; }
  isLoggedIn(): boolean { return !!this.getToken(); }

  refreshToken(): Observable<any> {
    const refresh = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('refresh_token') : null;
    return this.http.post<any>(`${this.apiUrl}/refresh/`, { refresh })
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', response.access);
          }
        })
      );
  }
}