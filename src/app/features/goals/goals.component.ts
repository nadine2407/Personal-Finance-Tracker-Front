import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe, NgClass, PercentPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { GoalService, Goal } from '../../core/services/goal.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, CurrencyPipe, DatePipe, NgClass, PercentPipe],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'nav.goals' | translate }}</h2>
        <button class="btn btn-primary" (click)="openForm()">
          <i class="bi bi-plus-lg me-1"></i>{{ 'common.add' | translate }}
        </button>
      </div>

      @if (showForm()) {
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white">
            <h6 class="mb-0">{{ editId() ? 'Modifier' : 'Nouvel objectif' }}</h6>
          </div>
          <div class="card-body">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label small">Nom</label>
                  <input type="text" class="form-control form-control-sm" formControlName="name">
                </div>
                <div class="col-md-2">
                  <label class="form-label small">Objectif (€)</label>
                  <input type="number" class="form-control form-control-sm" formControlName="targetAmount" step="0.01" min="0.01">
                </div>
                <div class="col-md-2">
                  <label class="form-label small">Épargné (€)</label>
                  <input type="number" class="form-control form-control-sm" formControlName="savedAmount" step="0.01" min="0">
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Date cible</label>
                  <input type="date" class="form-control form-control-sm" formControlName="targetDate">
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
      } @else if (goals().length === 0) {
        <div class="text-center py-5 text-muted">
          <i class="bi bi-trophy fs-1 d-block mb-2"></i>
          Aucun objectif pour le moment.
        </div>
      } @else {
        <div class="row g-3">
          @for (g of goals(); track g.id) {
            <div class="col-md-6 col-lg-4">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <h6 class="mb-0 fw-bold">{{ g.name }}</h6>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-outline-primary" (click)="openForm(g)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="onDelete(g.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div class="mb-2">
                    <div class="d-flex justify-content-between small text-muted mb-1">
                      <span>{{ g.savedAmount | currency:'EUR':'symbol':'1.0-0' }}</span>
                      <span>{{ g.targetAmount | currency:'EUR':'symbol':'1.0-0' }}</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div class="progress-bar"
                           [ngClass]="progress(g) >= 100 ? 'bg-success' : 'bg-primary'"
                           [style.width.%]="progress(g)">
                      </div>
                    </div>
                    <div class="text-end small mt-1"
                         [ngClass]="progress(g) >= 100 ? 'text-success fw-bold' : 'text-muted'">
                      {{ progress(g) / 100 | percent:'1.0-0' }}
                    </div>
                  </div>

                  @if (g.targetDate) {
                    <div class="text-muted small">
                      <i class="bi bi-calendar me-1"></i>{{ g.targetDate | date:'dd/MM/yyyy' }}
                    </div>
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
export class GoalsComponent implements OnInit {
  private goalService = inject(GoalService);
  private fb = inject(FormBuilder);

  goals = signal<Goal[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editId = signal<number | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    targetAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    savedAmount: [0 as number | null],
    targetDate: ['']
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.goalService.getAll().subscribe({
      next: res => { this.goals.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  progress(g: Goal): number {
    if (!g.targetAmount) return 0;
    return Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100);
  }

  openForm(g?: Goal) {
    this.showForm.set(true);
    if (g) {
      this.editId.set(g.id);
      this.form.setValue({ name: g.name, targetAmount: g.targetAmount, savedAmount: g.savedAmount, targetDate: g.targetDate || '' });
    } else {
      this.editId.set(null);
      this.form.reset({ savedAmount: 0 });
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
      targetAmount: this.form.value.targetAmount!,
      savedAmount: this.form.value.savedAmount ?? 0,
      targetDate: this.form.value.targetDate || ''
    };
    const id = this.editId();
    const req = id ? this.goalService.update(id, payload) : this.goalService.create(payload);
    req.subscribe(() => { this.closeForm(); this.load(); });
  }

  onDelete(id: number) {
    this.goalService.delete(id).subscribe(() => this.load());
  }
}
