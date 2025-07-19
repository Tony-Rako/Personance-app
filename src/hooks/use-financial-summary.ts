import { useMemo } from 'react'
import { trpc } from '@/lib/trpc'
import { 
  calculateNetWorth, 
  calculateCashFlow,
  formatCurrency,
  calculateInvestmentReturn
} from '@/lib/financial-utils'
import type { FinancialSummary, BudgetSummary } from '@/types/financial'

export const useFinancialSummary = () => {
  const { data: incomes, isLoading: incomesLoading } = trpc.income.getAll.useQuery()
  const { data: expenses, isLoading: expensesLoading } = trpc.expense.getAll.useQuery()
  const { data: totalAssets, isLoading: assetsLoading } = trpc.asset.getTotalValue.useQuery()
  const { data: totalLiabilities, isLoading: liabilitiesLoading } = trpc.liability.getTotalBalance.useQuery()
  const { data: monthlyIncome, isLoading: monthlyIncomeLoading } = trpc.income.getTotalMonthly.useQuery()
  const { data: monthlyExpenses, isLoading: monthlyExpensesLoading } = trpc.expense.getTotalMonthly.useQuery()

  const isLoading = incomesLoading || expensesLoading || assetsLoading || 
                   liabilitiesLoading || monthlyIncomeLoading || monthlyExpensesLoading

  const summary: FinancialSummary = useMemo(() => {
    if (isLoading) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        cashFlow: 0,
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
        monthlyChange: 0,
        monthlyChangePercentage: 0,
      }
    }

    const totalIncomeValue = monthlyIncome || 0
    const totalExpensesValue = monthlyExpenses || 0
    const totalAssetsValue = totalAssets || 0
    const totalLiabilitiesValue = totalLiabilities || 0
    
    const netWorth = calculateNetWorth(totalAssetsValue, totalLiabilitiesValue)
    const cashFlow = calculateCashFlow(totalIncomeValue, totalExpensesValue)
    
    // Mock monthly change calculation (in real app, you'd track this over time)
    const mockPreviousNetWorth = netWorth * 0.98 // Assume 2% growth
    const monthlyChange = netWorth - mockPreviousNetWorth
    const monthlyChangePercentage = mockPreviousNetWorth > 0 
      ? (monthlyChange / mockPreviousNetWorth) * 100 
      : 0

    return {
      totalIncome: totalIncomeValue,
      totalExpenses: totalExpensesValue,
      cashFlow,
      totalAssets: totalAssetsValue,
      totalLiabilities: totalLiabilitiesValue,
      netWorth,
      monthlyChange,
      monthlyChangePercentage,
    }
  }, [
    monthlyIncome,
    monthlyExpenses,
    totalAssets,
    totalLiabilities,
    isLoading
  ])

  return {
    summary,
    isLoading,
    formattedSummary: {
      totalIncome: formatCurrency(summary.totalIncome),
      totalExpenses: formatCurrency(summary.totalExpenses),
      cashFlow: formatCurrency(summary.cashFlow, { showSign: true }),
      totalAssets: formatCurrency(summary.totalAssets),
      totalLiabilities: formatCurrency(summary.totalLiabilities),
      netWorth: formatCurrency(summary.netWorth, { showSign: true }),
      monthlyChange: formatCurrency(summary.monthlyChange, { showSign: true }),
    }
  }
}

export const useBudgetSummary = () => {
  const { data: currentBudget, isLoading } = trpc.budget.getCurrent.useQuery()

  const summary: BudgetSummary = useMemo(() => {
    if (!currentBudget || isLoading) {
      return {
        totalBudgeted: 0,
        totalSpent: 0,
        remaining: 0,
        progressPercentage: 0,
        categoriesOverBudget: 0,
        categoriesOnTrack: 0,
      }
    }

    const totalBudgeted = parseFloat(currentBudget.totalAmount.toString())
    const totalSpent = currentBudget.categories.reduce((sum, category) => {
      return sum + parseFloat(category.spentAmount.toString())
    }, 0)

    const remaining = totalBudgeted - totalSpent
    const progressPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

    const categoriesOverBudget = currentBudget.categories.filter(category => {
      const allocated = parseFloat(category.allocatedAmount.toString())
      const spent = parseFloat(category.spentAmount.toString())
      return spent > allocated
    }).length

    const categoriesOnTrack = currentBudget.categories.length - categoriesOverBudget

    return {
      totalBudgeted,
      totalSpent,
      remaining,
      progressPercentage,
      categoriesOverBudget,
      categoriesOnTrack,
    }
  }, [currentBudget, isLoading])

  return {
    summary,
    isLoading,
    currentBudget,
    formattedSummary: {
      totalBudgeted: formatCurrency(summary.totalBudgeted),
      totalSpent: formatCurrency(summary.totalSpent),
      remaining: formatCurrency(summary.remaining),
    }
  }
}