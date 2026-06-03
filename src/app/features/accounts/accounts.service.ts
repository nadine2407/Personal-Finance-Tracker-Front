import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account, AccountRequest } from '../../data/account.model';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/accounts`;

  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(this.base);
  }

  create(request: AccountRequest): Observable<Account> {
    return this.http.post<Account>(this.base, request);
  }

  update(id: number, request: AccountRequest): Observable<Account> {
    return this.http.put<Account>(`${this.base}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
