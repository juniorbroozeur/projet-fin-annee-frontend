import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:44320/api/auth/login'; // ✅ URL backend ASP.NET Core

  constructor(private http: HttpClient) {}

  /**
   * Effectue une requête POST vers /api/auth/login
   * @param email Email de l'utilisateur
   * @param motDePasse Mot de passe
   * @returns Un Observable contenant { token, id, role }
   */
  login(email: string, motDePasse: string): Observable<any> {
    return this.http.post(this.apiUrl, { email, motDePasse });
  }
}
