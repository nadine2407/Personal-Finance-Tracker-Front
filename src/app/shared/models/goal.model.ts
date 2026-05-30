export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  description: string | null;
  completed: boolean;
  progressPercent: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalRequest {
  name: string;
  targetAmount: number;
  deadline: string | null;
  description: string | null;
}

export interface DepositRequest {
  amount: number;
}