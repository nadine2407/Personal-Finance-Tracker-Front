export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';

export interface Category {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  type: CategoryType;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
  icon: string | null;
  color: string | null;
  type: CategoryType;
}
