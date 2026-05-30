import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AccountService, Account } from '../../core/services/account.service';

const ACCOUNT_ICONS: Record<string, string> = {
  CHECKING: 'bi-bank',
  SAVINGS: 'bi-piggy-bank',
  CASH: 'bi-cash',
  CREDIT_CARD: 'bi-credit-card'
};

const ACCOUNT_LABELS: Record<string, string> = {
  CHECKING: 'Compte courant',
  SAVINGS: 'Épargne',
  CASH: 'Espèces',
  CREDIT_CARD: 'Carte de crédit'
};

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, CurrencyPipe, NgClass],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'nav.accounts' | translate }}</h2>
        <button class="btn btn-primary" (click)="openForm()">
          <i class="bi bi-plus-lg me-1"></i>{{ 'common.add' | translate }}
        </button>
      </div>

      @if (showForm()) {
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white">
            <h6 class="mb-0">{{ editId() ? 'Modifier' : 'Nouveau compte' }}</h6>
          </div>
          <div class="card-body">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label class="form-label small">Nom</label>
                  <input type="text" class="form-control form-control-sm" formControlName="name">
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Type</label>
                  <select class="form-select form-select-sm" formControlName="type">
                    <option value="">-- Choisir --</option>
                    <option value="CHECKING">Compte courant</option>
                    <option value="SAVINGS">Épargne</option>
                    <option value="CASH">Espèces</option>
                    <option value="CREDIT_CARD">Carte de crédit</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Solde (€)</label>
                  <input type="number" class="form-control form-control-sm" formControlName="balance" step="0.01">
                </div>
                <div class="col-md-2 d-flex gap-2">
                  <button type="submit" class="btn btn-primary btn-sm flex-grow-1" [disabled]="form.invalid">
                    {{ 'common.save' | translate }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary btn-sm" (click)="closeForm()">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="text-center py-5"><span class="spinner-border text-primary"></span></div>
      } @else if (accounts().length === 0) {
        <div class="text-center py-5 text-muted">
          <i class="bi bi-bank fs-1 d-block mb-2"></i>
          Aucun compte pour le moment.
        </div>
      } @else {
        <div class="row g-3">
          @for (a of accounts(); track a.id) {
            <div class="col-md-6 col-lg-3">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="rounded-circle bg-primary bg-opacity-10 p-2">
                      <i class="bi text-primary fs-5" [ngClass]="icon(a.type)"></i>
                    </div>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-outline-primary" (click)="openForm(a)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="onDelete(a.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div class="fw-bold mb-1">{{ a.name }}</div>
                  <div class="text-muted small mb-2">{{ label(a.type) }}</div>
                  <div class="fs-5 fw-bold" [ngClass]="a.balance >= 0 ? 'text-success' : 'text-danger'">
                    {{ a.balance | currency:'EUR':'symbol':'1.2-2' }}
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Total -->
          <div class="col-12">
            <div class="card border-0 bg-primary text-white shadow-sm">
              <div class="card-body d-flex justify-content-between align-items-center">
                <span class="fw-bold">Solde total</span>
                <span class="fs-5 fw-bold">{{ total() | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AccountsComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  accounts = signal<Account[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editId = signal<number | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    balance: [0 as number | null, Validators.required]
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.accountService.getAll().subscribe({
      next: res => { this.accounts.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  total() {
    return this.accounts().reduce((sum, a) => sum + a.balance, 0);
  }

  icon(type: string) { return ACCOUNT_ICONS[type] ?? 'bi-wallet'; }
  label(type: string) { return ACCOUNT_LABELS[type] ?? type; }

  openForm(a?: Account) {
    this.showForm.set(true);
    if (a) {
      this.editId.set(a.id);
      this.form.setValue({ name: a.name, type: a.type, balance: a.balance });
    } else {
      this.editId.set(null);
      this.form.reset({ balance: 0 });
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
      name: this.form.value.name!,
      type: this.form.value.type!,
      balance: this.form.value.balance!
    };
    const id = this.editId();
    const req = id ? this.accountService.update(id, payload) : this.accountService.create(payload);
    req.subscribe(() => { this.closeForm(); this.load(); });
  }

  onDelete(id: number) {
    this.accountService.delete(id).subscribe(() => this.load());
  }
}
