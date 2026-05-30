import { Component, inject, signal, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DashboardService, DashboardData } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe, CurrencyPipe, DatePipe, NgClass],
  template: `
    <div class="container-fluid">
      <h2 class="mb-4">{{ 'nav.dashboard' | translate }}</h2>

      @if (loading()) {
        <div class="text-center py-5">
          <span class="spinner-border text-primary"></span>
        </div>
      }

      @if (data()) {
        <!-- Cartes résumé -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body d-flex align-items-center gap-3">
                <div class="rounded-circle bg-success bg-opacity-10 p-3">
                  <i class="bi bi-arrow-down-circle-fill text-success fs-4"></i>
                </div>
                <div>
                  <div class="text-muted small">Revenus totaux</div>
                  <div class="fs-5 fw-bold text-success">
                    {{ data()!.totalIncome | currency:'EUR':'symbol':'1.2-2' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body d-flex align-items-center gap-3">
                <div class="rounded-circle bg-danger bg-opacity-10 p-3">
                  <i class="bi bi-arrow-up-circle-fill text-danger fs-4"></i>
                </div>
                <div>
                  <div class="text-muted small">Dépenses totales</div>
                  <div class="fs-5 fw-bold text-danger">
                    {{ data()!.totalExpenses | currency:'EUR':'symbol':'1.2-2' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body d-flex align-items-center gap-3">
                <div class="rounded-circle bg-primary bg-opacity-10 p-3">
                  <i class="bi bi-wallet2 text-primary fs-4"></i>
                </div>
                <div>
                  <div class="text-muted small">Solde</div>
                  <div class="fs-5 fw-bold"
                       [ngClass]="data()!.balance >= 0 ? 'text-primary' : 'text-danger'">
                    {{ data()!.balance | currency:'EUR':'symbol':'1.2-2' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats secondaires -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm text-center py-3">
              <div class="fs-3 fw-bold text-primary">{{ data()!.totalTransactions }}</div>
              <div class="text-muted small">Transactions</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm text-center py-3">
              <div class="fs-3 fw-bold text-warning">{{ data()!.totalBudgets }}</div>
              <div class="text-muted small">Budgets</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm text-center py-3">
              <div class="fs-3 fw-bold text-success">{{ data()!.totalGoals }}</div>
              <div class="text-muted small">Objectifs</div>
            </div>
          </div>
        </div>

        <!-- Transactions récentes -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 pt-3">
            <h5 class="mb-0">Transactions récentes</h5>
          </div>
          <div class="card-body p-0">
            @if (data()!.recentTransactions.length === 0) {
              <p class="text-muted text-center py-4">Aucune transaction pour le moment.</p>
            } @else {
              <ul class="list-group list-group-flush">
                @for (t of data()!.recentTransactions; track t.id) {
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi"
                         [ngClass]="t.categoryType === 'INCOME' ? 'bi-arrow-down-circle text-success' : 'bi-arrow-up-circle text-danger'">
                      </i>
                      <div>
                        <div class="fw-medium">{{ t.description || t.categoryName }}</div>
                        <div class="text-muted small">{{ t.date | date:'dd/MM/yyyy' }}</div>
                      </div>
                    </div>
                    <span [ngClass]="t.categoryType === 'INCOME' ? 'text-success' : 'text-danger'" class="fw-bold">
                      {{ t.categoryType === 'INCOME' ? '+' : '-' }}{{ t.amount | currency:'EUR':'symbol':'1.2-2' }}
                    </span>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  data = signal<DashboardData | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: res => {
        this.data.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
