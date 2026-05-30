import { Injectable, inject, signal, computed } from '@angular/core';
import { BudgetsService } from './budgets.service';
import { NotificationService } from '../../core/services/notification.service';
import { Budget, BudgetRequest, BudgetPageSummary } from '../../shared/models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetsStore {
  private service = inject(BudgetsService);
  private notification = inject(NotificationService);

  readonly summary = signal<BudgetPageSummary | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly currentMonth = signal(new Date().getMonth() + 1);
  readonly currentYear = signal(new Date().getFullYear());

  readonly items = computed(() => this.summary()?.items ?? []);
  readonly totalBudget = computed(() => this.summary()?.totalBudget ?? 0);
  readonly totalSpent = computed(() => this.summary()?.totalSpent ?? 0);
  readonly remaining = computed(() => this.summary()?.remaining ?? 0);
  readonly overspend = computed(() => this.summary()?.overspend ?? 0);
  readonly warnCount = computed(() => this.summary()?.warnCount ?? 0);
  readonly overCount = computed(() => this.summary()?.overCount ?? 0);

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getStatus(this.currentMonth(), this.currentYear()).subscribe({
      next: data => { this.summary.set(data); this.loading.set(false); },
      error: () => { this.error.set('common.error_load'); this.loading.set(false); }
    });
  }

  setMonth(month: number): void {
    this.currentMonth.set(month);
    this.load();
  }

  setYear(year: number): void {
    this.currentYear.set(year);
    this.load();
  }

  create(request: BudgetRequest): void {
    this.service.create(request).subscribe({
      next: () => { this.notification.success('common.success_save'); this.load(); },
      error: () => this.notification.error('common.error_save')
    });
  }

  update(id: number, request: BudgetRequest): void {
    this.service.update(id, request).subscribe({
      next: () => { this.notification.success('common.success_save'); this.load(); },
      error: () => this.notification.error('common.error_save')
    });
  }

  delete(id: number): void {
    this.service.delete(id).subscribe({
      next: () => { this.notification.success('common.success_delete'); this.load(); },
      error: () => this.notification.error('common.error_delete')
    });
  }

  duplicate(fromMonth: number, fromYear: number): void {
    this.service.duplicate(fromMonth, fromYear, this.currentMonth(), this.currentYear()).subscribe({
      next: () => { this.notification.success('budgets.duplicate_success'); this.load(); },
      error: () => this.notification.error('common.error_save')
    });
  }
}
