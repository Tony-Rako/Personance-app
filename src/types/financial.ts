import { AssetType, GoalType, TransactionType } from '@prisma/client'

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  cashFlow: number
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  monthlyChange: number
  monthlyChangePercentage: number
}

export interface BudgetSummary {
  totalBudgeted: number
  totalSpent: number
  remaining: number
  progressPercentage: number
  categoriesOverBudget: number
  categoriesOnTrack: number
}

export interface AssetAllocation {
  type: AssetType
  value: number
  percentage: number
  count: number
}

export interface InvestmentPerformance {
  totalValue: number
  totalGain: number
  totalGainPercentage: number
  yearToDateGain: number
  yearToDatePercentage: number
}

export interface DebtSummary {
  totalDebt: number
  monthlyPayments: number
  averageInterestRate: number
  debtToIncomeRatio: number
  timeToPayoffMonths: number
}

export interface GoalProgress {
  id: string
  name: string
  type: GoalType
  currentAmount: number
  targetAmount: number
  progressPercentage: number
  targetDate?: Date
  monthsRemaining?: number
  onTrack: boolean
}

export interface CategorySpending {
  category: string
  amount: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  change: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
  netIncome: number
  savings: number
  savingsRate: number
}

export interface TransactionSummary {
  id: string
  date: Date
  description: string
  category: string
  amount: number
  type: TransactionType
  accountName?: string
  tags: string[]
}

export interface NetWorthTrend {
  date: Date
  assets: number
  liabilities: number
  netWorth: number
}

export interface BudgetCategoryWithProgress {
  id: string
  name: string
  allocatedAmount: number
  spentAmount: number
  remaining: number
  progressPercentage: number
  color: string
  isOverBudget: boolean
  daysRemaining: number
}

export interface EmergencyFundStatus {
  currentAmount: number
  targetAmount: number
  monthsOfExpenses: number
  isAdequate: boolean
  recommendedAmount: number
}

export interface RetirementProjection {
  currentAge: number
  retirementAge: number
  currentSavings: number
  projectedSavings: number
  monthlyContribution: number
  readinessScore: number
  onTrack: boolean
  shortfall?: number
}

export interface CashFlowProjection {
  month: Date
  projectedIncome: number
  projectedExpenses: number
  projectedCashFlow: number
  cumulativeCashFlow: number
}

// Form types
export interface IncomeFormData {
  source: string
  amount: number
  frequency: 'monthly' | 'yearly' | 'weekly' | 'bi-weekly'
}

export interface ExpenseFormData {
  category: string
  amount: number
  frequency: 'monthly' | 'yearly' | 'weekly' | 'bi-weekly'
  isRecurring: boolean
}

export interface AssetFormData {
  name: string
  type: AssetType
  value: number
  costBasis?: number
  growth?: number
}

export interface LiabilityFormData {
  name: string
  type: string
  balance: number
  interestRate?: number
  minimumPayment?: number
  dueDate?: Date
}

export interface BudgetFormData {
  name: string
  totalAmount: number
  startDate: Date
  endDate: Date
}

export interface BudgetCategoryFormData {
  name: string
  allocatedAmount: number
  color: string
}

export interface GoalFormData {
  name: string
  type: GoalType
  targetAmount: number
  targetDate?: Date
  description?: string
}

export interface TransactionFormData {
  amount: number
  description: string
  category: string
  type: TransactionType
  date: Date
  accountName?: string
  tags: string[]
}