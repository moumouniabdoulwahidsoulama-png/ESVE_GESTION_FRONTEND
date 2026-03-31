import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-offre-service',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatCardModule, MatProgressSpinnerModule
  ],
  template: `
<div style="padding:24px; max-width:800px; margin:0 auto;">

  <!-- En-tête -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
    <div>
      <h1 style="margin:0; font-size:24px; color:#1A1A2E;">Offre de service</h1>
      <p style="margin:4px 0 0; color:#888; font-size:14px;">
        Générez une offre professionnelle en français ou en anglais
      </p>
    </div>
    <div style="width:52px; height:52px; background:#D4A017; border-radius:12px;
                display:flex; align-items:center; justify-content:center; font-size:24px;">
      📄
    </div>
  </div>

  <form [formGroup]="offreForm">

    <!-- Langue -->
    <mat-card style="margin-bottom:20px; border-left:4px solid #D4A017;">
      <mat-card-content style="padding:20px;">
        <h3 style="margin:0 0 16px; color:#1A1A2E; font-size:15px;">🌐 Langue du document</h3>
        <div style="display:flex; gap:12px;">
          <label *ngFor="let l of langues"
                 style="display:flex; align-items:center; gap:8px; cursor:pointer;
                        padding:10px 20px; border-radius:8px; border:1.5px solid #E0E0E0;
                        background:white; font-size:14px; transition:all .2s;"
                 [style.border-color]="offreForm.get('langue')?.value === l.code ? '#D4A017' : '#E0E0E0'"
                 [style.background]="offreForm.get('langue')?.value === l.code ? '#FFF3E0' : 'white'"
                 [style.font-weight]="offreForm.get('langue')?.value === l.code ? '700' : 'normal'">
            <input type="radio" formControlName="langue" [value]="l.code"
                   style="accent-color:#D4A017;">
            {{ l.flag }} {{ l.label }}
          </label>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Société destinataire -->
    <mat-card style="margin-bottom:20px; border-left:4px solid #D4A017;">
      <mat-card-content style="padding:20px;">
        <h3 style="margin:0 0 16px; color:#1A1A2E; font-size:15px;">🏢 Société destinataire</h3>
        <mat-form-field appearance="outline" style="width:100%;">
          <mat-label>Nom de la société</mat-label>
          <input matInput formControlName="societe" placeholder="Ex: SOMISA, IAMGOLD, Endeavour...">
        </mat-form-field>
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
        <h3 style="margin:0 0 4px; color:#1A1A2E; font-size:15px;">✏️ Paragraphe additionnel
          <span style="color:#888; font-weight:400;">(optionnel)</span>
        </h3>
        <p style="margin:0 0 16px; color:#888; font-size:13px;">
          Ajoutez un texte personnalisé qui s'insèrera avant la formule de politesse
        </p>
        <mat-form-field appearance="outline" style="width:100%;">
          <mat-label>Texte personnalisé</mat-label>
          <textarea matInput formControlName="texte_custom" rows="4"
                    placeholder="Ex: Nous avons récemment travaillé avec des sociétés similaires à la vôtre...">
          </textarea>
        </mat-form-field>
      </mat-card-content>
    </mat-card>

    <!-- Messages -->
    <div *ngIf="errorMessage" style="color:red; padding:12px; margin-bottom:16px;
                background:#FFEBEE; border-radius:6px; font-size:14px;">
      ⚠️ {{ errorMessage }}
    </div>

    <div *ngIf="successMessage" style="color:green; padding:12px; margin-bottom:16px;
                background:#E8F5E9; border-radius:6px; font-size:14px;">
      ✅ {{ successMessage }}
    </div>

    <!-- Boutons -->
    <div style="display:flex; gap:16px; align-items:center;">
      <button mat-raised-button
              [disabled]="isLoading"
              (click)="genererPDF()"
              style="background:#D4A017; color:#1A1A2E; font-weight:700;
                     padding:8px 28px; font-size:15px;">
        <mat-icon style="margin-right:8px;">download</mat-icon>
        <span *ngIf="!isLoading">
          Télécharger le PDF
          {{ offreForm.get('langue')?.value === 'en' ? '(EN)' : '(FR)' }}
        </span>
        <span *ngIf="isLoading">Génération en cours...</span>
      </button>

      <button mat-button type="button" (click)="resetForm()"
              style="color:#888;">
        Réinitialiser
      </button>
    </div>

  </form>

  <!-- Aperçu du contenu -->
  <mat-card style="margin-top:32px; background:#F9F9F9; border:1px dashed #E0E0E0;">
    <mat-card-content style="padding:20px;">
      <h4 style="margin:0 0 12px; color:#888; font-size:13px; text-transform:uppercase;
                 letter-spacing:1px;">📋 Aperçu du contenu du document</h4>
      <div style="font-size:13px; color:#555; line-height:1.8;">
        <div>✅ En-tête ESVE avec logo</div>
        <div>✅ Société et destinataires (à droite)</div>
        <div>✅ Objet de la lettre</div>
        <div>✅ Présentation complète de l'entreprise ({{ offreForm.get('langue')?.value === 'en' ? 'anglais' : 'français' }})</div>
        <div>✅ Domaines : OAS/TDR, Pièces mécaniques, Location, SAV</div>
        <div>✅ Pied de page ESVE complet <em>(dernière page uniquement)</em></div>
      </div>
    </mat-card-content>
  </mat-card>

</div>
  `,
})
export class OffreServiceComponent {
  offreForm: FormGroup;
  isLoading    = false;
  errorMessage = '';
  successMessage = '';

