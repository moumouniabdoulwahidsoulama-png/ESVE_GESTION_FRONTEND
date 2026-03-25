import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BonCommandeService, BonCommande } from '../../../core/services/bon-commande.service';

@Component({
  selector: 'app-bon-commande-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatDatepickerModule, MatNativeDateModule,
    MatCardModule, MatCheckboxModule, RouterLink
  ],
  templateUrl: './bon-commande-form.component.html',
  styleUrls: ['./bon-commande-form.component.scss']
})
export class BonCommandeFormComponent implements OnInit {
  bonForm:       FormGroup;
  isEditMode   = false;
  bonId?:        number;
  isLoading    = false;
  errorMessage = '';

  // Totaux affichés en temps réel
  totalHT   = 0;
  tva       = 0;
  retenue   = 0;
  bic       = 0;
  transport = 0;
  totalNet  = 0;

  constructor(
    private fb:                  FormBuilder,
    private bonCommandeService:  BonCommandeService,
    private route:               ActivatedRoute,
    private router:              Router,
    private cdr:                 ChangeDetectorRef
  ) {
    this.bonForm = this.fb.group({
      fournisseur_nom:              ['', Validators.required],
      fournisseur_contact:          [''],
      fournisseur_tel:              [''],
      fournisseur_email:            [''],
      fournisseur_adresse:          [''],
      fournisseur_ifu:              [''],
      fournisseur_rccm:             [''],
      fournisseur_division_fiscale: [''],
      fournisseur_regime:           [''],
      ref_proforma_fournisseur:     [''],
      date_proforma_fournisseur:    [''],
      termes_paiement:              ['100% 30 Jours après la livraison'],
      termes_livraison:             ['DDP/OUAGADOUGOU'],
      delais_livraison:             [''],
      objet:                        [''],
      notes:                        [''],
      date_livraison_prev:          [''],
      appliquer_tva:                [false],
      appliquer_retenue:            [false],
      appliquer_bic:                [false],
      appliquer_transport:          [false],
      montant_transport:            [0, Validators.min(0)],
      lignes: this.fb.array([])
    });
  }

  get lignes(): FormArray {
    return this.bonForm.get('lignes') as FormArray;
  }

