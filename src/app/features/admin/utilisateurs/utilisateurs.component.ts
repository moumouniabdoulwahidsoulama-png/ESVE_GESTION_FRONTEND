import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

interface Utilisateur {
  id:         number;
  username:   string;
  email:      string;
  first_name: string;
  last_name:  string;
  role:       string;
  is_active:  boolean;
}

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatTooltipModule
  ],
  template: `
    <div style="padding:24px; max-width:1000px; margin:0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h1 style="margin:0;">Utilisateurs</h1>
      </div>

      <div *ngIf="errorMessage" style="color:red; padding:12px; margin-bottom:16px;
                  background:#FFEBEE; border-radius:4px;">
        {{ errorMessage }}
      </div>

      <div *ngIf="successMessage" style="color:green; padding:12px; margin-bottom:16px;
                  background:#E8F5E9; border-radius:4px;">
        {{ successMessage }}
      </div>

      <div *ngIf="isLoading" style="text-align:center; padding:40px; color:#888;">
        Chargement...
      </div>

      <table mat-table [dataSource]="utilisateurs" *ngIf="!isLoading"
             style="width:100%; box-shadow:0 2px 8px rgba(0,0,0,.08); border-radius:8px; overflow:hidden;">

        <!-- Nom -->
        <ng-container matColumnDef="nom">
          <th mat-header-cell *matHeaderCellDef style="font-weight:700;">Nom</th>
          <td mat-cell *matCellDef="let u">
            <strong>{{ u.first_name }} {{ u.last_name }}</strong><br>
            <span style="font-size:12px; color:#888;">{{ u.username }}</span>
          </td>
        </ng-container>

        <!-- Email -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef style="font-weight:700;">Email</th>
          <td mat-cell *matCellDef="let u">{{ u.email || '—' }}</td>
        </ng-container>

        <!-- Rôle -->
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef style="font-weight:700;">Rôle</th>
          <td mat-cell *matCellDef="let u">
            <span [style.background]="u.role === 'ADMIN' ? '#D4A017' : u.role === 'CLIENT' ? '#1565C0' : '#388E3C'"
                  style="color:white; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600;">
              {{ u.role }}
            </span>
          </td>
        </ng-container>

        <!-- Statut -->
        <ng-container matColumnDef="statut">
          <th mat-header-cell *matHeaderCellDef style="font-weight:700;">Statut</th>
          <td mat-cell *matCellDef="let u">
            <span [style.color]="u.is_active ? 'green' : 'red'" style="font-weight:600; font-size:13px;">
              {{ u.is_active ? '✅ Actif' : '❌ Inactif' }}
            </span>
          </td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef style="font-weight:700;">Actions</th>
          <td mat-cell *matCellDef="let u">
            <button mat-icon-button color="warn"
                    [disabled]="u.id === currentUserId"
                    [matTooltip]="u.id === currentUserId ? 'Vous ne pouvez pas vous supprimer' : 'Supprimer'"
                    (click)="supprimer(u)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"
            style="background:#1A1A2E;"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            style="cursor:default;"></tr>
      </table>

      <div *ngIf="!isLoading && utilisateurs.length === 0"
           style="text-align:center; padding:40px; color:#888;">
        Aucun utilisateur trouvé.
      </div>
    </div>
  `
})
export class UtilisateursComponent implements OnInit {
  utilisateurs:     Utilisateur[] = [];
  displayedColumns  = ['nom', 'email', 'role', 'statut', 'actions'];
  isLoading         = true;
  errorMessage      = '';
  successMessage    = '';
  currentUserId     = 0;

  constructor(
    private http:        HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId?.() || 0;
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.isLoading = true;
    this.http.get<Utilisateur[]>('/api/v1/comptes/utilisateurs/').subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.isLoading    = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.isLoading    = false;
      }
    });
  }

  supprimer(u: Utilisateur): void {
    if (!confirm(`Supprimer l'utilisateur "${u.username}" ? Cette action est irréversible.`)) return;

    this.http.delete<any>(`/api/v1/comptes/utilisateurs/${u.id}/supprimer/`).subscribe({
      next: (res) => {
        this.successMessage = res.success || 'Utilisateur supprimé.';
        this.utilisateurs   = this.utilisateurs.filter(x => x.id !== u.id);
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (e) => {
        this.errorMessage = e.error?.error || 'Erreur lors de la suppression.';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }
}