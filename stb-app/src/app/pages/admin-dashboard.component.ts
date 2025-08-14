// src/app/pages/admin-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';

import {
  faDashboard,
  faUser,
  faCogs,
  faSignOutAlt,
  faSearch,
  faBell,
  faEnvelope,
  faChevronDown,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  faDashboard = faDashboard;
  faUser = faUser;
  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;
  faSearch = faSearch;
  faBell = faBell;
  faEnvelope = faEnvelope;
  faChevronDown = faChevronDown;
  faTrashAlt = faTrashAlt;

  message = '';
  erreur = '';
  utilisateurs: User[] = [];
  recherche = '';
  activeSection: 'dashboard' | 'users' | 'settings' = 'dashboard';

  nouveauClient = {
    nom: '',
    email: '',
    motDePasse: '',
    nomAgence: '',
    region: '',
    role: ''  // ✅ Ajout obligatoire
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  get headers() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  get utilisateursFiltres(): User[] {
    const filtre = this.recherche.toLowerCase();
    return this.utilisateurs.filter(u =>
      u.nom?.toLowerCase().includes(filtre) ||
      u.email?.toLowerCase().includes(filtre) ||
      u.role?.toLowerCase().includes(filtre)
    );
  }

  chargerUtilisateurs(): void {
    this.http.get<User[]>('https://localhost:44320/api/admin/users', this.headers)
      .subscribe({
        next: (data) => {
          this.utilisateurs = data;
          this.erreur = '';
        },
        error: (err) => {
          console.error('Erreur lors du chargement des utilisateurs', err);
          this.erreur = 'Erreur lors du chargement des utilisateurs.';
        }
      });
  }

  creerCompteClient(): void {
    this.http.post('https://localhost:44320/api/admin/users', this.nouveauClient, this.headers)
      .subscribe({
        next: () => {
          this.message = '✅ Compte client créé avec succès';
          this.erreur = '';
          this.nouveauClient = {
            nom: '',
            email: '',
            motDePasse: '',
            nomAgence: '',
            region: '',
            role: ''  // ✅ Réinitialisation du champ role aussi
          };
          this.chargerUtilisateurs();
        },
        error: (err) => {
          console.error('Erreur lors de la création du compte', err);
          this.message = '';
          this.erreur = '❌ Erreur lors de la création du compte. ' + (err.error?.message || '');
        }
      });
  }

  supprimerUtilisateur(id: number): void {
    if (confirm('Confirmer la suppression de cet utilisateur ?')) {
      this.http.delete(`https://localhost:44320/api/admin/users/${id}`, this.headers)
        .subscribe({
          next: () => {
            this.message = '✅ Utilisateur supprimé avec succès';
            this.erreur = '';
            this.chargerUtilisateurs();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
            this.message = '';
            this.erreur = '❌ Erreur lors de la suppression. ' + (err.error?.message || '');
          }
        });
    }
  }

  selectSection(section: 'dashboard' | 'users' | 'settings'): void {
    this.activeSection = section;
    this.message = '';
    this.erreur = '';
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
