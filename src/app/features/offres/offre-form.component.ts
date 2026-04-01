import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-offre-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCardModule
  ],
  template: `
<div style="padding:24px; max-width:800px; margin:0 auto;">

  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
    <div>
      <h1 style="margin:0; font-size:24px; color:#1A1A2E;">
        {{ isEditMode ? "Modifier l'offre" : 'Nouvelle offre de service' }}
      </h1>
      <p style="margin:4px 0 0; color:#888; font-size:14px;">
        Personnalisez et téléchargez en PDF (FR ou EN)
      </p>
    </div>
    <a routerLink="/offres" mat-button style="color:#888;">
      <mat-icon>arrow_back</mat-icon> Retour
    </a>
  </div>

  <!-- Messages -->
  <div *ngIf="errorMessage" style="color:red; padding:12px; margin-bottom:16px;
              background:#FFEBEE; border-radius:6px;">⚠️ {{ errorMessage }}</div>
  <div *ngIf="successMessage" style="color:green; padding:12px; margin-bottom:16px;
              background:#E8F5E9; border-radius:6px;">✅ {{ successMessage }}</div>

  <form [formGroup]="form">

    <!-- Langue -->
    <mat-card style="margin-bottom:20px; border-left:4px solid #D4A017;">
      <mat-card-content style="padding:20px;">
        <h3 style="margin:0 0 16px; color:#1A1A2E; font-size:15px;">🌐 Langue du document</h3>
        <div style="display:flex; gap:12px;">
          <label *ngFor="let l of langues"
                 style="display:flex; align-items:center; gap:8px; cursor:pointer;
                        padding:10px 20px; border-radius:8px; border:1.5px solid #E0E0E0;
                        background:white; font-size:14px;"
                 [style.border-color]="form.get('langue')?.value === l.code ? '#D4A017' : '#E0E0E0'"
                 [style.background]="form.get('langue')?.value === l.code ? '#FFF3E0' : 'white'"
                 [style.font-weight]="form.get('langue')?.value === l.code ? '700' : 'normal'">
            <input type="radio" formControlName="langue" [value]="l.code" style="accent-color:#D4A017;">
            {{ l.flag }} {{ l.label }}
          </label>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Société -->
    <mat-card style="margin-bottom:20px; border-left:4px solid #D4A017;">
      <mat-card-content style="padding:20px;">
        <h3 style="margin:0 0 16px; color:#1A1A2E; font-size:15px;">🏢 Société bénéficiaire</h3>
        <mat-form-field appearance="outline" style="width:100%; margin-bottom:12px;">
          <mat-label>Nom de la société</mat-label>
          <input matInput formControlName="societe" placeholder="Ex: SOMISA, IAMGOLD, Endeavour...">
        </mat-form-field>
        <div style="display:flex; gap:16px; flex-wrap:wrap;">
          <mat-form-field appearance="outline" style="flex:2; min-width:200px;">
            <mat-label>Adresse (optionnel)</mat-label>
            <input matInput formControlName="adresse" placeholder="Ex: 01 BP 1234 Ouagadougou">
          </mat-form-field>
          <mat-form-field appearance="outline" style="flex:1; min-width:160px;">
            <mat-label>Date du document (optionnel)</mat-label>
            <input matInput formControlName="date_doc" placeholder="Ex: 01 avril 2026">
          </mat-form-field>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Destinataires -->
    <mat-card style="margin-bottom:20px; border-left:4px solid #D4A017;">
      <mat-card-content style="padding:20px;">
        <h3 style="margin:0 0 4px; color:#1A1A2E; font-size:15px;">👤 Destinataires</h3>
        <p style="margin:0 0 16px; color:#888; font-size:13px;">
          Jusqu'à 3 personnes — laisser vide si non utilisé
        </p>
        <div formArrayName="destinataires">
          <div *ngFor="let d of destinataires.controls; let i = index"
               [formGroupName]="i"
               style="display:flex; gap:12px; margin-bottom:12px; align-items:center;">
            <div style="min-width:24px; height:24px; background:#D4A017; border-radius:50%;
                        display:flex; align-items:center; justify-content:center;
                        font-size:12px; font-weight:700; color:#1A1A2E; flex-shrink:0;">
              {{ i + 1 }}
            </div>
            <mat-form-field appearance="outline" style="flex:2;">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="nom" placeholder="Prénom Nom">
            </mat-form-field>
            <mat-form-field appearance="outline" style="flex:2;">
              <mat-label>Fonction / Poste</mat-label>
              <input matInput formControlName="fonction" placeholder="Ex: Directeur Achats">
            </mat-form-field>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Texte additionnel -->
    <mat-card style="margin-bottom:24px; border-left:4px solid #E0E0E0;">
      <mat-card-content style="padding:20px;">
        <h3 style="margin:0 0 4px; color:#1A1A2E; font-size:15px;">
          ✏️ Paragraphe additionnel <span style="color:#888; font-weight:400;">(optionnel)</span>
        </h3>
        <mat-form-field appearance="outline" style="width:100%;">
          <mat-label>Texte personnalisé</mat-label>
          <textarea matInput formControlName="texte_custom" rows="4"
                    placeholder="Ex: Nous avons récemment travaillé avec des sociétés similaires...">
          </textarea>
        </mat-form-field>
      </mat-card-content>
    </mat-card>

    <!-- Boutons -->
    <div style="display:flex; gap:12px; flex-wrap:wrap;">

      <button mat-raised-button type="button"
              [disabled]="isSaving"
              (click)="sauvegarder()"
              style="background:#1A1A2E; color:white; font-weight:700; padding:8px 24px;">
        <mat-icon style="margin-right:6px;">save</mat-icon>
        {{ isSaving ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Sauvegarder') }}
      </button>

      <button mat-raised-button type="button"
              [disabled]="isDownloading"
              (click)="telecharger()"
              style="background:#D4A017; color:#1A1A2E; font-weight:700; padding:8px 24px;">
        <mat-icon style="margin-right:6px;">download</mat-icon>
        {{ isDownloading ? 'Génération...' : 'Télécharger PDF' }}
        {{ form.get('langue')?.value === 'en' ? '(EN)' : '(FR)' }}
      </button>

      <button mat-button type="button" routerLink="/offres" style="color:#888;">
        Annuler
      </button>

    </div>

  </form>
</div>
  `
})
export class OffreFormComponent implements OnInit {
  form:          FormGroup;
  isEditMode   = false;   // ✅ isEditMode (pas estEditMode)
  offreId?:      number;
  isSaving     = false;
  isDownloading = false;
  errorMessage  = '';
  successMessage = '';

