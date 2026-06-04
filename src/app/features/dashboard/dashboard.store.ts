import { Injectable, inject, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { TransactionsService } from '../transactions/transactions.service';
import { NotificationService } from '../../core/services/notification.service';
import { DashboardSummary, MonthlyChart } from '../../data/dashboard.model';
import { Transaction } from '../../data/transaction.model';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private service = inject(DashboardService);
  private transactionsService = inject(TransactionsService);
  private notification = inject(NotificationService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly monthlyChart = signal<MonthlyChart | null>(null);
  readonly recentTransactions = signal<Transaction[]>([]);
  readonly loading = signal(false);
  readonly year = signal(new Date().getFullYear());
  readonly month = signal(new Date().getMonth() + 1);

  readonly monthStart = computed(() => {
    const y = this.year();
    const m = String(this.month()).padStart(2, '0');
    return `${y}-${m}-01`;
  });

  readonly monthEnd = computed(() => {
    const y = this.year();
    const mo = this.month();
    const lastDay = String(new Date(y, mo, 0).getDate()).padStart(2, '0');
    const m = String(mo).padStart(2, '0');
    return `${y}-${m}-${lastDay}`;
  });

  load(): void {
    this.loading.set(true);
    forkJoin({
      summary: this.service.getSummary(this.year(), this.month()),
      chart: this.service.getMonthlyChart(this.year()),
      recent: this.transactionsService.getAll({
        page: 0,
        size: 5,
        startDate: this.monthStart(),
        endDate: this.monthEnd()
      })
    }).subscribe({
      next: ({ summary, chart, recent }) => {
        this.summary.set(summary);
        this.monthlyChart.set(chart);
        this.recentTransactions.set(recent.content);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('common.error_load');
        this.loading.set(false);
      }
    });
  }

  setPeriod(year: number, month: number): void {
    this.year.set(year);
    this.month.set(month);
    this.load();
  }
}
