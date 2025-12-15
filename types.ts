export type TransactionType = 'income' | 'expense';

export enum Category {
  FOOD = 'Alimentação',
  TRANSPORT = 'Transporte',
  HOUSING = 'Moradia',
  ENTERTAINMENT = 'Lazer',
  HEALTH = 'Saúde',
  SALARY = 'Salário',
  FREELANCE = 'Renda Extra',
  OTHER = 'Outros'
}

export interface UserProfile {
  name: string;
  password?: string; // Optional for backward compatibility, but required for new users
  joinedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: Category | string;
  description: string;
  date: string;
  type: TransactionType;
}

export interface FinancialInsight {
  title: string;
  advice: string;
  sentiment: 'positive' | 'warning' | 'neutral';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
}