  langues = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English',  flag: '🇬🇧' },
  ];

  constructor(
    private fb:     FormBuilder,
    private http:   HttpClient,
    private route:  ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      langue:       ['fr'],
      societe:      [''],
      adresse:      [''],
      date_doc:     [''],
      texte_custom: [''],
      destinataires: this.fb.array([
        this.fb.group({ nom: [''], fonction: [''] }),
        this.fb.group({ nom: [''], fonction: [''] }),
        this.fb.group({ nom: [''], fonction: [''] }),
      ])
    });
  }

  get destinataires(): FormArray {
    return this.form.get('destinataires') as FormArray;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.offreId    = +params['id'];
        this.loadOffre(this.offreId);
      }
    });
  }

  loadOffre(id: number): void {
    this.http.get<any>(`/api/v1/offres/${id}/`).subscribe({
      next: (o) => {
        this.form.patchValue({
          langue:       o.langue,
          societe:      o.societe,
          adresse:      o.adresse      || '',
          date_doc:     o.date_doc     || '',
          texte_custom: o.texte_custom,
        });
        const dests = o.destinataires || [];
        for (let i = 0; i < 3; i++) {
          const ctrl = this.destinataires.at(i) as FormGroup;
          ctrl.patchValue({
            nom:      dests[i]?.nom      || '',
            fonction: dests[i]?.fonction || '',
          });
        }
      },
      error: () => { this.errorMessage = "Impossible de charger l'offre."; }
    });
  }

  getPayload(): any {
    const fv = this.form.getRawValue();
    return {
      langue:        fv.langue,
      societe:       (fv.societe    || '').trim(),
      adresse:       (fv.adresse    || '').trim(),
      date_doc:      (fv.date_doc   || '').trim(),
      texte_custom:  (fv.texte_custom || '').trim(),
      destinataires: fv.destinataires.filter(
        (d: any) => (d.nom || '').trim() || (d.fonction || '').trim()
      ),
    };
  }

  sauvegarder(): void {
    this.isSaving     = true;
    this.errorMessage = '';
    const payload = this.getPayload();
    const req = this.isEditMode && this.offreId
      ? this.http.put(`/api/v1/offres/${this.offreId}/`, payload)
      : this.http.post('/api/v1/offres/', payload);

    req.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/offres']);  // ✅ Redirige vers la liste
      },
      error: () => {
        this.errorMessage = "Erreur lors de l'enregistrement.";
        this.isSaving = false;
      }
    });
  }

  telecharger(): void {
    this.isDownloading = true;
    this.errorMessage  = '';
    const payload = this.getPayload();

    this.http.post('/api/v1/offres/generer/', payload, {
      responseType: 'blob', observe: 'response'
    }).subscribe({
      next: (resp) => {
        const url = window.URL.createObjectURL(resp.body!);
        const a   = document.createElement('a');
        const cd  = resp.headers.get('Content-Disposition') || '';
        const m   = cd.match(/filename="?([^"]+)"?/);
        a.download = m ? m[1] : 'ESVE_Offre.pdf';
        a.href = url;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading  = false;
        this.successMessage = 'PDF téléchargé avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage  = 'Erreur lors de la génération du PDF.';
        this.isDownloading = false;
      }
    });
  }
}