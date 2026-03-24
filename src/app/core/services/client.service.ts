import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id?: number;
  nom_entreprise: string;
  contact_nom: string;
  telephone: string;
  email: string;
  adresse: string;
  rccm: string;
  ifu: string;
  regime_imposition: string;
  division_fiscale: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  // URL avec slash final
  private apiUrl = '/api/v1/clients/';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}${id}/`);
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}${id}/`, client);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}