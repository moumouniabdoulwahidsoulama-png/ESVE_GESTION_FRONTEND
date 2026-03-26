import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FactureService } from '../../../core/services/facture.service';
import { ClientService, Client } from '../../../core/services/client.service';

@Component({
  selector: 'app-facture-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatCardModule, MatCheckboxModule,
    RouterLink
    // MatRadioModule retiré — on utilise des <input type="radio"> natifs
  ],
  templateUrl: './facture-form.component.html',
  styleUrls: ['./facture-form.component.scss']
})
export class FactureFormComponent implements OnInit {
  factureForm:   FormGroup;
  isEditMode   = false;
  factureId?:    number;
  clients:       Client[] = [];
  isLoading    = false;
  errorMessage = '';

  termesPaiementOptions = [
    '100% à la commande',
    '15 jours date de facturation',
    '30 jours date de facturation',
    '60 jours date de facturation',
  ];

  totalHT          = 0;
  montantRemise    = 0;
  totalApresRemise = 0;
  tva              = 0;
  retenue          = 0;
  bic              = 0;
  transport        = 0;
  totalNet         = 0;

  constructor(
    private fb:             FormBuilder,
    private factureService: FactureService,
    private clientService:  ClientService,
    private route:          ActivatedRoute,
    private router:         Router,
    private cdr:            ChangeDetectorRef
  ) {
    this.factureForm = this.fb.group({
      client:              ['', Validators.required],
      type_doc:            ['PROFORMA', Validators.required],
      termes_paiement:     ['100% à la commande'],
      validite_jours:      [30],
      remise_pct:          [0, [Validators.min(0), Validators.max(100)]],
      notes:               [''],
      appliquer_remise:    [false],
      appliquer_tva:       [false],
      appliquer_retenue:   [false],
      appliquer_bic:       [false],
      appliquer_transport: [false],
      montant_transport:   [0, Validators.min(0)],
      lignes:              this.fb.array([])
    });
  }

  get lignes(): FormArray {
    return this.factureForm.get('lignes') as FormArray;
  }

  ligneTotal(i: number): number {
    const lg  = this.lignes.at(i) as FormGroup;
    const pu  = Number(lg.get('prix_unitaire_ht')?.value) || 0;
    const qte = Number(lg.get('quantite')?.value)         || 0;
    return pu * qte;
  }

  ngOnInit(): void {
    this.loadClients();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.factureId  = +params['id'];
        this.loadFacture(this.factureId);
      } else {
        this.ajouterLigne();
      }
    });

    // ✅ detectChanges() au lieu de markForCheck() — fonctionne avec la stratégie par défaut
    this.factureForm.valueChanges.subscribe(() => {
      this.calculerTotaux();
      this.cdr.detectChanges();
    });
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (data: any) => { this.clients = data.results ? data.results : data; },
      error: (err) => console.error('Erreur clients:', err)
    });
  }

  loadFacture(id: number): void {
    this.factureService.getById(id).subscribe({
      next: (facture: any) => {
        this.factureForm.patchValue({
          client:              facture.client,
          type_doc:            facture.type_doc,
          termes_paiement:     facture.termes_paiement     || '100% à la commande',
          validite_jours:      facture.validite_jours      || 30,
          remise_pct:          facture.remise_pct          || 0,
          notes:               facture.notes               || '',
          appliquer_remise:    facture.appliquer_remise    || false,
          appliquer_tva:       facture.appliquer_tva       || false,
          appliquer_retenue:   facture.appliquer_retenue   || false,
          appliquer_bic:       facture.appliquer_bic       || false,
          appliquer_transport: facture.appliquer_transport || false,
          montant_transport:   facture.montant_transport   || 0,
        }, { emitEvent: false });

        while (this.lignes.length) { this.lignes.removeAt(0); }
        if (facture.lignes) {
          facture.lignes.forEach((l: any) => {
            this.lignes.push(this.creerLigneForm(l), { emitEvent: false });
          });
        }
        this.calculerTotaux();
        this.cdr.detectChanges();
      },
      error: () => { this.errorMessage = 'Impossible de charger la facture'; }
    });
  }

  creerLigneForm(ligne?: any): FormGroup {
    return this.fb.group({
      description:           [ligne?.description           || '', Validators.required],
      reference_client:      [ligne?.reference_client      || ''],
      reference_fournisseur: [ligne?.reference_fournisseur || ''],
      prix_unitaire_ht:      [Number(ligne?.prix_unitaire_ht) || 0, [Validators.required, Validators.min(0)]],
      quantite:              [Number(ligne?.quantite)       || 1,   [Validators.required, Validators.min(1)]],
      delais:                [ligne?.delais                || ''],
      ordre:                 [ligne?.ordre                 || 0]
    });
  }

  ajouterLigne(): void { this.lignes.push(this.creerLigneForm()); }

  supprimerLigne(i: number): void {
    this.lignes.removeAt(i);
    this.calculerTotaux();
    this.cdr.detectChanges();
  }

  calculerTotaux(): void {
    const fv = this.factureForm.getRawValue();
    let total = 0;
    (fv.lignes || []).forEach((l: any) => {
      total += (Number(l.prix_unitaire_ht) || 0) * (Number(l.quantite) || 0);
    });
    this.totalHT = total;
    const remisePct    = Number(fv.remise_pct) || 0;
    this.montantRemise = (fv.appliquer_remise && remisePct > 0)
      ? Math.round(total * remisePct / 100) : 0;
    this.totalApresRemise = total - this.montantRemise;
    this.tva      = fv.appliquer_tva      ? Math.round(this.totalApresRemise * 0.18) : 0;
    this.retenue  = fv.appliquer_retenue  ? Math.round(this.totalApresRemise * 0.05) : 0;
    this.bic      = fv.appliquer_bic      ? Math.round((this.totalApresRemise + this.tva) * 0.02) : 0;
    this.transport = fv.appliquer_transport ? Math.round(Number(fv.montant_transport) || 0) : 0;
    this.totalNet = this.totalApresRemise + this.tva - this.retenue - this.bic + this.transport;
  }

  onSubmit(): void {
    if (this.factureForm.invalid) return;
    this.isLoading    = true;
    this.errorMessage = '';
    const fv = this.factureForm.getRawValue();
    const facture: any = {
      client:              fv.client,
      type_doc:            fv.type_doc,
      termes_paiement:     fv.termes_paiement,
      validite_jours:      fv.validite_jours,
      remise_pct:          fv.appliquer_remise ? fv.remise_pct : 0,
      notes:               fv.notes,
      appliquer_remise:    fv.appliquer_remise,
      appliquer_tva:       fv.appliquer_tva,
      appliquer_retenue:   fv.appliquer_retenue,
      appliquer_bic:       fv.appliquer_bic,
      appliquer_transport: fv.appliquer_transport,
      montant_transport:   fv.appliquer_transport ? Number(fv.montant_transport) : 0,
      lignes: fv.lignes.map((l: any, i: number) => ({
        description:           l.description,
        reference_client:      l.reference_client,
        reference_fournisseur: l.reference_fournisseur,
        prix_unitaire_ht:      Number(l.prix_unitaire_ht),
        quantite:              Number(l.quantite),
        delais:                l.delais,
        ordre:                 i + 1
      }))
    };
    const action = this.isEditMode && this.factureId
      ? this.factureService.update(this.factureId, facture)
      : this.factureService.create(facture);
    action.subscribe({
      next: () => this.router.navigate(['/factures']),
      error: (e) => {
        this.errorMessage = 'Erreur : ' + JSON.stringify(e.error);
        this.isLoading    = false;
      }
    });
  }
}