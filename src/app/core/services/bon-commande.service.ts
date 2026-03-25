import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LigneBonCommande {
  id?:                    number;
  description:            string;
  reference_client?:      string;
  reference_fournisseur?: string;
  prix_unitaire_ht:       number;
  quantite:               number;
  total_ht?:              number;
  unite?:                 string;
  delais?:                string;
  ordre?:                 number;
}

export interface BonCommande {
  id?:                           number;
  numero?:                       string;
  statut?:                       string;
  fournisseur_nom:               string;
  fournisseur_contact?:          string;
  fournisseur_tel?:              string;
  fournisseur_email?:            string;
  fournisseur_adresse?:          string;
  fournisseur_ifu?:              string;
  fournisseur_rccm?:             string;
  fournisseur_division_fiscale?: string;
  fournisseur_regime?:           string;
  ref_proforma_fournisseur?:     string;
  date_proforma_fournisseur?:    string;
  termes_paiement?:              string;
  termes_livraison?:             string;
  delais_livraison?:             string;
  date_commande?:                string;
  date_livraison_prev?:          string;
  objet?:                        string;
  notes?:                        string;

  // Options de calcul ← AJOUTÉS
  appliquer_tva?:       boolean;
  appliquer_retenue?:   boolean;
  appliquer_bic?:       boolean;
  appliquer_transport?: boolean;

  // Montants
  montant_transport?:   number;   // ← AJOUTÉ
  total_ht?:            number;
  tva_18pct?:           number;
  retenue_5pct?:        number;
  bic_2pct?:            number;
  total_net?:           number;

  pdf_file?:            string;
  lignes:               LigneBonCommande[];
}

@Injectable({ providedIn: 'root' })
export class BonCommandeService {
  private apiUrl = '/api/v1/commandes/';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<BonCommande> {
    return this.http.get<BonCommande>(`${this.apiUrl}${id}/`);
  }

  create(bon: Partial<BonCommande>): Observable<BonCommande> {
    return this.http.post<BonCommande>(this.apiUrl, bon);
  }

  update(id: number, bon: Partial<BonCommande>): Observable<BonCommande> {
    return this.http.put<BonCommande>(`${this.apiUrl}${id}/`, bon);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${id}/pdf/`, { responseType: 'blob' });
  }

  genererPdf(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}${id}/generer_pdf/`, {});
  }
}