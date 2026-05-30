import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSummary, MonthlyChart } from '../../shared/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/dashboard`;

  getSummary(year: number, month: number): Observable<DashboardSummary> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<DashboardSummary>(`${this.base}/summary`, { params });
  }

  getMonthlyChart(year: number): Observable<MonthlyChart> {
    const params = new HttpParams().set('year', year);
    return this.http.get<MonthlyChart>(`${this.base}/monthly-chart`, { params });
  }
}