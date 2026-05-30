import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, NgClass],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'nav.categories' | translate }}</h2>
        <button class="btn btn-primary" (click)="openForm()">
          <i class="bi bi-plus-lg me-1"></i>{{ 'common.add' | translate }}
        </button>
      </div>

      @if (showForm()) {
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white">
            <h6 class="mb-0">{{ editId() ? 'Modifier' : 'Nouvelle catégorie' }}</h6>
          </div>
          <div class="card-body">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="row g-3 align-items-end">
                <div class="col-md-5">
                  <label class="form-label small">Nom</label>
                  <input type="text" class="form-control form-control-sm" formControlName="name">
                </div>
                <div class="col-md-4">
                  <label class="form-label small">Type</label>
                  <select class="form-select form-select-sm" formControlName="type">
                    <option value="">-- Choisir --</option>
                    <option value="INCOME">Revenu</option>
                    <option value="EXPENSE">Dépense</option>
                  </select>
                </div>
                <div class="col-md-3 d-flex gap-2">
                  <button type="submit" class="btn btn-primary btn-sm flex-grow-1" [disabled]="form.invalid">
                    {{ 'common.save' | translate }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary btn-sm" (click)="closeForm()">
                    {{ 'common.cancel' | translate }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="text-center py-5"><span class="spinner-border text-primary"></span></div>
      } @else {
        <div class="row g-3">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h6 class="mb-0 text-success"><i class="bi bi-arrow-down-circle me-2"></i>Revenus</h6>
              </div>
              <ul class="list-group list-group-flush">
                @for (c of incomeCategories(); track c.id) {
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>{{ c.name }}</span>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-outline-primary" (click)="openForm(c)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="onDelete(c.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </li>
                }
                @if (incomeCategories().length === 0) {
                  <li class="list-group-item text-muted small">Aucune catégorie revenu.</li>
                }
              </ul>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h6 class="mb-0 text-danger"><i class="bi bi-arrow-up-circle me-2"></i>Dépenses</h6>
              </div>
              <ul class="list-group list-group-flush">
                @for (c of expenseCategories(); track c.id) {
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>{{ c.name }}</span>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-outline-primary" (click)="openForm(c)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="onDelete(c.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </li>
                }
                @if (expenseCategories().length === 0) {
                  <li class="list-group-item text-muted small">Aucune catégorie dépense.</li>
                }
              </ul>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories = signal<Category[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editId = signal<number | null>(null);

  incomeCategories = () => this.categories().filter(c => c.type === 'INCOME');
  expenseCategories = () => this.categories().filter(c => c.type === 'EXPENSE');

  form = this.fb.group({
    name: ['', Validators.required],
    type: ['', Validators.required]
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: res => { this.categories.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(c?: Category) {
    this.showForm.set(true);
    if (c) {
      this.editId.set(c.id);
      this.form.setValue({ name: c.name, type: c.type });
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
    const payload = { name: this.form.value.name!, type: this.form.value.type! };
    const id = this.editId();
    const req = id ? this.categoryService.update(id, payload) : this.categoryService.create(payload);
    req.subscribe(() => { this.closeForm(); this.load(); });
  }

  onDelete(id: number) {
    this.categoryService.delete(id).subscribe(() => this.load());
  }
}
