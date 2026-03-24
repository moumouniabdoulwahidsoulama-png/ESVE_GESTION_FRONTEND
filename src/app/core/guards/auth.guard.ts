import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const platformId  = inject(PLATFORM_ID);

  // Côté serveur SSR — laisser passer
  if (!isPlatformBrowser(platformId)) {
    return router.parseUrl('/login');
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.parseUrl('/login');
};