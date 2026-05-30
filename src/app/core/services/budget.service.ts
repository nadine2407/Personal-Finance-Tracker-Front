import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Budget {
  id: number;
  name: string;
  limitAmount: number;
  month: number;
  year: number;
  categoryId: number | null;
  categoryName: string | null;
}

export interface BudgetRequest {
  name: string;
  limitAmount: number;
  month: number;
  year: number;
  categoryId: number | null;
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/budgets`;

  getAll() {
    return this.http.get<{ data: Budget[] }>(this.url);
  }

  create(data: BudgetRequest) {
    return this.http.post<{ data: Budget }>(this.url, data);
  }

  update(id: number, data: BudgetRequest) {
    return this.http.put<{ data: Budget }>(`${this.url}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
