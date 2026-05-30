export type BudgetStatus = 'ON' | 'WARN' | 'OVER';

export interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string | null;
  categoryIcon: string | null;
  amount: number;
  month: number;
  year: number;
}

export interface BudgetRequest {
  categoryId: number;
  amount: number;
  month: number;
  year: number;
}

export interface BudgetStatusItem {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string | null;
  categoryIcon: string | null;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  status: BudgetStatus;
}

export interface BudgetPageSummary {
  year: number;
  month: number;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  overspend: number;
  warnCount: number;
  overCount: number;
  items: BudgetStatusItem[];
}
