import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Goal, GoalRequest, AllocationRequest } from '../../shared/models/goal.model';

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

  allocate(id: number, request: AllocationRequest): Observable<Goal> {
    return this.http.patch<Goal>(`${this.base}/${id}/allocation`, request);
  }

  movePriority(id: number, direction: 'up' | 'down'): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/priority?direction=${direction}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
