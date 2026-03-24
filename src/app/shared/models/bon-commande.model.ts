export interface LigneBonCommande {
  id?: number;
  description: string;
  reference_client?: string;
  prix_unitaire_ht: number;
  quantite: number;
  total_ht?: number;
}

export interface BonCommande {
  id?: number;
  numero: string;
  fournisseur: string;
  date_commande: string;
  statut: string;
  total_ht: number;
  retenue_5pct: number;
  bic_2pct: number;
  total_net: number;
  pdf_file?: string;
  lignes: LigneBonCommande[];
}