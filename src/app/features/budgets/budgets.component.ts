import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { BudgetService, Budget } from '../../core/services/budget.service';
import { CategoryService, Category } from '../../core/services/category.service';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, CurrencyPipe, NgClass],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'nav.budgets' | translate }}</h2>
        <button class="btn btn-primary" (click)="openForm()">
          <i class="bi bi-plus-lg me-1"></i>{{ 'common.add' | translate }}
        </button>
      </div>

      @if (showForm()) {
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white">
            <h6 class="mb-0">{{ editId() ? 'Modifier' : 'Nouveau budget' }}</h6>
          </div>
          <div class="card-body">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label small">Nom</label>
                  <input type="text" class="form-control form-control-sm" formControlName="name">
                </div>
                <div class="col-md-2">
                  <label class="form-label small">Limite (€)</label>
                  <input type="number" class="form-control form-control-sm" formControlName="limitAmount" step="0.01" min="0.01">
                </div>
                <div class="col-md-2">
                  <label class="form-label small">Mois</label>
                  <select class="form-select form-select-sm" formControlName="month">
                    @for (m of months; track $index) {
                      <option [value]="$index + 1">{{ m }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label small">Année</label>
                  <input type="number" class="form-control form-control-sm" formControlName="year" min="2000">
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Catégorie (optionnel)</label>
                  <select class="form-select form-select-sm" formControlName="categoryId">
                    <option [value]="null">-- Aucune --</option>
                    @for (c of categories(); track c.id) {
                      <option [value]="c.id">{{ c.name }}</option>
                    }
                  </select>
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

      @if (loading()) {
        <div class="text-center py-5"><span class="spinner-border text-primary"></span></div>
      } @else if (budgets().length === 0) {
        <div class="text-center py-5 text-muted">
          <i class="bi bi-pie-chart fs-1 d-block mb-2"></i>
          Aucun budget pour le moment.
        </div>
      } @else {
        <div class="row g-3">
          @for (b of budgets(); track b.id) {
            <div class="col-md-6 col-lg-4">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 class="mb-0 fw-bold">{{ b.name }}</h6>
                      <small class="text-muted">{{ months[b.month - 1] }} {{ b.year }}</small>
                    </div>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-outline-primary" (click)="openForm(b)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="onDelete(b.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div class="fs-5 fw-bold text-primary">
                    {{ b.limitAmount | currency:'EUR':'symbol':'1.2-2' }}
                  </div>
                  @if (b.categoryName) {
                    <span class="badge bg-secondary mt-1">{{ b.categoryName }}</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class BudgetsComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  budgets = signal<Budget[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editId = signal<number | null>(null);
  months = MONTHS;

  form = this.fb.group({
    name: ['', Validators.required],
    limitAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    month: [new Date().getMonth() + 1, Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    categoryId: [null as number | null]
  });

  ngOnInit() {
    this.load();
    this.categoryService.getAll().subscribe(res => this.categories.set(res.data));
  }

  load() {
    this.loading.set(true);
    this.budgetService.getAll().subscribe({
      next: res => { this.budgets.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(b?: Budget) {
    this.showForm.set(true);
    if (b) {
      this.editId.set(b.id);
      this.form.setValue({ name: b.name, limitAmount: b.limitAmount, month: b.month, year: b.year, categoryId: b.categoryId });
    } else {
      this.editId.set(null);
      this.form.reset({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
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
      limitAmount: this.form.value.limitAmount!,
      month: this.form.value.month!,
      year: this.form.value.year!,
      categoryId: this.form.value.categoryId ?? null
    };
    const id = this.editId();
    const req = id ? this.budgetService.update(id, payload) : this.budgetService.create(payload);
    req.subscribe(() => { this.closeForm(); this.load(); });
  }

  onDelete(id: number) {
    this.budgetService.delete(id).subscribe(() => this.load());
  }
}
