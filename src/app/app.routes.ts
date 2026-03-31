import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },

  // Clients
  {
    path: 'clients',
    loadComponent: () => import('./features/clients/client-list/client-list.component')
      .then(m => m.ClientListComponent)
  },
  {
    path: 'clients/new',
    loadComponent: () => import('./features/clients/client-form/client-form.component')
      .then(m => m.ClientFormComponent)
  },
  {
    path: 'clients/edit/:id',
    loadComponent: () => import('./features/clients/client-form/client-form.component')
      .then(m => m.ClientFormComponent)
  },
  {
    path: 'clients/:id/edit',
    loadComponent: () => import('./features/clients/client-form/client-form.component')
      .then(m => m.ClientFormComponent)
  },

  // Factures
  {
    path: 'factures',
    loadComponent: () => import('./features/factures/facture-list/facture-list.component')
      .then(m => m.FactureListComponent)
  },
  {
    path: 'factures/new',
    loadComponent: () => import('./features/factures/facture-form/facture-form.component')
      .then(m => m.FactureFormComponent)
  },
  {
    path: 'factures/edit/:id',
    loadComponent: () => import('./features/factures/facture-form/facture-form.component')
      .then(m => m.FactureFormComponent)
  },
  {
    path: 'factures/:id/edit',
    loadComponent: () => import('./features/factures/facture-form/facture-form.component')
      .then(m => m.FactureFormComponent)
  },

  // Bons de commande
  {
    path: 'bons-commande',
    loadComponent: () => import('./features/bons-commande/bon-commande-list/bon-commande-list.component')
      .then(m => m.BonCommandeListComponent)
  },
  {
    path: 'bons-commande/new',
    loadComponent: () => import('./features/bons-commande/bon-commande-form/bon-commande-form.component')
      .then(m => m.BonCommandeFormComponent)
  },
  {
    path: 'bons-commande/edit/:id',
    loadComponent: () => import('./features/bons-commande/bon-commande-form/bon-commande-form.component')
      .then(m => m.BonCommandeFormComponent)
  },
  {
    path: 'bons-commande/:id/edit',
    loadComponent: () => import('./features/bons-commande/bon-commande-form/bon-commande-form.component')
      .then(m => m.BonCommandeFormComponent)
  },

  {
  path: 'vitrine',
  loadComponent: () => import('./features/public/landing/landing.component')
    .then(m => m.LandingComponent)
  },

  {
  path: 'admin/demandes',
  loadComponent: () => import('./features/admin/demandes/demandes.component')
    .then(m => m.DemandesComponent)
  },

  {
  path: 'admin/utilisateurs',
  loadComponent: () => import('./features/admin/utilisateurs/utilisateurs.component')
    .then(m => m.UtilisateursComponent)
  },

  {
    path: 'offres',
    loadComponent: () => import('./features/offres/offre-list.component')
      .then(m => m.OffreListComponent)
  },
  {
    path: 'offres/new',
    loadComponent: () => import('./features/offres/offre-form.component')
      .then(m => m.OffreFormComponent)
  },
  {
    path: 'offres/edit/:id',
    loadComponent: () => import('./features/offres/offre-form.component')
      .then(m => m.OffreFormComponent)
  },

  { path: 'corbeille', 
    loadComponent: () => import('./features/corbeille/corbeille.component')
      .then(m => m.CorbeilleComponent) },

  { path: '',   redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];