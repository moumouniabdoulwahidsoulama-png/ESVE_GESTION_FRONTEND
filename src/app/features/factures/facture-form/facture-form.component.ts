import { Component, OnInit, NgZone } from '@angular/core';
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
import { FactureService } from '../../../core/services/facture.service';
import { ClientService, Client } from '../../../core/services/client.service';

@Component({
  selector: 'app-facture-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatDatepickerModule, MatNativeDateModule,
    MatCardModule, MatCheckboxModule, RouterLink
  ],
  templateUrl: './facture-form.component.html',
  styleUrls: ['./facture-form.component.scss']
})
export class FactureFormComponent implements OnInit {
  factureForm:      FormGroup;
  isEditMode      = false;
  factureId?:       number;
  clients:          Client[] = [];
  isLoading       = false;
  errorMessage    = '';

  // Totaux affichés en temps réel
  totalHT          = 0;
  montantRemise    = 0;
  totalApresRemise = 0;
  tva              = 0;
  retenue          = 0;
  bic              = 0;
  transport        = 0;
  totalNet         = 0;

  constructor(
    private fb: FormBuilder,
    private factureService: FactureService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone
  ) {
    this.factureForm = this.fb.group({
      client:              ['', Validators.required],
      type_doc:            ['PROFORMA', Validators.required],
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

  // Calcul du total d'une ligne (utilisé dans le HTML)
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

    // Écouter UNIQUEMENT les checkboxes via valueChanges
    // Les inputs numériques utilisent (input)/(change) dans le HTML
    ['appliquer_remise', 'appliquer_tva', 'appliquer_retenue',
     'appliquer_bic', 'appliquer_transport'
    ].forEach(field => {
      this.factureForm.get(field)?.valueChanges.subscribe(() => {
        this.zone.run(() => this.calculerTotaux());
      });
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
          remise_pct:          facture.remise_pct          || 0,
          notes:               facture.notes               || '',
          appliquer_remise:    facture.appliquer_remise    || false,
          appliquer_tva:       facture.appliquer_tva       || false,
          appliquer_retenue:   facture.appliquer_retenue   || false,
          appliquer_bic:       facture.appliquer_bic       || false,
          appliquer_transport: facture.appliquer_transport || false,
          montant_transport:   facture.montant_transport   || 0,
        });

        while (this.lignes.length) { this.lignes.removeAt(0); }

        if (facture.lignes) {
          facture.lignes.forEach((l: any) => {
            this.lignes.push(this.creerLigneForm(l));
          });
        }
        this.calculerTotaux();
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

  ajouterLigne(): void {
    this.lignes.push(this.creerLigneForm());
    this.calculerTotaux();
  }

  supprimerLigne(i: number): void {
    this.lignes.removeAt(i);
    this.calculerTotaux();
  }

  calculerTotaux(): void {
    // ── Lignes ──────────────────────────────────────────
    let total = 0;
    for (let i = 0; i < this.lignes.length; i++) {
      const lg  = this.lignes.at(i) as FormGroup;
      const pu  = Number(lg.get('prix_unitaire_ht')?.value) || 0;
      const qte = Number(lg.get('quantite')?.value)         || 0;
      total += pu * qte;
    }
    this.totalHT = total;

    // ── Remise ──────────────────────────────────────────
    const avecRemise = !!this.factureForm.get('appliquer_remise')?.value;
    const remisePct  = Number(this.factureForm.get('remise_pct')?.value) || 0;
    this.montantRemise    = (avecRemise && remisePct > 0) ? Math.round(total * remisePct / 100) : 0;
    this.totalApresRemise = total - this.montantRemise;

    // ── TVA 18% ─────────────────────────────────────────
    this.tva = this.factureForm.get('appliquer_tva')?.value
      ? Math.round(this.totalApresRemise * 0.18) : 0;

    // ── Retenue 5% ──────────────────────────────────────
    this.retenue = this.factureForm.get('appliquer_retenue')?.value
      ? Math.round(this.totalApresRemise * 0.05) : 0;

    // ── BIC 2% = 2% de (HT net + TVA) ──────────────────
    this.bic = this.factureForm.get('appliquer_bic')?.value
      ? Math.round((this.totalApresRemise + this.tva) * 0.02) : 0;

    // ── Transport (montant manuel) ───────────────────────
    this.transport = this.factureForm.get('appliquer_transport')?.value
      ? Math.round(Number(this.factureForm.get('montant_transport')?.value) || 0) : 0;

    // ── Total net ────────────────────────────────────────
    this.totalNet = this.totalApresRemise + this.tva - this.retenue - this.bic + this.transport;
  }

  onSubmit(): void {
    if (this.factureForm.invalid) return;
    this.isLoading    = true;
    this.errorMessage = '';

    const fv = this.factureForm.value;

    const facture: any = {
      client:              fv.client,
      type_doc:            fv.type_doc,
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