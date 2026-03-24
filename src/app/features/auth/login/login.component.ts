import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  inscriptionForm: FormGroup;
  isLoading        = false;
  errorMessage     = '';
  showInscription  = false;
  inscriptionSuccess = false;
  inscriptionError   = '';
  inscriptionLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email:    ['', Validators.required],
      password: ['', Validators.required]
    });

    this.inscriptionForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name:  [''],
      username:   ['', [Validators.required, Validators.minLength(3)]],
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      role:       ['CLIENT'],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading    = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.errorMessage = 'Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.';
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