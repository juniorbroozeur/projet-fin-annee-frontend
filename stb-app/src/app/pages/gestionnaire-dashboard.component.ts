// src/app/pages/gestionnaire-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; // Importe HttpHeaders
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faDashboard,
  faUser,
  faCogs,
  faSignOutAlt,
  faSearch,
  faBell,
  faEnvelope,
  faChevronDown,
  faCreditCard,
  faHourglassHalf,
  faCheckCircle,
  faExclamationCircle,
  faTrashAlt,
  faCheck,
  faReply,
  faEye,
  faListAlt,
  faUserCircle // Ajout d'une icône pour les clients si nécessaire
} from '@fortawesome/free-solid-svg-icons';

// Interfaces (vérifie qu'elles sont aussi présentes)
interface CarteManager {
  id: number;
  numero: string;
  dateExpiration: string; // Utilise 'string' si ton API renvoie une chaîne ISO 8601
  statut: 'EN_ATTENTE' | 'VALIDEE'; // Ou tout autre statut que ton API renvoie
  clientId: number; // Rendu obligatoire pour afficher les infos client
  clientNom: string; // Rendu obligatoire pour afficher les infos client
}

interface Probleme {
  id: number;
  description: string;
  dateSignalement: string; // Utilise 'string' si ton API renvoie une chaîne ISO 8601
  statut: 'OUVERT' | 'RESOLU'; // Ou tout autre statut
  clientId: number; // Rendu obligatoire
  clientNom: string; // Rendu obligatoire
}

@Component({
  selector: 'app-gestionnaire-dashboard',
  templateUrl: './gestionnaire-dashboard.component.html',
  styleUrls: ['./gestionnaire-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    FontAwesomeModule
  ]
})
export class GestionnaireDashboardComponent implements OnInit {

  // Icônes Font Awesome
  faDashboard = faDashboard;
  faUser = faUser;
  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;
  faSearch = faSearch;
  faBell = faBell;
  faEnvelope = faEnvelope;
  faChevronDown = faChevronDown;
  faCreditCard = faCreditCard;
  faHourglassHalf = faHourglassHalf;
  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;
  faTrashAlt = faTrashAlt;
  faCheck = faCheck;
  faReply = faReply;
  faEye = faEye;
  faListAlt = faListAlt;
  faUserCircle = faUserCircle; // Nouvelle icône pour les clients

  // Données
  cartesEnAttente: CarteManager[] = [];
  cartesValidees: CarteManager[] = [];
  problemes: Probleme[] = [];

  // Variables d'état pour la navigation et l'affichage des sections
  activeSection: 'dashboard' | 'cartes' | 'problemes' | 'settings' | 'clients' = 'dashboard'; // Ajout de 'clients'
  showPendingCardsList: boolean = false;
  showValidatedCardsList: boolean = false;
  showProblemsList: boolean = false;
  showClientsList: boolean = false; // Nouvelle variable pour la liste des clients

  erreur: string = '';
  messageSuccess: string = '';

