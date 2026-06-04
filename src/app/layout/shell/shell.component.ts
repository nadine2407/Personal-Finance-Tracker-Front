import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  private router = inject(Router);
  private translate = inject(TranslateService);
  readonly auth = inject(AuthService);

  readonly navItems = [
    { path: '/dashboard',    icon: 'bi-grid',           labelKey: 'nav.dashboard' },
    { path: '/transactions', icon: 'bi-receipt',        labelKey: 'nav.transactions' },
    { path: '/categories',   icon: 'bi-tag',            labelKey: 'nav.categories' },
    { path: '/goals',        icon: 'bi-piggy-bank',     labelKey: 'nav.goals' },
    { path: '/budgets',      icon: 'bi-pie-chart',      labelKey: 'nav.budgets' },
    { path: '/accounts',     icon: 'bi-bank',           labelKey: 'nav.accounts' }
  ];

  readonly currentMonth = computed(() =>
    new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  );

  readonly currentPageLabel = computed(() => {
    const url = this.router.url.split('/')[1] ?? 'dashboard';
    if (url === 'settings') return this.translate.instant('nav.settings');
    const item = this.navItems.find(n => n.path === '/' + url);
    return item ? this.translate.instant(item.labelKey) : 'Finance Tracker';
  });
}
