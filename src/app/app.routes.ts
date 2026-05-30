import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/transactions/transactions.component').then(m => m.TransactionsComponent)
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadComponent: () => import('./features/accounts/accounts.component').then(m => m.AccountsComponent)
  },
  {
    path: 'budgets',
    canActivate: [authGuard],
    loadComponent: () => import('./features/budgets/budgets.component').then(m => m.BudgetsComponent)
  },
  {
    path: 'goals',
    canActivate: [authGuard],
    loadComponent: () => import('./features/goals/goals.component').then(m => m.GoalsComponent)
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
