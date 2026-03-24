import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {
  utilisateurs:   any[] = [];
  isLoading     = true;
  errorMessage  = '';
  showForm      = false;
  isSubmitting  = false;
  successMessage = '';
  userForm:       FormGroup;

  roleOptions = [
    { value: 'ADMIN',   label: '👑 Administrateur', desc: 'Accès complet à tout' },
    { value: 'EMPLOYE', label: '👨‍💼 Employé',        desc: 'Accès complet sauf gestion utilisateurs' },
    { value: 'CLIENT',  label: '👤 Client',          desc: 'Accès lecture seule à ses factures' },
  ];

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name:  [''],
      username:   ['', [Validators.required, Validators.minLength(3)]],
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      role:       ['EMPLOYE', Validators.required],
      telephone:  [''],
    });
  }

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.isLoading = true;
    this.http.get<any[]>('/api/v1/auth/utilisateurs/').subscribe({
      next: (data) => {
        this.utilisateurs = Array.isArray(data) ? data : (data as any).results || [];
        this.isLoading    = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les utilisateurs';
        this.isLoading    = false;
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;
    this.isSubmitting  = true;
    this.errorMessage  = '';
    this.successMessage = '';

    this.http.post('/api/v1/auth/register/', this.userForm.value).subscribe({
      next: () => {
        this.successMessage = `✅ Compte "${this.userForm.value.username}" créé avec succès !`;
        this.isSubmitting   = false;
        this.showForm       = false;
        this.userForm.reset({ role: 'EMPLOYE' });
        this.loadUtilisateurs();
      },
      error: (e) => {
        this.errorMessage = 'Erreur : ' + JSON.stringify(e.error);
        this.isSubmitting  = false;
      }
    });
  }

  getRoleLabel(profil: any): string {
    if (!profil) return 'EMPLOYÉ';
    const r = this.roleOptions.find(o => o.value === profil.role);
    return r ? r.label : profil.role;
  }

  getRoleColor(profil: any): string {
    if (!profil) return '#757575';
    const map: any = {
      'ADMIN':   '#D4830A',
      'EMPLOYE': '#1565C0',
      'CLIENT':  '#2E7D32',
    };
    return map[profil.role] || '#757575';
  }
}