import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { ClientService, Client } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    RouterLink
  ],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  displayedColumns: string[] = ['nom_entreprise', 'contact_nom', 'telephone', 'email', 'actions'];
  isLoading = true;
  errorMessage = '';

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getAll().subscribe({
      next: (data: any) => {
        // Gère la pagination Django (results) ou tableau direct
        this.clients = data.results ? data.results : data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
        this.errorMessage = 'Impossible de charger les clients';
        this.isLoading = false;
      }
    });
  }

  deleteClient(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
      this.clientService.delete(id!).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          alert('Impossible de supprimer ce client');
        }
      });
    }
  }
}