// src/app/app.routes.ts

import { Routes } from '@angular/router';
// Import du composant ClientDashboard
import { ClientDashboardComponent } from './pages/client-dashboard.component';
// Import du composant LoginComponent
import { LoginComponent } from './pages/login.component';
// Import du composant GestionnaireDashboard
import { GestionnaireDashboardComponent } from './pages/gestionnaire-dashboard.component';
// Import du composant AdminDashboard (NOUVELLE LIGNE)
import { AdminDashboardComponent } from './pages/admin-dashboard.component'; // <-- Assure-toi que ce chemin est correct

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: 'gestionnaire-dashboard', component: GestionnaireDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent }, // <-- NOUVELLE ROUTE
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirige la racine vers la page de connexion
  { path: '**', redirectTo: '/login' } // Gère les routes inconnues en redirigeant vers la page de connexion
];