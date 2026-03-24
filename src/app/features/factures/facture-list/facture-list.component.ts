import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { FactureService, Facture } from '../../../core/services/facture.service';

@Component({
  selector: 'app-facture-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    RouterLink
  ],
  templateUrl: './facture-list.component.html',
  styleUrl: './facture-list.component.scss'
})
export class FactureListComponent implements OnInit {
  factures: Facture[]  = [];
  isLoading            = true;
  errorMessage         = '';
  displayedColumns     = ['numero', 'client', 'type_doc', 'statut', 'total_net', 'actions'];

  constructor(private factureService: FactureService) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.isLoading = true;
    this.factureService.getAll().subscribe({
      next: (data: any) => {
        this.factures  = data.results ? data.results : data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement factures:', error);
        this.errorMessage = 'Impossible de charger les factures';
        this.isLoading    = false;
      }
    });
  }

  validerProforma(id: number): void {
    if (confirm('Convertir cette proforma en facture définitive ?')) {
      this.factureService.valider(id).subscribe({
        next: () => {
          alert('Proforma validée avec succès !');
          this.loadFactures();
        },
        error: (error) => {
          console.error('Erreur validation:', error);
          alert('Erreur lors de la validation');
        }
      });
    }
  }

  telechargerPdf(id: number, numero: string): void {
    this.factureService.downloadPdf(id).subscribe({
      next: (blob) => {
        const url    = window.URL.createObjectURL(blob);
        const a      = document.createElement('a');
        a.href       = url;
        a.download   = `${numero}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur téléchargement PDF:', error);
        alert('Erreur lors du téléchargement');
      }
    });
  }

  deleteFacture(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette facture ?')) {
      this.factureService.delete(id).subscribe({
        next: () => this.loadFactures(),
        error: (error) => {
          console.error('Erreur suppression:', error);
          alert('Impossible de supprimer cette facture');
        }
      });
    }
  }
}