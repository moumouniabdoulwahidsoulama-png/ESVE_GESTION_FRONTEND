import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
  email:    ['', [Validators.required]],  // On enlève Validators.email
  password: ['', Validators.required]
});

  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
  if (this.loginForm.invalid) return;
  this.isLoading    = true;
  this.errorMessage = '';
  const { email, password } = this.loginForm.value;

  this.authService.login(email, password).subscribe({
    next: () => {
      // Charger le profil AVANT de naviguer
      this.authService.chargerProfil().subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          // Si erreur profil, naviguer quand même
          this.router.navigate(['/dashboard']);
        }
      });
    },
    error: (error: any) => {
      this.isLoading    = false;
      this.errorMessage = 'Email ou mot de passe incorrect';
      console.error('Erreur login:', error);
    }
  });
}
}