import { Routes } from '@angular/router';

export const BUDGETS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./budgets.component').then(m => m.BudgetsComponent)
  }
];
