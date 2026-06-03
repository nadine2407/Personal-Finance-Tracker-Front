import { Injectable, inject, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TransactionsService } from './transactions.service';
import { NotificationService } from '../../core/services/notification.service';
import { Transaction, TransactionRequest, TransactionFilter, PageResponse } from '../../shared/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionsStore {
  private service = inject(TransactionsService);
  private notification = inject(NotificationService);

  readonly page = signal<PageResponse<Transaction>>({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  readonly filter = signal<TransactionFilter>({ page: 0, size: 10 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly transactions = computed(() => this.page().content);

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll(this.filter()).subscribe({
      next: data => { this.page.set(data); this.loading.set(false); },
      error: () => { this.error.set('common.error_load'); this.loading.set(false); }
    });
  }

  applyFilter(partial: Partial<TransactionFilter>): void {
    this.filter.update(f => ({ ...f, ...partial, page: 0 }));
    this.load();
  }

  setPage(page: number): void {
    this.filter.update(f => ({ ...f, page }));
    this.load();
  }

  create(request: TransactionRequest): void {
    this.service.create(request).subscribe({
      next: () => { this.notification.success('common.success_save'); this.load(); },
      error: () => this.notification.error('common.error_save')
    });
  }

  createTransit(transfer: TransactionRequest, expense: TransactionRequest): void {
    forkJoin([this.service.create(transfer), this.service.create(expense)]).subscribe({
      next: () => { this.notification.success('common.success_save'); this.load(); },
      error: () => this.notification.error('common.error_save')
    });
  }

  update(id: number, request: TransactionRequest): void {
    this.service.update(id, request).subscribe({
      next: () => { this.notification.success('common.success_save'); this.load(); },
      error: () => this.notification.error('common.error_save')
    });
  }

  updateNote(id: number, notes: string | null): void {
    this.service.updateNote(id, notes).subscribe({
      next: () => { this.notification.success('transactions.note_saved'); this.load(); },
      error: () => this.notification.error('common.error_save')
    });
  }

  toggleHidden(id: number): void {
    this.service.toggleHidden(id).subscribe({
      next: updated => {
        this.page.update(p => ({ ...p, content: p.content.map(t => t.id === id ? updated : t) }));
        this.notification.success(updated.hidden ? 'transactions.hidden_success' : 'transactions.shown_success');
      },
      error: () => this.notification.error('common.error_save')
    });
  }

  delete(id: number): void {
    this.service.delete(id).subscribe({
      next: () => { this.notification.success('common.success_delete'); this.load(); },
      error: () => this.notification.error('common.error_delete')
    });
  }
}