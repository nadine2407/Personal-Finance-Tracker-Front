import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  totalTransactions: number;
  totalGoals: number;
  totalBudgets: number;
  recentTransactions: RecentTransaction[];
}

export interface RecentTransaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getSummary() {
    return this.http.get<{ data: DashboardData }>(`${environment.apiUrl}/dashboard`);
  }
}
