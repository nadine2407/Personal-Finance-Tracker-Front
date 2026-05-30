import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
}

export interface GoalRequest {
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/goals`;

  getAll() {
    return this.http.get<{ data: Goal[] }>(this.url);
  }

  create(data: GoalRequest) {
    return this.http.post<{ data: Goal }>(this.url, data);
  }

  update(id: number, data: GoalRequest) {
    return this.http.put<{ data: Goal }>(`${this.url}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
