import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { BonCommandeService, BonCommande } from '../../../core/services/bon-commande.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-bon-commande-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './bon-commande-list.component.html',
  styleUrls: ['./bon-commande-list.component.scss']
})
export class BonCommandeListComponent implements OnInit {
  bons: BonCommande[]  = [];
  displayedColumns     = ['numero', 'fournisseur_nom', 'date_commande', 'total_net', 'statut', 'actions'];
  isLoading            = true;
  errorMessage         = '';

  constructor(
    private bonCommandeService: BonCommandeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBons();
  }

  isClient(): boolean {
    return this.authService.isClient();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadBons(): void {
    this.isLoading = true;
    this.bonCommandeService.getAll().subscribe({
      next: (data: any) => {
        this.bons      = data.results ? data.results : data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement bons:', error);
        this.errorMessage = 'Impossible de charger les bons de commande';
        this.isLoading    = false;
      }
    });
  }

  telechargerPdf(id: number, numero: string): void {
    this.bonCommandeService.downloadPdf(id!).subscribe({
      next: (blob) => {
        const url  = window.URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${numero}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur PDF:', error);
        alert('Erreur lors du téléchargement PDF');
      }
    });
  }

  supprimerBon(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce bon de commande ?')) {
      this.bonCommandeService.delete(id!).subscribe({
        next: () => this.loadBons(),
        error: (error) => {
          console.error('Erreur suppression:', error);
          alert('Impossible de supprimer ce bon');
        }
      });
    }
  }
}