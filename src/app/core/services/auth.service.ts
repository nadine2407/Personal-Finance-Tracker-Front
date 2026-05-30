import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  success: boolean;
  data: { token: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private http = inject(HttpClient);
  private router = inject(Router);

  isAuthenticated = signal<boolean>(this.hasToken());

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.saveToken(res.data.token))
    );
  }

  register(firstName: string, lastName: string, email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { firstName, lastName, email, password }).pipe(
      tap(res => this.saveToken(res.data.token))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isAuthenticated.set(true);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
