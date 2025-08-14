import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  cin: string;
}

export interface Compte {
  id: number;
  solde: number;
  dateCreation: string;
}

export interface Carte {
  id: number;
  numero: string;
  dateExpiration: string;
  statut: string;
}

export interface ClientDashboardDto {
  client: Client;
  compte: Compte;
  cartes: Carte[];
  peutFaireDemande: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'https://localhost:44320/api/client';

  constructor(private http: HttpClient) {}

  // Récupérer les infos du dashboard client
  getDashboard(userId: number): Observable<ClientDashboardDto> {
    return this.http.get<ClientDashboardDto>(`${this.apiUrl}/dashboard/${userId}`);
  }

  // Demander une carte
  demanderCarte(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/demande-carte/${userId}`, {});
  }

  // Signaler un problème
  signalerProbleme(description: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signaler-probleme`, description, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Obtenir les transactions (fictives)
  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions`);
  }
}
