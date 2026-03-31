import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';

interface Offre {
  id:             number;
  langue:         string;
  societe:        string;
  destinataires:  any[];
  texte_custom:   string;
  date_creation:  string;
}

@Component({
  selector: 'app-offre-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
<div style="padding:24px; max-width:1100px; margin:0 auto;">

  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
    <div>
      <h1 style="margin:0; font-size:24px; color:#1A1A2E;">Offres de service</h1>
      <p style="margin:4px 0 0; color:#888; font-size:14px;">
        {{ offres.length }} offre{{ offres.length > 1 ? 's' : '' }} enregistrée{{ offres.length > 1 ? 's' : '' }}
      </p>
    </div>
    <a routerLink="/offres/new" mat-raised-button
       style="background:#D4A017; color:#1A1A2E; font-weight:700; padding:10px 24px;
              text-decoration:none; border-radius:8px; font-size:14px; display:flex;
              align-items:center; gap:8px;">
      <mat-icon>add</mat-icon> Nouvelle offre
    </a>
  </div>

  <!-- Erreur -->
  <div *ngIf="errorMessage" style="color:red; padding:12px; margin-bottom:16px;
              background:#FFEBEE; border-radius:6px;">{{ errorMessage }}</div>

  <!-- Chargement -->
  <div *ngIf="isLoading" style="text-align:center; padding:60px; color:#888;">
    Chargement...
  </div>

  <!-- Liste vide -->
  <div *ngIf="!isLoading && offres.length === 0"
       style="text-align:center; padding:80px 24px; background:white;
              border-radius:12px; border:2px dashed #E0E0E0;">
    <div style="font-size:48px; margin-bottom:16px;">📄</div>
    <h3 style="color:#888; margin:0 0 8px;">Aucune offre enregistrée</h3>
    <p style="color:#aaa; margin:0 0 24px;">Créez votre première offre de service</p>
    <a routerLink="/offres/new" mat-raised-button
       style="background:#D4A017; color:#1A1A2E; font-weight:700;
              text-decoration:none; padding:10px 24px; border-radius:8px;">
      Créer une offre
    </a>
  </div>

  <!-- Tableau des offres -->
  <div *ngIf="!isLoading && offres.length > 0"
       style="background:white; border-radius:12px; overflow:hidden;
              box-shadow:0 2px 12px rgba(0,0,0,.08);">

    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#1A1A2E; color:white;">
          <th style="padding:14px 20px; text-align:left; font-size:13px;">Société</th>
          <th style="padding:14px 16px; text-align:left; font-size:13px;">Langue</th>
          <th style="padding:14px 16px; text-align:left; font-size:13px;">Destinataires</th>
          <th style="padding:14px 16px; text-align:left; font-size:13px;">Date</th>
          <th style="padding:14px 16px; text-align:center; font-size:13px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let o of offres; let i = index"
            [style.background]="i % 2 === 0 ? 'white' : '#FAFAFA'"
            style="border-bottom:1px solid #F0F0F0;">

          <td style="padding:14px 20px;">
            <strong style="color:#1A1A2E;">{{ o.societe || '—' }}</strong>
          </td>

          <td style="padding:14px 16px;">
            <span [style.background]="o.langue === 'fr' ? '#E3F2FD' : '#FFF8E1'"
                  [style.color]="o.langue === 'fr' ? '#1565C0' : '#E65100'"
                  style="padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700;">
              {{ o.langue === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN' }}
            </span>
          </td>

          <td style="padding:14px 16px; font-size:13px; color:#555;">
            <div *ngFor="let d of o.destinataires">
              <span *ngIf="d.nom || d.fonction">
                {{ d.nom }}{{ d.nom && d.fonction ? ' – ' : '' }}{{ d.fonction }}
              </span>
            </div>
            <span *ngIf="!o.destinataires || o.destinataires.length === 0" style="color:#ccc;">
              Aucun destinataire
            </span>
          </td>

          <td style="padding:14px 16px; font-size:13px; color:#888;">
            {{ o.date_creation | date:'dd/MM/yyyy HH:mm' }}
          </td>

          <td style="padding:14px 16px; text-align:center;">
            <div style="display:flex; gap:8px; justify-content:center;">

              <!-- Télécharger PDF -->
              <button mat-icon-button
                      matTooltip="Télécharger PDF"
                      (click)="telechargerPdf(o)"
                      style="background:#FFF8E1; color:#D4A017;">
                <mat-icon>download</mat-icon>
              </button>

              <!-- Modifier -->
              <button mat-icon-button
                      matTooltip="Modifier"
                      [routerLink]="['/offres/edit', o.id]"
                      style="background:#E8F5E9; color:#2E7D32;">
                <mat-icon>edit</mat-icon>
              </button>

              <!-- Supprimer -->
              <button mat-icon-button
                      matTooltip="Supprimer"
                      (click)="supprimer(o)"
                      style="background:#FFEBEE; color:#C62828;">
                <mat-icon>delete</mat-icon>
              </button>

            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

</div>
  `
})
export class OffreListComponent implements OnInit {
  offres:       Offre[] = [];
  isLoading   = true;
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.http.get<Offre[]>('/api/v1/offres/').subscribe({
      next:  (data) => { this.offres = data; this.isLoading = false; },
      error: ()     => { this.errorMessage = 'Impossible de charger les offres.'; this.isLoading = false; }
    });
  }

  telechargerPdf(o: Offre): void {
    this.http.get(`/api/v1/offres/${o.id}/pdf/`, {
      responseType: 'blob', observe: 'response'
    }).subscribe({
      next: (resp) => {
        const url = window.URL.createObjectURL(resp.body!);
        const a   = document.createElement('a');
        a.href    = url;
        a.download = `ESVE_Offre_${o.langue.toUpperCase()}_${o.societe || 'offre'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => { this.errorMessage = 'Erreur lors du téléchargement.'; }
    });
  }

  supprimer(o: Offre): void {
    if (!confirm(`Supprimer l'offre "${o.societe || 'sans titre'}" ? Cette action est irréversible.`)) return;
    this.http.delete(`/api/v1/offres/${o.id}/`).subscribe({
      next:  () => { this.offres = this.offres.filter(x => x.id !== o.id); },
      error: () => { this.errorMessage = 'Erreur lors de la suppression.'; }
    });
  }
}