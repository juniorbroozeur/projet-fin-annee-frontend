import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  erreur: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  login(): void {
    const data = {
      email: this.email,
      motDePasse: this.password // Ceci doit correspondre au nom de champ attendu par votre API backend
    };

    this.http.post<any>('https://localhost:44320/api/auth/login', data)
      .subscribe({
        next: (response) => {
          console.log('✅ Réponse reçue du backend pour la connexion :', response);

          // IMPORTANT : Utilise la même clé que celle attendue par le dashboard
          if (response && response.token) {
            localStorage.setItem('jwt_token', response.token); // <-- Token JWT
            localStorage.setItem('userId', response.user.id.toString()); // ✅ Ajout pour dashboard dynamique
          } else {
            console.error('La réponse du backend ne contient pas de token JWT.', response);
            this.erreur = 'Connexion réussie, mais aucun token JWT reçu. Contactez l\'administrateur.';
            return;
          }

          // Vérifie que 'response.user' et 'response.user.role' existent
          if (response.user && response.user.role) {
            const role = response.user.role;

            if (role === 'client') {
              this.router.navigate(['/client-dashboard']);
            } else if (role === 'gestionnaire') {
              this.router.navigate(['/gestionnaire-dashboard']);
            } else if (role === 'admin') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.erreur = "Rôle inconnu. Contactez l'administration.";
            }
          } else {
            console.error('La réponse du backend ne contient pas les informations de rôle de l\'utilisateur.', response);
            this.erreur = "Informations de rôle manquantes. Contactez l'administration.";
          }
        },
        error: (err) => {
          console.error('❌ Erreur de connexion HTTP :', err);
          if (err.status === 401) {
            this.erreur = "Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.";
          } else if (err.error && err.error.message) {
            this.erreur = `Erreur de connexion : ${err.error.message}`;
          } else {
            this.erreur = "Une erreur est survenue lors de la connexion. Veuillez réessayer.";
          }
        }
      });
  }
}
