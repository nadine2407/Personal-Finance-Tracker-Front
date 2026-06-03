export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  allocatedAmount: number;
  deadline: string | null;
  description: string | null;
  completed: boolean;
  debited: boolean;
  debitedAt: string | null;
  progressPercent: number;
  remainingAmount: number;
  linkedAccountId: number | null;
  linkedAccountName: string | null;
  priority: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalRequest {
  name: string;
  targetAmount: number;
  deadline: string | null;
  description: string | null;
  linkedAccountId: number | null;
  allocatedAmount: number;
}

export interface AllocationRequest {
  allocatedAmount: number;
}

export interface DebitRequest {
  checkingAccountId: number;
}
