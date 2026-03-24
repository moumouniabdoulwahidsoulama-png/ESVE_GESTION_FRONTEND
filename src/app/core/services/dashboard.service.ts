import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  ca_mensuel: number;
  nb_factures: number;
  total_attente: number;
  nb_clients: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/v1/dashboard';

  constructor(private http: HttpClient) { }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/`);
  }
}