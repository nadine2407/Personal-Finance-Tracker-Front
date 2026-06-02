import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transaction, TransactionRequest, TransactionFilter, PageResponse } from '../../shared/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/transactions`;

  getAll(filter: TransactionFilter): Observable<PageResponse<Transaction>> {
    let params = new HttpParams()
      .set('page', filter.page ?? 0)
      .set('size', filter.size ?? 10)
      .set('sort', filter.sort ?? 'transactionDate,desc');

    if (filter.type) params = params.set('type', filter.type);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.minAmount != null) params = params.set('minAmount', filter.minAmount);
    if (filter.maxAmount != null) params = params.set('maxAmount', filter.maxAmount);
    if (filter.search) params = params.set('search', filter.search);
    if (filter.recurring != null) params = params.set('recurring', filter.recurring);

    return this.http.get<PageResponse<Transaction>>(this.base, { params });
  }

  create(request: TransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.base, request);
  }

  update(id: number, request: TransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.base}/${id}`, request);
  }

  updateNote(id: number, notes: string | null): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.base}/${id}/note`, { notes });
  }

  toggleHidden(id: number): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.base}/${id}/hidden`, null);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}