import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { TransactionsStore } from './transactions.store';
import { CategoriesStore } from '../categories/categories.store';
import { AccountsStore } from '../accounts/accounts.store';
import { Transaction, RecurrenceFrequency } from '../../data/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    DatePipe,
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
  showRecurringDeleteModal = signal(false);
  showFilters = signal(false);
  showNoteModal = signal(false);
  notingTx = signal<Transaction | null>(null);
  noteText = signal<string>('');

  filterForm = this.fb.group({
    search: [''],
    type: [''],
    categoryId: [''],
    fromAccountId: [null as number | null],
    toAccountId: [null as number | null],
    startDate: [null as string | null],
    endDate: [null as string | null],
    minAmount: [null as number | null],
    maxAmount: [null as number | null],
    recurring: [false]
  });

  form = this.fb.group({
    type: ['INCOME', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    transactionDate: ['', Validators.required],
    categoryId: [null as number | null, Validators.required],
    accountId: [null as number | null],
    destinationAccountId: [null as number | null],
    transitAccountId: [null as number | null],
    description: [''],
    notes: [''],
    recurring: [false],
    recurrenceFrequency: [null as RecurrenceFrequency | null],
    recurrenceEndDate: [null as string | null]
  });

  readonly frequencies: RecurrenceFrequency[] = ['MONTHLY'];

  get isRecurring() { return this.form.get('recurring')?.value; }
  get isTransfer() { return this.form.get('type')?.value === 'TRANSFER'; }

  get maxRecurrenceEndDate(): string {
    const date = this.form.get('transactionDate')?.value;
    if (!date) return '';
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  }

  get defaultRecurrenceEndDate(): string {
    return this.maxRecurrenceEndDate;
  }

  get showTransitAccount(): boolean {
    if (this.form.get('type')?.value !== 'EXPENSE') return false;
    const accountId = this.form.get('accountId')?.value;
    if (!accountId) return false;
    const account = this.accountsStore.accounts().find(a => a.id === +accountId);
    return account?.type === 'SAVINGS';
  }

  get checkingAccounts() {
    return this.accountsStore.accounts().filter(a => a.type === 'CHECKING');
  }

  get destinationAccounts() {
    const sourceId = this.form.get('accountId')?.value;
    return this.accountsStore.accounts().filter(a => !sourceId || a.id !== +sourceId);
  }

  get sameAccountError(): boolean {
    if (!this.isTransfer) return false;
    const src = this.form.get('accountId')?.value;
    const dst = this.form.get('destinationAccountId')?.value;
    return !!src && !!dst && +src === +dst;
  }

  get insufficientFunds(): boolean {
    const type = this.form.get('type')?.value;
    if (type !== 'EXPENSE' && type !== 'TRANSFER') return false;
    const accountId = this.form.get('accountId')?.value;
    if (!accountId) return false;
    const amount = this.form.get('amount')?.value;
    if (!amount || amount <= 0) return false;
    const account = this.accountsStore.accounts().find(a => a.id === +accountId);
    if (!account) return false;
    return amount > account.currentBalance;
  }

  get sourceAccountBalance(): number | null {
    const accountId = this.form.get('accountId')?.value;
    if (!accountId) return null;
    return this.accountsStore.accounts().find(a => a.id === +accountId)?.currentBalance ?? null;
  }

  ngOnInit(): void {
    this.applyFilter();
    if (this.categoriesStore.categories().length === 0) {
      this.categoriesStore.load();
    }
    if (this.accountsStore.accounts().length === 0) {
      this.accountsStore.load();
    }
    this.form.get('type')!.valueChanges.subscribe(() => this.updateDynamicValidators());
    this.form.get('accountId')!.valueChanges.subscribe(() => this.updateDynamicValidators());
    this.form.get('recurring')!.valueChanges.subscribe(() => this.updateDynamicValidators());
    this.form.get('transactionDate')!.valueChanges.subscribe(date => {
      if (this.form.get('recurring')?.value && date) {
        const d = new Date(date);
        d.setFullYear(d.getFullYear() + 1);
        this.form.get('recurrenceEndDate')?.setValue(d.toISOString().split('T')[0], { emitEvent: false });
      }
    });
  }

  private updateDynamicValidators(): void {
    const categoryCtrl = this.form.get('categoryId')!;
    const transitCtrl = this.form.get('transitAccountId')!;
    const freqCtrl = this.form.get('recurrenceFrequency')!;
    const endDateCtrl = this.form.get('recurrenceEndDate')!;
    const type = this.form.get('type')!.value;
    const recurring = this.form.get('recurring')!.value;

    if (type === 'TRANSFER') {
      categoryCtrl.clearValidators();
      categoryCtrl.setValue(null);
    } else {
      categoryCtrl.setValidators(Validators.required);
    }
    categoryCtrl.updateValueAndValidity({ emitEvent: false });

    if (this.showTransitAccount) {
      transitCtrl.setValidators(Validators.required);
    } else {
      transitCtrl.clearValidators();
      transitCtrl.setValue(null);
    }
    transitCtrl.updateValueAndValidity({ emitEvent: false });

    if (recurring) {
      freqCtrl.setValidators(Validators.required);
      endDateCtrl.setValidators(Validators.required);
      if (!endDateCtrl.value) {
        endDateCtrl.setValue(this.defaultRecurrenceEndDate, { emitEvent: false });
      }
    } else {
      freqCtrl.clearValidators();
      freqCtrl.setValue(null);
      endDateCtrl.clearValidators();
      endDateCtrl.setValue(null);
    }
    freqCtrl.updateValueAndValidity({ emitEvent: false });
    endDateCtrl.updateValueAndValidity({ emitEvent: false });
  }

  getAccountName(id: number | null): string {
    if (!id) return '—';
    const acc = this.accountsStore.accounts().find(a => a.id === id);
    return acc ? `${acc.icon ?? '🏦'} ${acc.name}` : '—';
  }

  get filterType() { return this.filterForm.get('type')?.value; }

  applyFilter(): void {
    const { search, type, categoryId, fromAccountId, toAccountId, startDate, endDate, minAmount, maxAmount, recurring } = this.filterForm.value;
    const isTransfer = type === 'TRANSFER';
    this.store.applyFilter({
      search: search || undefined,
      type: (type as any) || undefined,
      categoryId: !isTransfer && categoryId ? +categoryId : undefined,
      accountId: isTransfer && fromAccountId ? +fromAccountId : undefined,
      destinationAccountId: isTransfer && toAccountId ? +toAccountId : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      minAmount: minAmount ?? undefined,
      maxAmount: maxAmount ?? undefined,
      recurring: recurring || undefined
    });
  }

  resetFilter(): void {
    this.filterForm.reset({ startDate: null, endDate: null, recurring: false });
    this.applyFilter();
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
        categoryId: tx.category?.id ?? null,
        accountId: tx.accountId ?? null,
        destinationAccountId: tx.destinationAccountId ?? null,
        transitAccountId: null,
        description: tx.description ?? '',
        notes: tx.notes ?? '',
        recurring: tx.recurring ?? false,
        recurrenceFrequency: tx.recurrenceFrequency ?? null
      });
      this.form.get('accountId')?.disable();
      this.form.get('destinationAccountId')?.disable();
    } else {
      this.form.reset({
        type: 'INCOME',
        amount: null,
        transactionDate: new Date().toISOString().split('T')[0],
        categoryId: null,
        accountId: null,
        destinationAccountId: null,
        transitAccountId: null,
        description: '',
        notes: '',
        recurring: false,
        recurrenceFrequency: null,
        recurrenceEndDate: null
      });
      this.form.get('accountId')?.enable();
      this.form.get('destinationAccountId')?.enable();
    }
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingTx.set(null);
    this.form.get('accountId')?.enable();
    this.form.get('destinationAccountId')?.enable();
  }

  submitForm(): void {
    if (this.form.invalid || this.insufficientFunds || this.sameAccountError) return;
    const { type, amount, transactionDate, categoryId, accountId, destinationAccountId, transitAccountId, description, notes, recurring, recurrenceFrequency, recurrenceEndDate } = this.form.getRawValue();

    const tx = this.editingTx();

    if (type === 'EXPENSE' && this.showTransitAccount && transitAccountId && !tx) {
      this.store.createTransit(
        {
          type: 'TRANSFER',
          amount: amount!,
          transactionDate: transactionDate!,
          categoryId: null,
          accountId: accountId ?? null,
          destinationAccountId: transitAccountId,
          description: description ? `Transit – ${description}` : 'Transit',
          notes: null,
          recurring: false,
          recurrenceFrequency: null,
          recurrenceEndDate: null
        },
        {
          type: 'EXPENSE',
          amount: amount!,
          transactionDate: transactionDate!,
          categoryId: categoryId ?? null,
          accountId: transitAccountId,
          destinationAccountId: null,
          description: description || null,
          notes: notes || null,
          recurring: recurring ?? false,
          recurrenceFrequency: recurring ? recurrenceFrequency : null,
          recurrenceEndDate: recurring ? (recurrenceEndDate || null) : null
        }
      );
    } else {
      const request = {
        type: type! as any,
        amount: amount!,
        transactionDate: transactionDate!,
        categoryId: type === 'TRANSFER' ? null : (categoryId ?? null),
        accountId: accountId ?? null,
        destinationAccountId: type === 'TRANSFER' ? (destinationAccountId ?? null) : null,
        description: description || null,
        notes: notes || null,
        recurring: recurring ?? false,
        recurrenceFrequency: recurring ? recurrenceFrequency : null,
        recurrenceEndDate: recurring ? (recurrenceEndDate || null) : null
      };
      if (tx) {
        this.store.update(tx.id, request);
      } else {
        this.store.create(request);
      }
    }
    this.closeModal();
  }

  openNote(tx: Transaction): void {
    this.notingTx.set(tx);
    this.noteText.set(tx.notes ?? '');
    this.showNoteModal.set(true);
  }

  submitNote(): void {
    const tx = this.notingTx();
    if (tx) {
      this.store.updateNote(tx.id, this.noteText() || null);
    }
    this.showNoteModal.set(false);
    this.notingTx.set(null);
  }

  toggleHidden(tx: Transaction): void {
    this.store.toggleHidden(tx.id);
  }

  confirmDelete(tx: Transaction): void {
    this.deletingTx.set(tx);
    if (tx.recurrenceGroupId) {
      this.showRecurringDeleteModal.set(true);
    } else {
      this.showConfirmModal.set(true);
    }
  }

  deleteConfirmed(): void {
    const tx = this.deletingTx();
    if (tx) this.store.delete(tx.id);
    this.showConfirmModal.set(false);
    this.deletingTx.set(null);
  }

  deleteOnlyThis(): void {
    const tx = this.deletingTx();
    if (tx) this.store.delete(tx.id);
    this.showRecurringDeleteModal.set(false);
    this.deletingTx.set(null);
  }

  deleteFutureAll(): void {
    const tx = this.deletingTx();
    if (tx) this.store.deleteFuture(tx.id);
    this.showRecurringDeleteModal.set(false);
    this.deletingTx.set(null);
  }
}