  // Informations sur l'utilisateur connecté (gestionnaire)
  // En situation réelle, ces infos viendraient du token JWT décodé ou d'un appel API '/me'.
  managerName: string = 'Gestionnaire STB';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    // Vérifier si un token JWT est présent
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      // Si aucun token, rediriger vers la page de connexion.
      // Assurez-vous d'avoir une route '/login' configurée dans votre application Angular.
      this.router.navigate(['/login']);
      return; // Arrêter l'exécution si pas de token
    }

    // Décoder le token pour obtenir le nom du gestionnaire (exemple simple)
    // En production, utilisez une bibliothèque comme 'jwt-decode'
    try {
      const decodedToken = this.decodeJwtToken(token);
      if (decodedToken && decodedToken.name) { // Assumons que le token a un champ 'name'
        this.managerName = decodedToken.name;
      }
    } catch (e) {
      console.error('Erreur lors du décodage du token JWT', e);
      this.erreur = 'Session invalide. Veuillez vous reconnecter.';
      this.logout(); // Déconnexion en cas de token invalide
      return;
    }

    // Charger les données initiales
    this.fetchCartesEnAttente();
    this.fetchCartesValidees();
    this.fetchProblemes();
    // this.fetchClients(); // Décommenter si une section 'clients' est ajoutée
  }

  /**
   * Méthode pour obtenir les en-têtes HTTP avec le token JWT.
   * @returns HttpHeaders
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Ajoute le token JWT
      });
    }
    // Si pas de token, retourne des en-têtes sans autorisation (peut causer des erreurs 401 si la route est protégée)
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  /**
   * Décode un token JWT. (Implémentation simple, utiliser une librairie comme jwt-decode en prod)
   * @param token Le token JWT à décoder.
   * @returns L'objet décodé du payload du token, ou null si invalide.
   */
  private decodeJwtToken(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }


  // --- Méthodes pour récupérer les données ---

  fetchCartesEnAttente(): void {
    // Utilisation de getAuthHeaders() pour inclure le token
    this.http.get<CarteManager[]>('https://localhost:44320/api/gestionnaire/cartes-en-attente', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.cartesEnAttente = data;
          this.erreur = '';
        },
        error: (err) => {
          console.error('Erreur lors du chargement des cartes en attente', err);
          this.handleApiError(err, 'cartes en attente');
        }
      });
  }

  fetchCartesValidees(): void {
    // Utilisation de getAuthHeaders() pour inclure le token
    this.http.get<CarteManager[]>('https://localhost:44320/api/gestionnaire/cartes-validees', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.cartesValidees = data;
          this.erreur = '';
        },
        error: (err) => {
          console.error('Erreur lors du chargement des cartes validées', err);
          this.handleApiError(err, 'cartes validées');
        }
      });
  }

  fetchProblemes(): void {
    // Utilisation de getAuthHeaders() pour inclure le token
    this.http.get<Probleme[]>('https://localhost:44320/api/gestionnaire/problemes', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.problemes = data;
          this.erreur = '';
        },
        error: (err) => {
          console.error('Erreur lors du chargement des problèmes', err);
          this.handleApiError(err, 'problèmes');
        }
      });
  }

  // --- Méthodes d'action sur les cartes ---

  validerCarte(carteId: number): void {
    // Remplacez window.confirm par une modale personnalisée si vous ne voulez pas d'alertes.
    // Pour cet exemple, nous allons directement appeler l'API sans confirmation.
    // En production, une modale de confirmation est fortement recommandée.
    this.messageSuccess = ''; // Réinitialise le message de succès
    this.erreur = ''; // Réinitialise le message d'erreur

    this.http.post(`https://localhost:44320/api/gestionnaire/valider-carte/${carteId}`, {}, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          this.messageSuccess = `Carte ${carteId} validée avec succès.`;
          this.fetchCartesEnAttente(); // Rafraîchir les listes après l'action
          this.fetchCartesValidees();
        },
        error: (err) => {
          console.error(`Erreur lors de la validation de la carte ${carteId}`, err);
          this.handleApiError(err, `validation de la carte ${carteId}`);
        }
      });
  }

  remettreEnAttente(carteId: number): void {
    this.messageSuccess = '';
    this.erreur = '';

    this.http.post(`https://localhost:44320/api/gestionnaire/remettre-en-attente/${carteId}`, {}, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          this.messageSuccess = `Carte ${carteId} remise en attente avec succès.`;
          this.fetchCartesEnAttente(); // Rafraîchir les listes
          this.fetchCartesValidees();
        },
        error: (err) => {
          console.error(`Erreur lors de la remise en attente de la carte ${carteId}`, err);
          this.handleApiError(err, `remise en attente de la carte ${carteId}`);
        }
      });
  }

  supprimerCarte(carteId: number): void {
    this.messageSuccess = '';
    this.erreur = '';

    // Remplacez window.confirm par une modale personnalisée si vous ne voulez pas d'alertes.
    // Pour cet exemple, nous allons directement appeler l'API sans confirmation.
    // En production, une modale de confirmation est fortement recommandée.
    // Pour des raisons de conformité, je ne peux pas utiliser window.confirm ici.
    console.log(`Demande de suppression de la carte ${carteId}. Une modale de confirmation devrait apparaître.`);

    this.http.delete(`https://localhost:44320/api/gestionnaire/supprimer-carte/${carteId}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          this.messageSuccess = `Carte ${carteId} supprimée avec succès.`;
          this.fetchCartesEnAttente(); // Rafraîchir les listes
          this.fetchCartesValidees();
        },
        error: (err) => {
          console.error(`Erreur lors de la suppression de la carte ${carteId}`, err);
          this.handleApiError(err, `suppression de la carte ${carteId}`);
        }
      });
  }

  /**
   * Gère les erreurs d'API et met à jour le message d'erreur.
   * @param err L'objet d'erreur HTTP.
   * @param action La description de l'action qui a échoué.
   */
  private handleApiError(err: any, action: string): void {
    let errorMessage = `Impossible de charger/effectuer l'action pour les ${action}. Vérifiez le backend.`;
    if (err.status === 401) {
      errorMessage = 'Non autorisé. Votre session a peut-être expiré. Veuillez vous reconnecter.';
      this.logout(); // Déconnecter l'utilisateur en cas d'erreur 401
    } else if (err.status === 403) {
      errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    } else if (err.error && err.error.message) {
      errorMessage = err.error.message; // Utilise le message d'erreur du backend si disponible
    }
    this.erreur = errorMessage;
    this.messageSuccess = ''; // Assurez-vous que le message de succès est effacé en cas d'erreur
  }

  // --- Méthodes pour gérer l'affichage des sections (inchangées) ---

  selectSection(section: 'dashboard' | 'cartes' | 'problemes' | 'settings' | 'clients'): void {
    this.activeSection = section;
    // Cacher toutes les sous-sections quand la section principale change
    this.showPendingCardsList = false;
    this.showValidatedCardsList = false;
    this.showProblemsList = false;
    this.showClientsList = false; // Cacher la liste des clients
    this.erreur = '';
    this.messageSuccess = '';
  }

  togglePendingCards(): void {
    this.showPendingCardsList = !this.showPendingCardsList;
    // Cacher les autres listes pour n'en afficher qu'une à la fois
    this.showValidatedCardsList = false;
    this.showProblemsList = false;
    this.showClientsList = false;
    this.erreur = ''; // Réinitialiser l'erreur quand on change de vue
    this.messageSuccess = '';
  }

  toggleValidatedCards(): void {
    this.showValidatedCardsList = !this.showValidatedCardsList;
    // Cacher les autres listes
    this.showPendingCardsList = false;
    this.showProblemsList = false;
    this.showClientsList = false;
    this.erreur = '';
    this.messageSuccess = '';
  }

  toggleProblems(): void {
    this.showProblemsList = !this.showProblemsList;
    // Cacher les autres listes
    this.showPendingCardsList = false;
    this.showValidatedCardsList = false;
    this.showClientsList = false;
    this.erreur = '';
    this.messageSuccess = '';
  }

  // Si vous ajoutez une section pour gérer tous les clients
  // clients: any[] = []; // Remplacez any[] par une interface Client plus détaillée
  // fetchClients(): void {
  //   this.http.get<any[]>('https://localhost:44320/api/gestionnaire/clients', { headers: this.getAuthHeaders() })
  //     .subscribe({
  //       next: (data) => {
  //         this.clients = data;
  //         this.erreur = '';
  //       },
  //       error: (err) => {
  //         console.error('Erreur lors du chargement des clients', err);
  //         this.handleApiError(err, 'clients');
  //       }
  //     });
  // }
  // toggleClients(): void {
  //   this.showClientsList = !this.showClientsList;
  //   this.showPendingCardsList = false;
  //   this.showValidatedCardsList = false;
  //   this.showProblemsList = false;
  //   this.erreur = '';
  //   this.messageSuccess = '';
  //   if (this.showClientsList && this.clients.length === 0) {
  //     this.fetchClients();
  //   }
  // }


  logout(): void {
    console.log('Déconnexion du gestionnaire...');
    localStorage.removeItem('jwt_token'); // Supprime le token JWT du stockage local
    this.router.navigate(['/login']); // Rediriger vers la page de connexion
  }
}
