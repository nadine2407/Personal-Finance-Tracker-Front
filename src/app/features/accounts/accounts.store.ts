import { Injectable, inject, signal, computed } from '@angular/core';
import { AccountsService } from './accounts.service';
import { NotificationService } from '../../core/services/notification.service';
import { Account, AccountRequest } from '../../data/account.model';

@Injectable({ providedIn: 'root' })
export class AccountsStore {
  private service = inject(AccountsService);
  private notification = inject(NotificationService);

  readonly accounts = signal<Account[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalNetWorth = computed(() =>
    this.accounts().reduce((sum, a) => sum + a.currentBalance, 0)
  );

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { this.accounts.set(data); this.loading.set(false); },
      error: () => { this.error.set('common.error_load'); this.loading.set(false); }
    });
  }

  create(request: AccountRequest): void {
    this.service.create(request).subscribe({
      next: created => {
        this.accounts.update(list => [...list, created]);
        this.notification.success('common.success_save');
      },
      error: () => this.notification.error('common.error_save')
    });
  }

  update(id: number, request: AccountRequest): void {
    this.service.update(id, request).subscribe({
      next: updated => {
        this.accounts.update(list => list.map(a => a.id === id ? updated : a));
        this.notification.success('common.success_save');
      },
      error: () => this.notification.error('common.error_save')
    });
  }

  delete(id: number): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.accounts.update(list => list.filter(a => a.id !== id));
        this.notification.success('common.success_delete');
      },
      error: () => this.notification.error('common.error_delete')
    });
  }
}
