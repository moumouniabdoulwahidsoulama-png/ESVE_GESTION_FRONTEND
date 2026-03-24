import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ClientService } from '../../core/services/client.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats:      any   = null;
  nbClients         = 0;
  isLoading         = true;
  errorMessage      = '';
  isClient          = false;

  constructor(
    private http: HttpClient,
    private clientService: ClientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isClient = this.authService.isClient();

    if (this.isClient) {
      // Dashboard simplifié pour les clients
      this.isLoading = false;
      return;
    }

    // Dashboard complet pour Admin et Employé
    this.http.get<any>('/api/v1/dashboard/stats/').subscribe({
      next: (data) => {
        this.stats    = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur dashboard:', error);
        this.errorMessage = 'Impossible de charger les statistiques';
        this.isLoading    = false;
      }
    });

    this.clientService.getAll().subscribe({
      next: (data: any) => {
        const clients  = data.results ? data.results : data;
        this.nbClients = data.count || clients.length;
      },
      error: () => {}
    });
  }

  formatMontant(montant: number): string {
    if (!montant) return '0';
    return new Intl.NumberFormat('fr-FR').format(Math.round(montant));
  }
}