import { Injectable, inject, signal } from '@angular/core';
import { GoalsService } from './goals.service';
import { NotificationService } from '../../core/services/notification.service';
import { Goal, GoalRequest, DepositRequest } from '../../shared/models/goal.model';

@Injectable({ providedIn: 'root' })
export class GoalsStore {
  private service = inject(GoalsService);
  private notification = inject(NotificationService);

  readonly goals = signal<Goal[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

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
        this.goals.update(list => [created, ...list]);
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

  deposit(id: number, request: DepositRequest): void {
    this.service.deposit(id, request).subscribe({
      next: updated => {
        this.goals.update(list => list.map(g => g.id === id ? updated : g));
        this.notification.success('common.success_save');
      },
      error: () => this.notification.error('common.error_save')
    });
  }

  delete(id: number): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.goals.update(list => list.filter(g => g.id !== id));
        this.notification.success('common.success_delete');
      },
      error: () => this.notification.error('common.error_delete')
    });
  }
}