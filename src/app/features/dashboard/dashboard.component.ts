import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { DashboardStore } from './dashboard.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    DecimalPipe,
    TranslateModule,
    BaseChartDirective,
    PageHeaderComponent,
    StatCardComponent,
    EmptyStateComponent,
    CurrencyFormatPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  store = inject(DashboardStore);
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);

  periodForm = this.fb.group({
    year: [new Date().getFullYear()],
    month: [new Date().getMonth() + 1]
  });

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  months = Array.from({ length: 12 }, (_, i) => i + 1);

  barChartData = computed<ChartData<'bar'>>(() => {
    const chart = this.store.monthlyChart();
    if (!chart) return { labels: [], datasets: [] };

    return {
      labels: chart.data.map(d => this.translate.instant(`dashboard.months_short.${d.month}`)),
      datasets: [
        {
          label: this.translate.instant('transactions.type_income'),
          data: chart.data.map(d => d.income),
          backgroundColor: 'oklch(0.52 0.12 155 / 0.75)',
          borderColor: 'oklch(0.52 0.12 155)',
          borderWidth: 1,
          borderRadius: 3
        },
        {
          label: this.translate.instant('transactions.type_expense'),
          data: chart.data.map(d => d.expenses),
          backgroundColor: 'oklch(0.55 0.17 25 / 0.75)',
          borderColor: 'oklch(0.55 0.17 25)',
          borderWidth: 1,
          borderRadius: 3
        }
      ]
    };
  });

  doughnutData = computed<ChartData<'doughnut'>>(() => {
    const summary = this.store.summary();
    if (!summary || summary.categoryBreakdown.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    return {
      labels: summary.categoryBreakdown.map(c => c.name),
      datasets: [{
        data: summary.categoryBreakdown.map(c => c.amount),
        backgroundColor: summary.categoryBreakdown.map(c => c.color ?? 'oklch(0.42 0.16 282)'),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  });

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Geist Mono', size: 11 }, boxWidth: 10 } }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'oklch(0.91 0.012 280)' },
        ticks: { font: { family: 'Geist Mono', size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Geist Mono', size: 10 } }
      }
    }
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: { position: 'right', labels: { font: { family: 'Geist Mono', size: 11 }, boxWidth: 10 } }
    }
  };

  ngOnInit(): void {
    this.store.load();
  }

  applyPeriod(): void {
    const { year, month } = this.periodForm.value;
    if (year && month) {
      this.store.setPeriod(year, month);
    }
  }
}
