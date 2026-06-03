export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string | null;
  transactionDate: string;
  category: {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  accountId: number | null;
  accountName: string | null;
  destinationAccountId: number | null;
  recurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceGroupId: string | null;
  recurrenceEndDate: string | null;
  hidden: boolean;
}

export interface TransactionRequest {
  type: TransactionType;
  amount: number;
  description: string | null;
  transactionDate: string;
  categoryId: number | null;
  notes: string | null;
  accountId: number | null;
  destinationAccountId: number | null;
  recurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceEndDate: string | null;
}

export interface TransactionFilter {
  type?: TransactionType;
  categoryId?: number;
  accountId?: number;
  destinationAccountId?: number;
  recurring?: boolean;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
}