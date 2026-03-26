import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LigneFacture {
  id?:                    number;
  description:            string;
  reference_client?:      string;
  reference_fournisseur?: string;
  prix_unitaire_ht:       number;
  quantite:               number;
  total_ht?:              number;
  delais?:                string;
  ordre?:                 number;
}

export interface Facture {
  id?:                  number;
  numero?:              string;
  type_doc:             'PROFORMA' | 'FACTURE';
  statut?:              string;
  client:               number;
  client_detail?:       any;
  proforma_origine?:    number;
  date_creation?:       string;
  validite_jours?:      number;
  termes_paiement?:     string;   // ← AJOUTÉ

  // Options de calcul
  appliquer_remise?:    boolean;
  appliquer_tva?:       boolean;
  appliquer_retenue?:   boolean;
  appliquer_bic?:       boolean;
  appliquer_transport?: boolean;

  // Montants
  remise_pct?:          number;
  montant_transport?:   number;
  total_ht_brut?:       number;
  montant_remise?:      number;
  total_ht?:            number;
  tva_18pct?:           number;
  retenue_5pct?:        number;
  bic_2pct?:            number;
  total_net?:           number;

  pdf_file?:            string;
  notes?:               string;
  lignes:               LigneFacture[];
}

@Injectable({ providedIn: 'root' })
export class FactureService {
  private apiUrl = '/api/v1/factures/';

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.apiUrl}${id}/`);
  }

  create(facture: Partial<Facture>): Observable<Facture> {
    return this.http.post<Facture>(this.apiUrl, facture);
  }

  update(id: number, facture: Partial<Facture>): Observable<Facture> {
    return this.http.put<Facture>(`${this.apiUrl}${id}/`, facture);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  valider(id: number): Observable<Facture> {
    return this.http.post<Facture>(`${this.apiUrl}${id}/valider/`, {});
  }

  genererPdf(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}${id}/generer_pdf/`, {});
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${id}/pdf/`, { responseType: 'blob' });
  }
}