export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'CASH';

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  color: string | null;
  icon: string | null;
  initialBalance: number;
  currentBalance: number;
}

export interface AccountRequest {
  name: string;
  type: AccountType;
  initialBalance: number;
  color: string | null;
  icon: string | null;
}
