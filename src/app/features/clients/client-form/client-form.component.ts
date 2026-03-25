import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService, Client } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode = false;
  clientId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.clientForm = this.fb.group({
      nom_entreprise:    ['', Validators.required],
      contact_nom:       [''],                          // ← plus required
      telephone:         ['', Validators.required],
      email:             ['', Validators.email],        // ← optionnel, format email si renseigné
      adresse:           [''],                          // ← plus required
      rccm:              [''],
      ifu:               [''],
      regime_imposition: [''],
      division_fiscale:  ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.clientId   = +params['id'];
        this.loadClient(this.clientId);
      }
    });
  }

  loadClient(id: number): void {
    this.clientService.getById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue(client);
      },
      error: (error) => {
        console.error('Erreur chargement client:', error);
        this.errorMessage = 'Impossible de charger le client';
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) return;
    this.isLoading    = true;
    this.errorMessage = '';
    const client: Client = this.clientForm.value;

    if (this.isEditMode && this.clientId) {
      this.clientService.update(this.clientId, client).subscribe({
        next: () => { this.router.navigate(['/clients']); },
        error: (error) => {
          console.error('Erreur mise à jour:', error);
          this.errorMessage = 'Erreur lors de la mise à jour';
          this.isLoading    = false;
        }
      });
    } else {
      this.clientService.create(client).subscribe({
        next: () => { this.router.navigate(['/clients']); },
        error: (error) => {
          console.error('Erreur création:', error);
          this.errorMessage = 'Erreur lors de la création';
          this.isLoading    = false;
        }
      });
    }
  }
}