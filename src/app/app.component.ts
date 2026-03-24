import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.authService.isLoggedIn()) {
      this.authService.chargerProfil().subscribe({
        error: () => {}
      });
    }
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return this.authService.isLoggedIn();
  }

  isLoginPage(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    return this.router.url === '/login';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isEmploye(): boolean {
    return this.authService.isEmploye();
  }

  isClient(): boolean {
    return this.authService.isClient();
  }

  getRole(): string {
    return this.authService.getRole();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}