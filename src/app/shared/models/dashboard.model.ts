export interface CategoryBreakdown {
  name: string;
  color: string | null;
  icon: string | null;
  amount: number;
  percentage: number;
}

export interface DashboardSummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface MonthlyDataPoint {
  month: number;
  income: number;
  expenses: number;
}

export interface MonthlyChart {
  year: number;
  data: MonthlyDataPoint[];
}