  langues = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English',  flag: '🇬🇧' },
  ];

  constructor(
    private fb:   FormBuilder,
    private http: HttpClient
  ) {
    this.offreForm = this.fb.group({
      langue:       ['fr'],
      societe:      [''],
      texte_custom: [''],
      destinataires: this.fb.array([
        this.fb.group({ nom: [''], fonction: [''] }),
        this.fb.group({ nom: [''], fonction: [''] }),
        this.fb.group({ nom: [''], fonction: [''] }),
      ])
    });
  }

  get destinataires(): FormArray {
    return this.offreForm.get('destinataires') as FormArray;
  }

  genererPDF(): void {
    this.isLoading     = true;
    this.errorMessage  = '';
    this.successMessage = '';

    const fv = this.offreForm.getRawValue();

    // Filtrer les destinataires vides
    const destinataires = fv.destinataires.filter(
      (d: any) => d.nom?.trim() || d.fonction?.trim()
    );

    const payload = {
      langue:       fv.langue,
      societe:      fv.societe?.trim() || '',
      destinataires,
      texte_custom: fv.texte_custom?.trim() || '',
    };

    this.http.post('/api/v1/offres/generer/', payload, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        const blob = response.body!;
        const url  = window.URL.createObjectURL(blob);
        const a    = document.createElement('a');

        // Récupère le nom de fichier depuis Content-Disposition
        const cd = response.headers.get('Content-Disposition') || '';
        const match = cd.match(/filename="?([^"]+)"?/);
        a.download = match ? match[1] : `ESVE_Offre_Service.pdf`;

        a.href = url;
        a.click();
        window.URL.revokeObjectURL(url);

        this.successMessage = 'PDF généré et téléchargé avec succès !';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (e) => {
        this.errorMessage = 'Erreur lors de la génération du PDF.';
        this.isLoading    = false;
        console.error(e);
      }
    });
  }

  resetForm(): void {
    this.offreForm.reset({
      langue:       'fr',
      societe:      '',
      texte_custom: '',
      destinataires: [
        { nom: '', fonction: '' },
        { nom: '', fonction: '' },
        { nom: '', fonction: '' },
      ]
    });
    this.errorMessage   = '';
    this.successMessage = '';
  }
}