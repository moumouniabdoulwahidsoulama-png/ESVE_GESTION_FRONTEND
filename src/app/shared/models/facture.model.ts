import { Client } from './client.model';

export interface LigneFacture {
  id?: number;
  description: string;
  reference_client?: string;
  prix_unitaire_ht: number;
  quantite: number;
  total_ht?: number;
}

export interface Facture {
  id?: number;
  numero: string;
  client: Client | number;
  type_doc: 'PROFORMA' | 'FACTURE';
  statut: 'BROUILLON' | 'ENVOYE' | 'PAYE';
  date_creation: string;
  total_ht: number;
  retenue_5pct: number;
  bic_2pct: number;
  total_net: number;
  proforma_origine?: number;
  pdf_file?: string;
  lignes: LigneFacture[];
}