import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
}

export interface TransactionRequest {
  amount: number;
  description: string;
  date: string;
  categoryId: number;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/transactions`;

  getAll() {
    return this.http.get<{ data: Transaction[] }>(this.url);
  }

  filter(type?: string, from?: string, to?: string) {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<{ data: Transaction[] }>(`${this.url}/filter`, { params });
  }

  create(data: TransactionRequest) {
    return this.http.post<{ data: Transaction }>(this.url, data);
  }

  update(id: number, data: TransactionRequest) {
    return this.http.put<{ data: Transaction }>(`${this.url}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
