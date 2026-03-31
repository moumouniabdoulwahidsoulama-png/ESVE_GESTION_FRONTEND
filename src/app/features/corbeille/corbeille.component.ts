import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-corbeille',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
  ],
  template: `
<div style="padding:24px;">

  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
    <div>
      <h1 style="margin:0; font-size:22px; color:#1A1A2E;">🗑️ Corbeille</h1>
      <p style="margin:4px 0 0; color:#888; font-size:14px;">
        Documents supprimés — restaurez-les ou supprimez-les définitivement
      </p>
    </div>
  </div>

  <!-- Messages -->
  <div *ngIf="message" [style.background]="messageType === 'success' ? '#E8F5E9' : '#FFEBEE'"
       [style.color]="messageType === 'success' ? 'green' : 'red'"
       style="padding:12px; border-radius:6px; margin-bottom:16px;">
    {{ message }}
  </div>

  <!-- Onglets -->
  <mat-tab-group>

    <!-- ===== FACTURES & PROFORMAS ===== -->
    <mat-tab label="📄 Factures & Proformas ({{ factures.length }})">
      <div style="margin-top:16px;">
        <div *ngIf="isLoadingF" style="text-align:center; padding:40px; color:#888;">
          Chargement...
        </div>
        <div *ngIf="!isLoadingF && factures.length === 0"
             style="text-align:center; padding:40px; color:#888;">
          La corbeille est vide
        </div>
        <table *ngIf="!isLoadingF && factures.length > 0"
               mat-table [dataSource]="factures" style="width:100%; border-radius:8px; overflow:hidden;">

          <!-- Numéro -->
          <ng-container matColumnDef="numero">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px;">
              N° Document
            </th>
            <td mat-cell *matCellDef="let f" style="padding:12px 16px;">
              <span style="font-weight:600; color:#D4A017;">{{ f.numero }}</span>
            </td>
          </ng-container>

          <!-- Type -->
          <ng-container matColumnDef="type_doc">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px;">
              Type
            </th>
            <td mat-cell *matCellDef="let f" style="padding:12px 16px;">
              <span [style.background]="f.type_doc === 'PROFORMA' ? '#FFF3E0' : '#E3F2FD'"
                    [style.color]="f.type_doc === 'PROFORMA' ? '#E65100' : '#1565C0'"
                    style="padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600;">
                {{ f.type_doc }}
              </span>
            </td>
          </ng-container>

          <!-- Client -->
          <ng-container matColumnDef="client">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px;">
              Client
            </th>
            <td mat-cell *matCellDef="let f" style="padding:12px 16px;">
              {{ f.client_detail?.nom_entreprise || '—' }}
            </td>
          </ng-container>

          <!-- Total -->
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px;">
              Total TTC
            </th>
            <td mat-cell *matCellDef="let f" style="padding:12px 16px;">
              {{ f.total_net | number:'1.0-0' }} XOF
            </td>
          </ng-container>

          <!-- Supprimé le -->
          <ng-container matColumnDef="date_deleted">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px;">
              Supprimé le
            </th>
            <td mat-cell *matCellDef="let f" style="padding:12px 16px; color:#888; font-size:13px;">
              {{ f.date_deleted ? (f.date_deleted | date:'dd/MM/yyyy HH:mm') : '—' }}
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px; text-align:right;">
              Actions
            </th>
            <td mat-cell *matCellDef="let f" style="padding:12px 16px; text-align:right;">
              <button mat-icon-button
                      matTooltip="Restaurer"
                      (click)="restaurerFacture(f.id)"
                      style="color:#2E7D32;">
                <mat-icon>restore</mat-icon>
              </button>
              <button mat-icon-button
                      matTooltip="Supprimer définitivement"
                      (click)="supprimerDefinitivementFacture(f.id, f.numero)"
                      style="color:#C62828;">
                <mat-icon>delete_forever</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colsFactures"></tr>
          <tr mat-row *matRowDef="let row; columns: colsFactures;"
              style="border-bottom:1px solid #F5F5F5;"></tr>
        </table>
      </div>
    </mat-tab>

    <!-- ===== BONS DE COMMANDE ===== -->
    <mat-tab label="📦 Bons de commande ({{ bons.length }})">
      <div style="margin-top:16px;">
        <div *ngIf="isLoadingB" style="text-align:center; padding:40px; color:#888;">
          Chargement...
        </div>
        <div *ngIf="!isLoadingB && bons.length === 0"
             style="text-align:center; padding:40px; color:#888;">
          La corbeille est vide
        </div>
        <table *ngIf="!isLoadingB && bons.length > 0"
               mat-table [dataSource]="bons" style="width:100%; border-radius:8px; overflow:hidden;">

          <!-- Numéro -->
          <ng-container matColumnDef="numero">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px;">
              N° Document
            </th>
            <td mat-cell *matCellDef="let b" style="padding:12px 16px;">
              <span style="font-weight:600; color:#D4A017;">{{ b.numero }}</span>
            </td>
          </ng-container>

          <!-- Fournisseur -->
          <ng-container matColumnDef="fournisseur">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px;">
              Fournisseur
            </th>
            <td mat-cell *matCellDef="let b" style="padding:12px 16px;">
              {{ b.fournisseur_nom }}
            </td>
          </ng-container>

          <!-- Total -->
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px;">
              Total TTC
            </th>
            <td mat-cell *matCellDef="let b" style="padding:12px 16px;">
              {{ b.total_net | number:'1.0-0' }} XOF
            </td>
          </ng-container>

          <!-- Supprimé le -->
          <ng-container matColumnDef="date_deleted">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px;">
              Supprimé le
            </th>
            <td mat-cell *matCellDef="let b" style="padding:12px 16px; color:#888; font-size:13px;">
              {{ b.date_deleted ? (b.date_deleted | date:'dd/MM/yyyy HH:mm') : '—' }}
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef
                style="background:#1A1A2E; color:white; font-weight:600; padding:12px 16px; text-align:right;">
              Actions
            </th>
            <td mat-cell *matCellDef="let b" style="padding:12px 16px; text-align:right;">
              <button mat-icon-button
                      matTooltip="Restaurer"
                      (click)="restaurerBon(b.id)"
                      style="color:#2E7D32;">
                <mat-icon>restore</mat-icon>
              </button>
              <button mat-icon-button
                      matTooltip="Supprimer définitivement"
                      (click)="supprimerDefinitivementBon(b.id, b.numero)"
                      style="color:#C62828;">
                <mat-icon>delete_forever</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colsBons"></tr>
          <tr mat-row *matRowDef="let row; columns: colsBons;"
              style="border-bottom:1px solid #F5F5F5;"></tr>
        </table>
      </div>
    </mat-tab>

  </mat-tab-group>
</div>
  `
})
export class CorbeilleComponent implements OnInit {
  factures:    any[] = [];
  bons:        any[] = [];
  isLoadingF = true;
  isLoadingB = true;
  message    = '';
  messageType: 'success' | 'error' = 'success';

