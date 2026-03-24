import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FactureService, Facture } from '../../../core/services/facture.service';
import { ClientService, Client } from '../../../core/services/client.service';

@Component({
  selector: 'app-facture-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTooltipModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './facture-list.component.html',
  styleUrls: ['./facture-list.component.scss']
})
export class FactureListComponent implements OnInit {
  factures: Facture[] = [];
  clients: Client[] = [];
  displayedColumns: string[] = ['numero', 'client', 'date_creation', 'type_doc', 'total_ttc', 'statut', 'actions'];

  // Filtres
  filterType: string = '';
  filterStatut: string = '';
  filterDateDebut?: Date;
  filterDateFin?: Date;

  constructor(
    private factureService: FactureService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadFactures();
  }

  loadClients(): void {
    this.clients = [
      { id: 1, nom_entreprise: 'Entreprise A', contact_nom: 'Jean Dupont', telephone: '70123456', email: 'a@a.com', adresse: 'Ouaga', rccm: 'RCCM1', ifu: 'IFU1', regime_imposition: 'Régime réel', division_fiscale: 'D1' },
      { id: 2, nom_entreprise: 'Entreprise B', contact_nom: 'Marie Diallo', telephone: '70987654', email: 'b@b.com', adresse: 'Bobo', rccm: 'RCCM2', ifu: 'IFU2', regime_imposition: 'Régime simplifié', division_fiscale: 'D2' }
    ];
  }

  loadFactures(): void {
    // Données mock avec les nouveaux champs
    const mockFactures: Facture[] = [
      {
        id: 1,
        numero: 'ESVE25-ID0001-P-001',
        client: 1,
        type_doc: 'PROFORMA',
        statut: 'BROUILLON',
        date_creation: new Date().toISOString().split('T')[0],
        total_ht: 100000,
        remise_pourcentage: 10,
        total_apres_remise: 90000,
        tva: 16200,
        retenue_5pct: 4500,
        bic_2pct: 1800,
        total_net: 83700,
        total_ttc: 106200,
        lignes: []
      },
      {
        id: 2,
        numero: 'ESVE25-ID0002-F-002',
        client: 2,
        type_doc: 'FACTURE',
        statut: 'ENVOYE',
        date_creation: new Date().toISOString().split('T')[0],
        total_ht: 250000,
        remise_pourcentage: 0,
        total_apres_remise: 250000,
        tva: 45000,
        retenue_5pct: 12500,
        bic_2pct: 5000,
        total_net: 232500,
        total_ttc: 295000,
        lignes: []
      }
    ];
    this.factures = mockFactures;
  }

  // ... le reste des méthodes (buildParams, appliquerFiltres, resetFiltres, getClientName, getTypeLabel, getStatutClass, validerProforma, telechargerPdf, supprimerFacture) reste identique
}