  ligneTotal(i: number): number {
    const lg  = this.lignes.at(i) as FormGroup;
    const pu  = Number(lg.get('prix_unitaire_ht')?.value) || 0;
    const qte = Number(lg.get('quantite')?.value)         || 0;
    return pu * qte;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.bonId      = +params['id'];
        this.loadBon(this.bonId);
      } else {
        this.ajouterLigne();
      }
    });

    // ✅ UNE SEULE subscription sur tout le formulaire — capte TOUS les changements
    this.bonForm.valueChanges.subscribe(() => {
      this.calculerTotaux();
      this.cdr.markForCheck();
    });
  }

  loadBon(id: number): void {
    this.bonCommandeService.getById(id).subscribe({
      next: (bon: any) => {
        this.bonForm.patchValue({
          fournisseur_nom:              bon.fournisseur_nom,
          fournisseur_contact:          bon.fournisseur_contact,
          fournisseur_tel:              bon.fournisseur_tel,
          fournisseur_email:            bon.fournisseur_email,
          fournisseur_adresse:          bon.fournisseur_adresse,
          fournisseur_ifu:              bon.fournisseur_ifu,
          fournisseur_rccm:             bon.fournisseur_rccm,
          fournisseur_division_fiscale: bon.fournisseur_division_fiscale,
          fournisseur_regime:           bon.fournisseur_regime,
          ref_proforma_fournisseur:     bon.ref_proforma_fournisseur,
          date_proforma_fournisseur:    bon.date_proforma_fournisseur,
          termes_paiement:              bon.termes_paiement,
          termes_livraison:             bon.termes_livraison,
          delais_livraison:             bon.delais_livraison,
          objet:                        bon.objet,
          notes:                        bon.notes,
          appliquer_tva:                bon.appliquer_tva       || false,
          appliquer_retenue:            bon.appliquer_retenue   || false,
          appliquer_bic:                bon.appliquer_bic       || false,
          appliquer_transport:          bon.appliquer_transport || false,
          montant_transport:            bon.montant_transport   || 0,
        }, { emitEvent: false });

        while (this.lignes.length) { this.lignes.removeAt(0); }
        if (bon.lignes) {
          bon.lignes.forEach((l: any) => {
            this.lignes.push(this.creerLigneForm(l), { emitEvent: false });
          });
        }
        this.calculerTotaux();
        this.cdr.detectChanges();
      },
      error: () => { this.errorMessage = 'Impossible de charger le bon'; }
    });
  }

  creerLigneForm(ligne?: any): FormGroup {
    return this.fb.group({
      description:           [ligne?.description           || '', Validators.required],
      reference_client:      [ligne?.reference_client      || ''],
      reference_fournisseur: [ligne?.reference_fournisseur || ''],
      prix_unitaire_ht:      [Number(ligne?.prix_unitaire_ht) || 0, [Validators.required, Validators.min(0)]],
      quantite:              [Number(ligne?.quantite)       || 1,   [Validators.required, Validators.min(1)]],
      unite:                 [ligne?.unite                 || ''],
      delais:                [ligne?.delais                || ''],
      ordre:                 [ligne?.ordre                 || 0]
    });
  }

  ajouterLigne(): void {
    this.lignes.push(this.creerLigneForm());
  }

  supprimerLigne(i: number): void {
    this.lignes.removeAt(i);
    this.calculerTotaux();
    this.cdr.detectChanges();
  }

  calculerTotaux(): void {
    const fv = this.bonForm.getRawValue();

    // ── Lignes ──────────────────────────────────────────
    let total = 0;
    (fv.lignes || []).forEach((l: any) => {
      total += (Number(l.prix_unitaire_ht) || 0) * (Number(l.quantite) || 0);
    });
    this.totalHT = total;

    // ── TVA 18% ─────────────────────────────────────────
    this.tva = fv.appliquer_tva
      ? Math.round(total * 0.18) : 0;

    // ── Retenue 5% ──────────────────────────────────────
    this.retenue = fv.appliquer_retenue
      ? Math.round(total * 0.05) : 0;

    // ── BIC 2% ──────────────────────────────────────────
    this.bic = fv.appliquer_bic
      ? Math.round((total + this.tva) * 0.02) : 0;

    // ── Transport ───────────────────────────────────────
    this.transport = fv.appliquer_transport
      ? Math.round(Number(fv.montant_transport) || 0) : 0;

    // ── Total net ────────────────────────────────────────
    this.totalNet = total + this.tva - this.retenue - this.bic + this.transport;
  }

  onSubmit(): void {
    if (this.bonForm.invalid) return;
    this.isLoading    = true;
    this.errorMessage = '';
    const fv = this.bonForm.getRawValue();

    const formatDate = (date: any): string | null => {
      if (!date) return null;
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split('T')[0];
    };

    const bon: any = {
      fournisseur_nom:              fv.fournisseur_nom,
      fournisseur_contact:          fv.fournisseur_contact,
      fournisseur_tel:              fv.fournisseur_tel,
      fournisseur_email:            fv.fournisseur_email,
      fournisseur_adresse:          fv.fournisseur_adresse,
      fournisseur_ifu:              fv.fournisseur_ifu,
      fournisseur_rccm:             fv.fournisseur_rccm,
      fournisseur_division_fiscale: fv.fournisseur_division_fiscale,
      fournisseur_regime:           fv.fournisseur_regime,
      ref_proforma_fournisseur:     fv.ref_proforma_fournisseur,
      date_proforma_fournisseur:    formatDate(fv.date_proforma_fournisseur),
      termes_paiement:              fv.termes_paiement,
      termes_livraison:             fv.termes_livraison,
      delais_livraison:             fv.delais_livraison,
      objet:                        fv.objet,
      notes:                        fv.notes,
      date_livraison_prev:          formatDate(fv.date_livraison_prev),
      appliquer_tva:                fv.appliquer_tva,
      appliquer_retenue:            fv.appliquer_retenue,
      appliquer_bic:                fv.appliquer_bic,
      appliquer_transport:          fv.appliquer_transport,
      montant_transport:            fv.appliquer_transport ? Number(fv.montant_transport) : 0,
      lignes: fv.lignes.map((l: any, i: number) => ({
        description:           l.description,
        reference_client:      l.reference_client,
        reference_fournisseur: l.reference_fournisseur,
        prix_unitaire_ht:      Number(l.prix_unitaire_ht),
        quantite:              Number(l.quantite),
        unite:                 l.unite,
        delais:                l.delais,
        ordre:                 i + 1
      }))
    };

    const action = this.isEditMode && this.bonId
      ? this.bonCommandeService.update(this.bonId, bon)
      : this.bonCommandeService.create(bon);

    action.subscribe({
      next: () => this.router.navigate(['/bons-commande']),
      error: (e) => {
        this.errorMessage = 'Erreur : ' + JSON.stringify(e.error);
        this.isLoading = false;
      }
    });
  }
}