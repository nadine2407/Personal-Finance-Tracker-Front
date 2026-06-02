import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Goal, GoalRequest, DepositRequest } from '../../shared/models/goal.model';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/goals`;

  getAll(): Observable<Goal[]> {
    return this.http.get<Goal[]>(this.base);
  }

  create(request: GoalRequest): Observable<Goal> {
    return this.http.post<Goal>(this.base, request);
  }

  update(id: number, request: GoalRequest): Observable<Goal> {
    return this.http.put<Goal>(`${this.base}/${id}`, request);
  }

  deposit(id: number, request: DepositRequest): Observable<Goal> {
    return this.http.patch<Goal>(`${this.base}/${id}/deposits`, request);
  }

  withdraw(id: number, request: DepositRequest): Observable<Goal> {
    return this.http.patch<Goal>(`${this.base}/${id}/withdrawals`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}