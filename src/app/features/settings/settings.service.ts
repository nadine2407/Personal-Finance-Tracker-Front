import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../shared/models/auth.model';

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/user`;

  updateProfile(request: UpdateProfileRequest): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.base}/profile`, request);
  }

  updatePassword(request: UpdatePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/password`, request);
  }
}