  colsFactures = ['numero', 'type_doc', 'client', 'total', 'date_deleted', 'actions'];
  colsBons     = ['numero', 'fournisseur', 'total', 'date_deleted', 'actions'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chargerFactures();
    this.chargerBons();
  }

  chargerFactures(): void {
    this.isLoadingF = true;
    this.http.get<any[]>('/api/v1/factures/corbeille/').subscribe({
      next: (data) => { this.factures = data; this.isLoadingF = false; },
      error: () => { this.isLoadingF = false; }
    });
  }

  chargerBons(): void {
    this.isLoadingB = true;
    this.http.get<any[]>('/api/v1/commandes/corbeille/').subscribe({
      next: (data) => { this.bons = data; this.isLoadingB = false; },
      error: () => { this.isLoadingB = false; }
    });
  }

  restaurerFacture(id: number): void {
    this.http.post(`/api/v1/factures/${id}/restaurer/`, {}).subscribe({
      next: () => {
        this.afficherMessage('Document restauré avec succès !', 'success');
        this.chargerFactures();
      },
      error: () => this.afficherMessage('Erreur lors de la restauration.', 'error')
    });
  }

  restaurerBon(id: number): void {
    this.http.post(`/api/v1/commandes/${id}/restaurer/`, {}).subscribe({
      next: () => {
        this.afficherMessage('Bon de commande restauré avec succès !', 'success');
        this.chargerBons();
      },
      error: () => this.afficherMessage('Erreur lors de la restauration.', 'error')
    });
  }

  supprimerDefinitivementFacture(id: number, numero: string): void {
    if (!confirm(`Supprimer définitivement ${numero} ? Cette action est irréversible.`)) return;
    this.http.delete(`/api/v1/factures/${id}/supprimer_definitif/`).subscribe({
      next: () => {
        this.afficherMessage('Document supprimé définitivement.', 'success');
        this.chargerFactures();
      },
      error: () => this.afficherMessage('Erreur lors de la suppression.', 'error')
    });
  }

  supprimerDefinitivementBon(id: number, numero: string): void {
    if (!confirm(`Supprimer définitivement ${numero} ? Cette action est irréversible.`)) return;
    this.http.delete(`/api/v1/commandes/${id}/supprimer_definitif/`).subscribe({
      next: () => {
        this.afficherMessage('Bon supprimé définitivement.', 'success');
        this.chargerBons();
      },
      error: () => this.afficherMessage('Erreur lors de la suppression.', 'error')
    });
  }

  afficherMessage(msg: string, type: 'success' | 'error'): void {
    this.message     = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 4000);
  }
}