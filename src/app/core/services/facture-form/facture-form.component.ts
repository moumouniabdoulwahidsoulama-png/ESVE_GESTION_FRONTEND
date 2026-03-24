import { Component, OnInit } from '@angular/core';
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FactureService, Facture, LigneFacture } from '../../../core/services/facture.service';
import { ClientService, Client } from '../../../core/services/client.service';

@Component({
  selector: 'app-facture-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    RouterLink
  ],
  templateUrl: './facture-form.component.html',
  styleUrls: ['./facture-form.component.scss']
})
export class FactureFormComponent implements OnInit {
  factureForm: FormGroup;
  isEditMode   = false;
  factureId?: number;
  clients: Client[] = [];
  isLoading    = false;
  errorMessage = '';

  totalHT           = 0;
  montantRemise     = 0;
  totalApresRemise  = 0;
  tva               = 0;
  retenue           = 0;
  bic               = 0;
  totalNet          = 0;

  constructor(
    private fb: FormBuilder,
    private factureService: FactureService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.factureForm = this.fb.group({
      client:    ['', Validators.required],
      type_doc:  ['PROFORMA', Validators.required],
      remise_pct:[0, [Validators.min(0), Validators.max(100)]],
      notes:     [''],
      lignes:    this.fb.array([])
    });
  }

  get lignes(): FormArray {
    return this.factureForm.get('lignes') as FormArray;
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

  // Écouter chaque champ séparément
  this.factureForm.get('appliquer_remise')?.valueChanges.subscribe(() => this.calculerTotaux());
  this.factureForm.get('appliquer_tva')?.valueChanges.subscribe(() => this.calculerTotaux());
  this.factureForm.get('appliquer_retenue')?.valueChanges.subscribe(() => this.calculerTotaux());
  this.factureForm.get('appliquer_bic')?.valueChanges.subscribe(() => this.calculerTotaux());
  this.factureForm.get('remise_pct')?.valueChanges.subscribe(() => this.calculerTotaux());
  this.factureForm.get('lignes')?.valueChanges.subscribe(() => this.calculerTotaux());
}

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (data: any) => {
        this.clients = data.results ? data.results : data;
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
      }
    });
  }

  loadFacture(id: number): void {
    this.factureService.getById(id).subscribe({
      next: (facture: any) => {
        this.factureForm.patchValue({
          client:     facture.client,
          type_doc:   facture.type_doc,
          remise_pct: facture.remise_pct || 0,
          notes:      facture.notes || ''
        });
        while (this.lignes.length) {
          this.lignes.removeAt(0);
        }
        if (facture.lignes) {
          facture.lignes.forEach((ligne: any) => {
            this.lignes.push(this.creerLigneForm(ligne));
          });
        }
        this.calculerTotaux();
      },
      error: (error) => {
        console.error('Erreur chargement facture:', error);
        this.errorMessage = 'Impossible de charger la facture';
      }
    });
  }

  creerLigneForm(ligne?: any): FormGroup {
    return this.fb.group({
      description:           [ligne?.description || '',           Validators.required],
      reference_client:      [ligne?.reference_client || ''],
      reference_fournisseur: [ligne?.reference_fournisseur || ''],
      prix_unitaire_ht:      [ligne?.prix_unitaire_ht || 0,       [Validators.required, Validators.min(0)]],
      quantite:              [ligne?.quantite || 1,               [Validators.required, Validators.min(1)]],
      delais:                [ligne?.delais || ''],
      ordre:                 [ligne?.ordre || 0]
    });
  }

  ajouterLigne(): void {
    this.lignes.push(this.creerLigneForm());
  }

  supprimerLigne(index: number): void {
    this.lignes.removeAt(index);
  }

  calculerTotaux(): void {
  const lignes = (this.factureForm.get('lignes') as any)?.controls || [];
  let total = 0;

  lignes.forEach((ligneCtrl: any) => {
    const pu  = parseFloat(ligneCtrl.get('prix_unitaire_ht')?.value) || 0;
    const qte = parseFloat(ligneCtrl.get('quantite')?.value) || 0;
    total += pu * qte;
  });

  this.totalHT = total;

  // Remise
  const appliquerRemise = this.factureForm.get('appliquer_remise')?.value;
  const remisePct       = parseFloat(this.factureForm.get('remise_pct')?.value) || 0;

  if (appliquerRemise && remisePct > 0) {
    this.montantRemise = total * (remisePct / 100);
  } else {
    this.montantRemise = 0;
  }
  this.totalApresRemise = total - this.montantRemise;

  // TVA
  this.tva = this.factureForm.get('appliquer_tva')?.value
    ? this.totalApresRemise * 0.18 : 0;

  // Retenue
  this.retenue = this.factureForm.get('appliquer_retenue')?.value
    ? this.totalApresRemise * 0.05 : 0;

  // BIC
  this.bic = this.factureForm.get('appliquer_bic')?.value
    ? this.totalApresRemise * 0.02 : 0;

  // Total net
  this.totalNet = this.totalApresRemise + this.tva - this.retenue - this.bic;
}

  onSubmit(): void {
    if (this.factureForm.invalid) return;
    this.isLoading    = true;
    this.errorMessage = '';

    const formValue   = this.factureForm.value;
    const facture: any = {
      client:     formValue.client,
      type_doc:   formValue.type_doc,
      remise_pct: formValue.remise_pct,
      notes:      formValue.notes,
      lignes:     formValue.lignes.map((l: any, index: number) => ({
        description:           l.description,
        reference_client:      l.reference_client,
        reference_fournisseur: l.reference_fournisseur,
        prix_unitaire_ht:      l.prix_unitaire_ht,
        quantite:              l.quantite,
        delais:                l.delais,
        ordre:                 index + 1
      }))
    };

    if (this.isEditMode && this.factureId) {
      this.factureService.update(this.factureId, facture).subscribe({
        next: () => this.router.navigate(['/factures']),
        error: (error) => {
          console.error('Erreur mise à jour:', error);
          this.errorMessage = 'Erreur lors de la mise à jour';
          this.isLoading    = false;
        }
      });
    } else {
      this.factureService.create(facture).subscribe({
        next: () => this.router.navigate(['/factures']),
        error: (error) => {
          console.error('Erreur création:', error);
          this.errorMessage = 'Erreur : ' + JSON.stringify(error.error);
          this.isLoading    = false;
        }
      });
    }
  }
}