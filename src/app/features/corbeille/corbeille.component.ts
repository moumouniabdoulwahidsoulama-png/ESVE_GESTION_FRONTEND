import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-corbeille',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTabsModule, MatTooltipModule],
  template: `
<div style="padding:24px; max-width:1100px; margin:0 auto;">

  <div style="display:flex; align-items:center; gap:16px; margin-bottom:28px;">
    <div style="width:48px; height:48px; background:#FFEBEE; border-radius:12px;
                display:flex; align-items:center; justify-content:center; font-size:24px;">
      🗑️
    </div>
    <div>
      <h1 style="margin:0; font-size:24px; color:#1A1A2E;">Corbeille</h1>
      <p style="margin:4px 0 0; color:#888; font-size:14px;">
        Restaurez ou supprimez définitivement vos documents
      </p>
    </div>
  </div>

  <div *ngIf="successMessage" style="color:green; padding:12px; margin-bottom:16px;
              background:#E8F5E9; border-radius:6px;">✅ {{ successMessage }}</div>
  <div *ngIf="errorMessage" style="color:red; padding:12px; margin-bottom:16px;
              background:#FFEBEE; border-radius:6px;">⚠️ {{ errorMessage }}</div>

  <mat-tab-group>

    <!-- FACTURES SUPPRIMÉES -->
    <mat-tab label="🧾 Factures & Proformas ({{ factures.length }})">
      <div style="padding:20px 0;">

        <div *ngIf="isLoadingF" style="text-align:center; padding:40px; color:#888;">
          Chargement...
        </div>

        <div *ngIf="!isLoadingF && factures.length === 0"
             style="text-align:center; padding:60px; color:#888;">
          Aucune facture dans la corbeille ✅
        </div>

        <table *ngIf="!isLoadingF && factures.length > 0"
               style="width:100%; border-collapse:collapse; background:white;
                      border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <thead>
            <tr style="background:#1A1A2E; color:white;">
              <th style="padding:14px 20px; text-align:left; font-size:13px;">Numéro</th>
              <th style="padding:14px 16px; text-align:left; font-size:13px;">Client</th>
              <th style="padding:14px 16px; text-align:left; font-size:13px;">Type</th>
              <th style="padding:14px 16px; text-align:left; font-size:13px;">Total</th>
              <th style="padding:14px 16px; text-align:center; font-size:13px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of factures; let i = index"
                [style.background]="i % 2 === 0 ? 'white' : '#FFF5F5'"
                style="border-bottom:1px solid #FFE0E0;">
              <td style="padding:12px 20px; font-size:13px; color:#888;">
                <s>{{ f.numero }}</s>
              </td>
              <td style="padding:12px 16px; font-size:13px;">
                {{ f.client_detail?.nom_entreprise || '—' }}
              </td>
              <td style="padding:12px 16px;">
                <span [style.background]="f.type_doc === 'PROFORMA' ? '#E3F2FD' : '#E8F5E9'"
                      [style.color]="f.type_doc === 'PROFORMA' ? '#1565C0' : '#2E7D32'"
                      style="padding:3px 8px; border-radius:12px; font-size:11px; font-weight:700;">
                  {{ f.type_doc }}
                </span>
              </td>
              <td style="padding:12px 16px; font-size:13px;">
                {{ f.total_net | number:'1.0-0' }} FCFA
              </td>
              <td style="padding:12px 16px; text-align:center;">
                <div style="display:flex; gap:8px; justify-content:center;">
                  <button mat-raised-button
                          matTooltip="Restaurer"
                          (click)="restaurerFacture(f)"
                          style="background:#E8F5E9; color:#2E7D32; font-size:12px; min-width:0; padding:4px 12px;">
                    ♻️ Restaurer
                  </button>
                  <button mat-raised-button
                          matTooltip="Supprimer définitivement"
                          (click)="supprimerDefFacture(f)"
                          style="background:#FFEBEE; color:#C62828; font-size:12px; min-width:0; padding:4px 12px;">
                    🗑️ Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </mat-tab>

    <!-- BONS SUPPRIMÉS -->
    <mat-tab label="📦 Bons de commande ({{ bons.length }})">
      <div style="padding:20px 0;">

        <div *ngIf="isLoadingB" style="text-align:center; padding:40px; color:#888;">
          Chargement...
        </div>

        <div *ngIf="!isLoadingB && bons.length === 0"
             style="text-align:center; padding:60px; color:#888;">
          Aucun bon de commande dans la corbeille ✅
        </div>

        <table *ngIf="!isLoadingB && bons.length > 0"
               style="width:100%; border-collapse:collapse; background:white;
                      border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <thead>
            <tr style="background:#1A1A2E; color:white;">
              <th style="padding:14px 20px; text-align:left; font-size:13px;">Numéro</th>
              <th style="padding:14px 16px; text-align:left; font-size:13px;">Fournisseur</th>
              <th style="padding:14px 16px; text-align:left; font-size:13px;">Total</th>
              <th style="padding:14px 16px; text-align:center; font-size:13px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of bons; let i = index"
                [style.background]="i % 2 === 0 ? 'white' : '#FFF5F5'"
                style="border-bottom:1px solid #FFE0E0;">
              <td style="padding:12px 20px; font-size:13px; color:#888;"><s>{{ b.numero }}</s></td>
              <td style="padding:12px 16px; font-size:13px;">{{ b.fournisseur_nom }}</td>
              <td style="padding:12px 16px; font-size:13px;">{{ b.total_net | number:'1.0-0' }} FCFA</td>
              <td style="padding:12px 16px; text-align:center;">
                <div style="display:flex; gap:8px; justify-content:center;">
                  <button mat-raised-button (click)="restaurerBon(b)"
                          style="background:#E8F5E9; color:#2E7D32; font-size:12px; min-width:0; padding:4px 12px;">
                    ♻️ Restaurer
                  </button>
                  <button mat-raised-button (click)="supprimerDefBon(b)"
                          style="background:#FFEBEE; color:#C62828; font-size:12px; min-width:0; padding:4px 12px;">
                    🗑️ Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </mat-tab>

  </mat-tab-group>
</div>
  `
})
export class CorbeilleComponent implements OnInit {
  factures:   any[] = [];
  bons:       any[] = [];
  isLoadingF = true;
  isLoadingB = true;
  successMessage = '';
  errorMessage   = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFactures();
    this.loadBons();
  }

  loadFactures(): void {
    this.isLoadingF = true;
    this.http.get<any>('/api/v1/factures/?corbeille=1').subscribe({
      next:  (d) => { this.factures = d.results ?? d; this.isLoadingF = false; },
      error: ()  => { this.isLoadingF = false; }
    });
  }

  loadBons(): void {
    this.isLoadingB = true;
    this.http.get<any>('/api/v1/commandes/?corbeille=1').subscribe({
      next:  (d) => { this.bons = d.results ?? d; this.isLoadingB = false; },
      error: ()  => { this.isLoadingB = false; }
    });
  }

  restaurerFacture(f: any): void {
    this.http.post(`/api/v1/factures/${f.id}/restaurer/`, {}).subscribe({
      next: () => {
        this.factures = this.factures.filter(x => x.id !== f.id);
        this.msg(`Facture ${f.numero} restaurée ✅`);
      },
      error: () => this.err('Erreur lors de la restauration.')
    });
  }

  supprimerDefFacture(f: any): void {
    if (!confirm(`Supprimer définitivement ${f.numero} ? Impossible de récupérer après.`)) return;
    this.http.delete(`/api/v1/factures/${f.id}/supprimer_definitif/`).subscribe({
      next: () => { this.factures = this.factures.filter(x => x.id !== f.id); this.msg('Supprimé définitivement.'); },
      error: () => this.err('Erreur lors de la suppression.')
    });
  }

  restaurerBon(b: any): void {
    this.http.post(`/api/v1/commandes/${b.id}/restaurer/`, {}).subscribe({
      next: () => { this.bons = this.bons.filter(x => x.id !== b.id); this.msg(`Bon ${b.numero} restauré ✅`); },
      error: () => this.err('Erreur lors de la restauration.')
    });
  }

  supprimerDefBon(b: any): void {
    if (!confirm(`Supprimer définitivement ${b.numero} ?`)) return;
    this.http.delete(`/api/v1/commandes/${b.id}/supprimer_definitif/`).subscribe({
      next: () => { this.bons = this.bons.filter(x => x.id !== b.id); this.msg('Supprimé définitivement.'); },
      error: () => this.err('Erreur lors de la suppression.')
    });
  }

  msg(m: string): void { this.successMessage = m; setTimeout(() => this.successMessage = '', 4000); }
  err(m: string): void { this.errorMessage   = m; setTimeout(() => this.errorMessage   = '', 4000); }
}