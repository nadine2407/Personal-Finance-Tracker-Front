import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Account {
  id: number;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CASH' | 'CREDIT_CARD';
  balance: number;
}

export interface AccountRequest {
  name: string;
  type: string;
  balance: number;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/accounts`;

  getAll() {
    return this.http.get<{ data: Account[] }>(this.url);
  }

  create(data: AccountRequest) {
    return this.http.post<{ data: Account }>(this.url, data);
  }

  update(id: number, data: AccountRequest) {
    return this.http.put<{ data: Account }>(`${this.url}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
