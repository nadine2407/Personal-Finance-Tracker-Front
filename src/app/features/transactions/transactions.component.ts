import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { TransactionService, Transaction } from '../../core/services/transaction.service';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, CurrencyPipe, DatePipe, NgClass],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'nav.transactions' | translate }}</h2>
        <button class="btn btn-primary" (click)="openForm()">
          <i class="bi bi-plus-lg me-1"></i>{{ 'common.add' | translate }}
        </button>
      </div>

      <!-- Filtres -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-2 align-items-end">
            <div class="col-md-3">
              <label class="form-label small">Type</label>
              <select class="form-select form-select-sm" (change)="onTypeFilter($event)">
                <option value="">Tous</option>
                <option value="INCOME">Revenus</option>
                <option value="EXPENSE">Dépenses</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label small">Du</label>
              <input type="date" class="form-control form-control-sm" #fromDate (change)="onDateFilter(fromDate.value, toDate.value)">
            </div>
            <div class="col-md-3">
              <label class="form-label small">Au</label>
              <input type="date" class="form-control form-control-sm" #toDate (change)="onDateFilter(fromDate.value, toDate.value)">
            </div>
            <div class="col-md-3">
              <button class="btn btn-outline-secondary btn-sm w-100" (click)="resetFilter()">
                <i class="bi bi-x-circle me-1"></i>Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire -->
      @if (showForm()) {
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white">
            <h6 class="mb-0">{{ editId() ? 'Modifier' : 'Nouvelle transaction' }}</h6>
          </div>
          <div class="card-body">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label small">Montant</label>
                  <input type="number" class="form-control form-control-sm" formControlName="amount" step="0.01" min="0.01">
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Date</label>
                  <input type="date" class="form-control form-control-sm" formControlName="date">
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Catégorie</label>
                  <select class="form-select form-select-sm" formControlName="categoryId">
                    <option value="">-- Choisir --</option>
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id">{{ cat.name }} ({{ cat.type === 'INCOME' ? 'Revenu' : 'Dépense' }})</option>
                    }
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Description</label>
                  <input type="text" class="form-control form-control-sm" formControlName="description">
                </div>
              </div>
              <div class="d-flex gap-2 mt-3">
                <button type="submit" class="btn btn-primary btn-sm" [disabled]="form.invalid">
                  {{ 'common.save' | translate }}
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm" (click)="closeForm()">
                  {{ 'common.cancel' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Liste -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          @if (loading()) {
            <div class="text-center py-4"><span class="spinner-border text-primary"></span></div>
          } @else if (transactions().length === 0) {
            <p class="text-muted text-center py-4">Aucune transaction trouvée.</p>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Catégorie</th>
                    <th>Type</th>
                    <th class="text-end">Montant</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of transactions(); track t.id) {
                    <tr>
                      <td>{{ t.date | date:'dd/MM/yyyy' }}</td>
                      <td>{{ t.description || '—' }}</td>
                      <td><span class="badge bg-secondary">{{ t.categoryName }}</span></td>
                      <td>
                        <span class="badge" [ngClass]="t.categoryType === 'INCOME' ? 'bg-success' : 'bg-danger'">
                          {{ t.categoryType === 'INCOME' ? 'Revenu' : 'Dépense' }}
                        </span>
                      </td>
                      <td class="text-end fw-bold"
                          [ngClass]="t.categoryType === 'INCOME' ? 'text-success' : 'text-danger'">
                        {{ t.categoryType === 'INCOME' ? '+' : '-' }}{{ t.amount | currency:'EUR':'symbol':'1.2-2' }}
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" (click)="openForm(t)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" (click)="onDelete(t.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class TransactionsComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  transactions = signal<Transaction[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editId = signal<number | null>(null);

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: ['', Validators.required],
    categoryId: ['', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.loadTransactions();
    this.categoryService.getAll().subscribe(res => this.categories.set(res.data));
  }

  loadTransactions() {
    this.loading.set(true);
    this.transactionService.getAll().subscribe({
      next: res => { this.transactions.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onTypeFilter(event: Event) {
    const type = (event.target as HTMLSelectElement).value;
    if (!type) { this.loadTransactions(); return; }
    this.transactionService.filter(type).subscribe(res => this.transactions.set(res.data));
  }

  onDateFilter(from: string, to: string) {
    if (!from || !to) return;
    this.transactionService.filter(undefined, from, to).subscribe(res => this.transactions.set(res.data));
  }

  resetFilter() {
    this.loadTransactions();
  }

  openForm(t?: Transaction) {
    this.showForm.set(true);
    if (t) {
      this.editId.set(t.id);
      this.form.setValue({ amount: t.amount, date: t.date, categoryId: String(t.categoryId), description: t.description || '' });
    } else {
      this.editId.set(null);
      this.form.reset();
    }
  }

  closeForm() {
    this.showForm.set(false);
    this.editId.set(null);
    this.form.reset();
  }

  onSubmit() {
    if (this.form.invalid) return;
    const payload = {
      amount: this.form.value.amount!,
      date: this.form.value.date!,
      categoryId: Number(this.form.value.categoryId),
      description: this.form.value.description || ''
    };
    const id = this.editId();
    const req = id
      ? this.transactionService.update(id, payload)
      : this.transactionService.create(payload);
    req.subscribe(() => { this.closeForm(); this.loadTransactions(); });
  }

  onDelete(id: number) {
    this.transactionService.delete(id).subscribe(() => this.loadTransactions());
  }
}
