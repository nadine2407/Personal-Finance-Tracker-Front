import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Budget, BudgetRequest, BudgetPageSummary } from '../../shared/models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/budgets`;

  getStatus(month: number, year: number): Observable<BudgetPageSummary> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<BudgetPageSummary>(`${this.base}/status`, { params });
  }

  create(request: BudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(this.base, request);
  }

  update(id: number, request: BudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(`${this.base}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  duplicate(fromMonth: number, fromYear: number, toMonth: number, toYear: number): Observable<Budget[]> {
    const params = new HttpParams()
      .set('fromMonth', fromMonth)
      .set('fromYear', fromYear)
      .set('toMonth', toMonth)
      .set('toYear', toYear);
    return this.http.post<Budget[]>(`${this.base}/copies`, null, { params });
  }
}
