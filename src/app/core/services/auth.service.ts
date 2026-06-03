import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, UserInfo } from '../../data/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<UserInfo | null>(this.loadUserFromStorage());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly userInitials = computed(() => {
    const u = this._currentUser();
    if (!u) return '?';
    return (u.firstName[0] + u.lastName[0]).toUpperCase();
  });
  readonly fullName = computed(() => {
    const u = this._currentUser();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.base}/sessions`, request).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.base}/users`, request).pipe(
      tap(res => this.saveSession(res))
    );
  }

  updateCurrentUser(user: UserInfo): void {
    localStorage.setItem('user', JSON.stringify(user));
    this._currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this._currentUser.set(res.user);
  }

  private loadUserFromStorage(): UserInfo | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
