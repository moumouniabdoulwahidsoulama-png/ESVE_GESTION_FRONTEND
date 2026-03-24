import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatInputModule
  ],
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.scss']
})
export class DemandesComponent implements OnInit {
  demandes:     any[]  = [];
  isLoading           = true;
  errorMessage        = '';
  selectedDemande:    any = null;
  showDetail          = false;

  statutOptions = [
    { value: 'NOUVEAU',      label: '🆕 Nouveau',          color: '#1565C0' },
    { value: 'EN_COURS',     label: '⚙️ En cours',          color: '#E65100' },
    { value: 'CONTACTE',     label: '📞 Contacté',          color: '#6A1B9A' },
    { value: 'DEVIS_ENVOYE', label: '📄 Devis envoyé',      color: '#D4830A' },
    { value: 'ACCEPTE',      label: '✅ Accepté',            color: '#2E7D32' },
    { value: 'REFUSE',       label: '❌ Refusé',             color: '#B71C1C' },
  ];

  displayedColumns = ['date', 'entreprise', 'contact', 'type', 'budget', 'statut', 'actions'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
  this.isLoading = true;
  this.http.get<any>('/api/v1/auth/demandes/liste/').subscribe({
    next: (data) => {
      // Gérer la pagination Django
      this.demandes  = Array.isArray(data) ? data : (data.results || []);
      this.isLoading = false;
    },
    error: (e) => {
      console.error('Erreur:', e);
      this.errorMessage = 'Impossible de charger les demandes';
      this.isLoading    = false;
    }
  });
}

  voirDetail(demande: any): void {
    this.selectedDemande = { ...demande };
    this.showDetail      = true;
  }

  fermerDetail(): void {
    this.showDetail      = false;
    this.selectedDemande = null;
  }

  updateStatut(): void {
  if (!this.selectedDemande) return;

  this.http.patch(
    `/api/v1/auth/demandes/${this.selectedDemande.id}/statut/`,
    {
      statut:         this.selectedDemande.statut,
      notes_internes: this.selectedDemande.notes_internes || ''
    }
  ).subscribe({
    next: (data) => {
      console.log('Mise à jour réussie:', data);
      // Mettre à jour localement sans recharger
      const index = this.demandes.findIndex(d => d.id === this.selectedDemande.id);
      if (index !== -1) {
        this.demandes[index] = { ...this.demandes[index], ...data };
      }
      this.fermerDetail();
      this.loadDemandes();
    },
    error: (e) => {
      console.error('Erreur mise à jour:', e);
      alert('Erreur : ' + JSON.stringify(e.error));
    }
  });
}

  getStatutColor(statut: string): string {
    const s = this.statutOptions.find(o => o.value === statut);
    return s ? s.color : '#757575';
  }

  getStatutLabel(statut: string): string {
    const s = this.statutOptions.find(o => o.value === statut);
    return s ? s.label : statut;
  }

  getBudgetLabel(budget: string): string {
    const map: any = {
      'MOINS_500K': '< 500K FCFA',
      '500K_1M':    '500K — 1M FCFA',
      '1M_3M':      '1M — 3M FCFA',
      'PLUS_3M':    '> 3M FCFA',
      'A_DISCUTER': 'À discuter',
    };
    return map[budget] || budget;
  }

  getTypeLabel(type: string): string {
    const map: any = {
      'GESTION':   'Gestion',
      'ECOMMERCE': 'E-commerce',
      'VITRINE':   'Site vitrine',
      'MOBILE':    'Mobile',
      'ERP':       'ERP/CRM',
      'AUTRE':     'Autre',
    };
    return map[type] || type;
  }

  countByStatut(statut: string): number {
  return this.demandes.filter(d => d.statut === statut).length;
}

}