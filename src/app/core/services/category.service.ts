import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/categories`;

  getAll() {
    return this.http.get<{ data: Category[] }>(this.url);
  }

  create(data: { name: string; type: string }) {
    return this.http.post<{ data: Category }>(this.url, data);
  }

  update(id: number, data: { name: string; type: string }) {
    return this.http.put<{ data: Category }>(`${this.url}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
