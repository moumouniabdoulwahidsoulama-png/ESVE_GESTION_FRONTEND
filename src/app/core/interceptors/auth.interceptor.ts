import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Cloner la requête en ajoutant l'en-tête Authorization si le token existe
    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si erreur 401 (non autorisé), on peut tenter de rafraîchir le token
        if (error.status === 401 && !req.url.includes('/auth/refresh/')) {
          // Éviter une boucle infinie avec la requête de refresh
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Appeler le refresh token
    return this.authService.refreshToken().pipe(
      switchMap((response: any) => {
        // Nouveau token obtenu, rejouer la requête
        const newToken = response.access;
        const clonedReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${newToken}`)
        });
        return next.handle(clonedReq);
      }),
      catchError((err) => {
        // Si le refresh échoue, déconnecter l'utilisateur
        this.authService.logout();
        this.router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  }
}