import { Injectable, inject, signal, computed } from '@angular/core';
import { GoalsService } from './goals.service';
import { AccountsStore } from '../accounts/accounts.store';
import { NotificationService } from '../../core/services/notification.service';
import { Goal, GoalRequest, AllocationRequest } from '../../data/goal.model';
import { Account } from '../../data/account.model';

export interface AccountGoalGroup {
  account: Account;
  goals: Goal[];
  totalAllocated: number;
  unallocated: number;
  allocationPercent: number;
}

@Injectable({ providedIn: 'root' })
export class GoalsStore {
  private service = inject(GoalsService);
  private accountsStore = inject(AccountsStore);
  private notification = inject(NotificationService);

  readonly goals = signal<Goal[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Objectifs regroupés par compte épargne, triés par priorité. */
  readonly goalsByAccount = computed<AccountGoalGroup[]>(() => {
    const savingsAccounts = this.accountsStore.accounts().filter(a => a.type === 'SAVINGS');
    const allGoals = this.goals();

    return savingsAccounts.map(account => {
      const accountGoals = allGoals
        .filter(g => g.linkedAccountId === account.id)
        .sort((a, b) => (a.priority ?? 9999) - (b.priority ?? 9999));
      const totalAllocated = accountGoals.reduce((sum, g) => sum + (g.allocatedAmount ?? 0), 0);
      const balance = account.currentBalance;
      return {
        account,
        goals: accountGoals,
        totalAllocated,
        unallocated: balance - totalAllocated,
        allocationPercent: balance > 0 ? Math.min(100, Math.round((totalAllocated / balance) * 100)) : 0
      };
    });
  });

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { this.goals.set(data); this.loading.set(false); },
      error: () => { this.error.set('common.error_load'); this.loading.set(false); }
    });
  }

  create(request: GoalRequest): void {
    this.service.create(request).subscribe({
      next: created => {
        this.goals.update(list => [...list, created]);
        this.notification.success('common.success_save');
      },
      error: () => this.notification.error('common.error_save')
    });
  }

  update(id: number, request: GoalRequest): void {
    this.service.update(id, request).subscribe({
      next: updated => {
        this.goals.update(list => list.map(g => g.id === id ? updated : g));
        this.notification.success('common.success_save');
      },
      error: () => this.notification.error('common.error_save')
    });
  }

  allocate(id: number, request: AllocationRequest): void {
    this.service.allocate(id, request).subscribe({
      next: updated => {
        this.goals.update(list => list.map(g => g.id === id ? updated : g));
        this.notification.success('common.success_save');
        this.accountsStore.load();
      },
      error: () => this.notification.error('common.error_save')
    });
  }

  movePriority(id: number, direction: 'up' | 'down'): void {
    this.service.movePriority(id, direction).subscribe({
      next: () => this.load(),
      error: () => this.notification.error('common.error_save')
    });
  }

  delete(id: number): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.goals.update(list => list.filter(g => g.id !== id));
        this.notification.success('common.success_delete');
        this.accountsStore.load();
      },
      error: () => this.notification.error('common.error_delete')
    });
  }
}
