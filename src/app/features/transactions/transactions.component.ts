import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { TransactionsStore } from './transactions.store';
import { CategoriesStore } from '../categories/categories.store';
import { AccountsStore } from '../accounts/accounts.store';
import { Transaction, RecurrenceFrequency } from '../../shared/models/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    TranslateModule,
    PageHeaderComponent,
    EmptyStateComponent,
    CurrencyFormatPipe
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  store = inject(TransactionsStore);
  categoriesStore = inject(CategoriesStore);
  accountsStore = inject(AccountsStore);
  private fb = inject(FormBuilder);

  showFormModal = signal(false);
  editingTx = signal<Transaction | null>(null);
  showConfirmModal = signal(false);
  deletingTx = signal<Transaction | null>(null);
  showFilters = signal(false);

  filterForm = this.fb.group({
    search: [''],
    type: [''],
    categoryId: [''],
    startDate: [''],
    endDate: [''],
    minAmount: [null as number | null],
    maxAmount: [null as number | null],
    recurring: [false],
    split: [false]
  });

  form = this.fb.group({
    type: ['INCOME', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    transactionDate: ['', Validators.required],
    categoryId: [null as number | null, Validators.required],
    accountId: [null as number | null],
    description: [''],
    notes: [''],
    recurring: [false],
    split: [false],
    recurrenceFrequency: [null as RecurrenceFrequency | null]
  });

  readonly frequencies: RecurrenceFrequency[] = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

  get isRecurring() { return this.form.get('recurring')?.value; }

  ngOnInit(): void {
    this.store.load();
    if (this.categoriesStore.categories().length === 0) {
      this.categoriesStore.load();
    }
    if (this.accountsStore.accounts().length === 0) {
      this.accountsStore.load();
    }
  }

  applyFilter(): void {
    const { search, type, categoryId, startDate, endDate, minAmount, maxAmount, recurring, split } = this.filterForm.value;
    this.store.applyFilter({
      search: search || undefined,
      type: (type as any) || undefined,
      categoryId: categoryId ? +categoryId : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      minAmount: minAmount ?? undefined,
      maxAmount: maxAmount ?? undefined,
      recurring: recurring || undefined,
      split: split || undefined
    });
  }

  resetFilter(): void {
    this.filterForm.reset({ recurring: false, split: false });
    this.store.applyFilter({});
  }

  onPageChange(page: number): void {
    this.store.setPage(page);
  }

  getPages(): number[] {
    const total = this.store.page().totalPages;
    return Array.from({ length: total }, (_, i) => i);
  }

  openForm(tx?: Transaction): void {
    this.editingTx.set(tx ?? null);
    if (tx) {
      this.form.patchValue({
        type: tx.type,
        amount: tx.amount,
        transactionDate: tx.transactionDate,
        categoryId: tx.category.id,
        accountId: tx.accountId ?? null,
        description: tx.description ?? '',
        notes: tx.notes ?? '',
        recurring: tx.recurring ?? false,
        split: tx.split ?? false,
        recurrenceFrequency: tx.recurrenceFrequency ?? null
      });
    } else {
      this.form.reset({
        type: 'INCOME',
        amount: null,
        transactionDate: new Date().toISOString().split('T')[0],
        categoryId: null,
        accountId: null,
        description: '',
        notes: '',
        recurring: false,
        split: false,
        recurrenceFrequency: null
      });
    }
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingTx.set(null);
  }

  submitForm(): void {
    if (this.form.invalid) return;
    const { type, amount, transactionDate, categoryId, accountId, description, notes, recurring, split, recurrenceFrequency } = this.form.getRawValue();
    const request = {
      type: type!,
      amount: amount!,
      transactionDate: transactionDate!,
      categoryId: categoryId!,
      accountId: accountId ?? null,
      description: description || null,
      notes: notes || null,
      recurring: recurring ?? false,
      split: split ?? false,
      recurrenceFrequency: recurring ? recurrenceFrequency : null
    };
    const tx = this.editingTx();
    if (tx) {
      this.store.update(tx.id, request as any);
    } else {
      this.store.create(request as any);
    }
    this.closeModal();
  }

  confirmDelete(tx: Transaction): void {
    this.deletingTx.set(tx);
    this.showConfirmModal.set(true);
  }

  deleteConfirmed(): void {
    const tx = this.deletingTx();
    if (tx) this.store.delete(tx.id);
    this.showConfirmModal.set(false);
    this.deletingTx.set(null);
  }
}
