import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  faDashboard, faUser, faCogs, faSignOutAlt, faSearch, faBell, faEnvelope,
  faChevronDown, faMoneyBill, faCreditCard, faExclamationCircle,
  faEye, faDownload, faTimes, faListAlt, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  cin: string;
}

interface Compte {
  id: number;
  solde: number;
  dateCreation: string;
}

interface Carte {
  id: number;
  numero: string;
  dateExpiration: string;
}

interface ClientDashboardDto {
  client: Client;
  compte: Compte;
  cartes: Carte[];
  peutFaireDemande: boolean;
}

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    FontAwesomeModule
  ]
})
export class ClientDashboardComponent implements OnInit {

  faDashboard = faDashboard;
  faUser = faUser;
  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;
  faSearch = faSearch;
  faBell = faBell;
  faEnvelope = faEnvelope;
  faChevronDown = faChevronDown;
  faMoneyBill = faMoneyBill;
  faCreditCard = faCreditCard;
  faExclamationCircle = faExclamationCircle;
  faEye = faEye;
  faDownload = faDownload;
  faTimes = faTimes;
  faListAlt = faListAlt;
  faInfoCircle = faInfoCircle;

  client: Client | null = null;
  compte: Compte | null = null;
  cartes: Carte[] = [];
  peutFaireDemande: boolean = false;
  transactions: any[] = [];

  showProbleme: boolean = false;
  problemeText: string = '';
  messageConfirmation: string = '';
  erreur: string = '';
  activeSection: 'dashboard' | 'profile' | 'settings' = 'dashboard';

  showSoldeDetails: boolean = false;
  showCartesDetails: boolean = false;
  showTransactionsList: boolean = false;
  showAideDetails: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.erreur = 'Utilisateur non connecté.';
      return;
    }

    this.http.get<ClientDashboardDto>(`https://localhost:44320/api/client/dashboard/${userId}`)
      .subscribe({
        next: (data) => {
          this.client = data.client;
          this.compte = data.compte;
          this.cartes = data.cartes;
          this.peutFaireDemande = data.peutFaireDemande;
        },
        error: (err) => {
          console.error('Erreur lors du chargement du dashboard', err);
          this.erreur = 'Impossible de charger les données du client.';
        }
      });
  }

  faireDemandeCarte(): void {
    if (!this.client?.id) {
      this.erreur = "ID client introuvable.";
      return;
    }

      this.http.post(`https://localhost:44320/api/client/demande-carte/${this.client.id}`, {}, {
    responseType: 'text' as 'json'
  })
      .subscribe({
        next: () => {
          this.messageConfirmation = 'Demande de carte envoyée avec succès.';
          this.peutFaireDemande = false;
        },
        error: (err) => {
          this.erreur = 'Échec de la demande de carte.';
          console.error(err);
        }
      });
  }

  signalerProbleme(): void {
    if (!this.problemeText.trim()) {
      this.erreur = 'Veuillez décrire le problème avant d\'envoyer.';
      this.messageConfirmation = '';
      return;
    }

    const token = localStorage.getItem('jwt_token');

    if (!token) {
      this.erreur = 'Token manquant. Veuillez vous reconnecter.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body = { description: this.problemeText.trim() };

    this.http.post('https://localhost:44320/api/client/signaler-probleme', body, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('✅ Problème signalé :', res);
          this.messageConfirmation = 'Votre problème a été signalé avec succès !';
          this.problemeText = '';
          this.erreur = '';
        },
        error: (err) => {
          console.error('❌ Erreur lors de l\'envoi du problème', err);
          if (err.status === 400) {
            this.erreur = 'Requête invalide. Vérifiez les données envoyées.';
          } else if (err.status === 401) {
            this.erreur = 'Non autorisé. Veuillez vous reconnecter.';
          } else {
            this.erreur = 'Erreur lors de l\'envoi du problème.';
          }
          this.messageConfirmation = '';
        }
      });
  }

  toggleProbleme(): void {
    this.showProbleme = !this.showProbleme;
    this.showSoldeDetails = false;
    this.showCartesDetails = false;
    this.showTransactionsList = false;
    this.showAideDetails = false;

    if (!this.showProbleme) {
      this.problemeText = '';
      this.messageConfirmation = '';
      this.erreur = '';
    }
  }

  toggleSoldeDetails(): void {
    this.showSoldeDetails = !this.showSoldeDetails;
    this.hideAllOtherSections('solde');
  }

  toggleCartesDetails(): void {
    this.showCartesDetails = !this.showCartesDetails;
    this.hideAllOtherSections('cartes');
  }

  toggleTransactionsList(): void {
    this.showTransactionsList = !this.showTransactionsList;
    this.hideAllOtherSections('transactions');
  }

  toggleAideDetails(): void {
    this.showAideDetails = !this.showAideDetails;
    this.hideAllOtherSections('aide');
  }

  private hideAllOtherSections(current: string): void {
    if (current !== 'solde') this.showSoldeDetails = false;
    if (current !== 'cartes') this.showCartesDetails = false;
    if (current !== 'transactions') this.showTransactionsList = false;
    if (current !== 'aide') this.showAideDetails = false;
  }

  selectSection(section: 'dashboard' | 'profile' | 'settings'): void {
    this.activeSection = section;
    this.showProbleme = false;
    this.showSoldeDetails = false;
    this.showCartesDetails = false;
    this.showTransactionsList = false;
    this.showAideDetails = false;
    this.erreur = '';
    this.messageConfirmation = '';
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
