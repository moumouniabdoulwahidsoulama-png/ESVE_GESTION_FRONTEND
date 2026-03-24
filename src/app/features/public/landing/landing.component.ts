import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  demandeForm:        FormGroup;
  inscriptionForm:    FormGroup;
  isLoading         = false;
  isSuccess         = false;
  errorMessage      = '';
  showInscription   = false;
  inscriptionSuccess = false;
  inscriptionError  = '';
  inscriptionLoading = false;

  fonctionnalites = [
    { icon: '🧾', titre: 'Facturation Pro',    desc: 'Factures et proformas avec calculs TVA, retenue, BIC automatiques' },
    { icon: '📦', titre: 'Bons de Commande',    desc: 'Gestion complète des commandes fournisseurs avec termes DDP' },
    { icon: '👥', titre: 'Gestion Clients',     desc: 'Base clients avec informations légales RCCM, IFU, régime fiscal' },
    { icon: '📄', titre: 'Génération PDF',       desc: 'Documents PDF professionnels avec logo, montant en lettres' },
    { icon: '📊', titre: 'Tableau de bord',      desc: 'Statistiques en temps réel : CA, top clients, évolution mensuelle' },
    { icon: '🔐', titre: 'Multi-utilisateurs',   desc: 'Gestion des rôles Admin, Employé, Client avec accès différenciés' },
  ];

  typeOptions = [
  { value: 'GESTION',   label: '💻 Application de gestion' },
  { value: 'ECOMMERCE', label: '🛒 Site e-commerce' },
  { value: 'VITRINE',   label: '🌐 Site vitrine' },
  { value: 'MOBILE',    label: '📱 Application mobile' },
  { value: 'ERP',       label: '🏢 ERP / CRM' },
  { value: 'AFFICHE',   label: '🎨 Affiche & Flyer' },
  { value: 'LOGO',      label: '✏️ Logo & Identité visuelle' },
  { value: 'PACK',      label: '🏆 Pack Digital Complet' },
  { value: 'AUTRE',     label: '💡 Autre' },
];

  budgetOptions = [
    { value: 'MOINS_500K', label: 'Moins de 500 000 FCFA' },
    { value: '500K_1M',    label: '500 000 — 1 000 000 FCFA' },
    { value: '1M_3M',      label: '1 000 000 — 3 000 000 FCFA' },
    { value: 'PLUS_3M',    label: 'Plus de 3 000 000 FCFA' },
    { value: 'A_DISCUTER', label: 'À discuter' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.demandeForm = this.fb.group({
      nom_entreprise:   ['', Validators.required],
      nom_contact:      ['', Validators.required],
      telephone:        ['', Validators.required],
      email:            ['', [Validators.required, Validators.email]],
      pays:             ['Burkina Faso'],
      ville:            [''],
      type_application: ['GESTION', Validators.required],
      budget:           ['A_DISCUTER'],
      description:      ['', [Validators.required, Validators.minLength(20)]],
      fonctionnalites:  [''],
      delai_souhaite:   [''],
    });

    this.inscriptionForm = this.fb.group({
      username:   ['', [Validators.required, Validators.minLength(3)]],
      email:      ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name:  [''],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      role:       ['CLIENT'],
    });
  }

  ngOnInit(): void {}

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  onSubmit(): void {
    if (this.demandeForm.invalid) return;
    this.isLoading    = true;
    this.errorMessage = '';

    this.http.post('/api/v1/auth/demandes/', this.demandeForm.value).subscribe({
      next: () => {
        this.isSuccess = true;
        this.isLoading = false;
        this.demandeForm.reset({
          pays: 'Burkina Faso',
          type_application: 'GESTION',
          budget: 'A_DISCUTER'
        });
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'envoi. Veuillez réessayer.';
        this.isLoading    = false;
      }
    });
  }

  onInscription(): void {
    if (this.inscriptionForm.invalid) return;
    this.inscriptionLoading = true;
    this.inscriptionError   = '';

    this.http.post('/api/v1/auth/register/', this.inscriptionForm.value).subscribe({
      next: () => {
        this.inscriptionSuccess = true;
        this.inscriptionLoading = false;
      },
      error: (e) => {
        this.inscriptionError   = 'Erreur : ' + JSON.stringify(e.error);
        this.inscriptionLoading = false;
      }
    });
  }
}