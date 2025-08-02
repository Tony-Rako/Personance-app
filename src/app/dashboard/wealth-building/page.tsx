'use client'

import React, { useState } from 'react'
import CashFlowQuadrant from '@/components/wealth-building/cash-flow-quadrant'
import IncomeExpenseManager from '@/components/dashboard/income-expense-manager'
import AssetManager from '@/components/dashboard/asset-manager'
import LiabilityManager from '@/components/dashboard/liability-manager'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  formatCurrency,
  calculatePassiveIncome,
  calculateEscapeRatRaceProgress,
} from '@/lib/financial-utils'
import { useFinancialSummary } from '@/hooks/use-financial-summary'
import { trpc } from '@/lib/trpc'
import { DollarSign, CreditCard, Target } from 'lucide-react'
import type { Income } from '@prisma/client'

export default function WealthBuildingPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'income-expenses' | 'assets' | 'liabilities'
  >('overview')

  // Get real financial data
  const { summary: financialSummary } = useFinancialSummary()
  const { data: incomes } = trpc.income.getAll.useQuery()
  const { data: passiveIncomeGoal } = trpc.goal.getPassiveIncomeGoal.useQuery()

  // Calculate escape the rat race progress
  const monthlyExpenses = financialSummary.totalExpenses

  // Auto-update passive income goal progress (with throttling protection)
  const updatePassiveIncomeProgress =
    trpc.goal.updatePassiveIncomeProgress.useMutation({
      onSuccess: () => {
        // Only invalidate the specific passive income goal query, not all goals
        trpc.useUtils().goal.getPassiveIncomeGoal.invalidate()
      },
    })

  // Memoize passive income calculation to prevent unnecessary recalculations
  const memoizedPassiveIncome = React.useMemo(() => {
    if (!incomes) return 0
    return calculatePassiveIncome(
      incomes.map((income: Income) => ({
        source: income.source,
        amount: parseFloat(income.amount.toString()),
      }))
    )
  }, [incomes])

  // Calculate escape progress using memoized passive income
  const escapeProgress = React.useMemo(
    () =>
      calculateEscapeRatRaceProgress(memoizedPassiveIncome, monthlyExpenses),
    [memoizedPassiveIncome, monthlyExpenses]
  )

  // Debounced update effect - only update when passive income changes significantly
  React.useEffect(() => {
    if (memoizedPassiveIncome > 0 && passiveIncomeGoal) {
      const currentAmount = parseFloat(
        passiveIncomeGoal.currentAmount.toString()
      )
      const difference = Math.abs(currentAmount - memoizedPassiveIncome)

      // Only update if difference is significant (> $1) and not already pending
      if (difference > 1 && !updatePassiveIncomeProgress.isPending) {
        updatePassiveIncomeProgress.mutate({
          passiveIncome: memoizedPassiveIncome,
        })
      }
    }
  }, [
    memoizedPassiveIncome,
    passiveIncomeGoal?.id,
    passiveIncomeGoal?.currentAmount,
    passiveIncomeGoal,
    updatePassiveIncomeProgress,
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wealth Building</h1>
        <p className="text-gray-600 mt-2">
          Apply Rich Dad Poor Dad principles to build lasting wealth and achieve
          financial freedom.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            {
              id: 'income-expenses',
              label: 'Income & Expenses',
              icon: DollarSign,
            },
            { id: 'assets', label: 'Assets', icon: Target },
            { id: 'liabilities', label: 'Liabilities', icon: CreditCard },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as
                      | 'overview'
                      | 'income-expenses'
                      | 'assets'
                      | 'liabilities'
                  )
                }
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Financial Goals */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Escape The Rat Race Progress
            </h3>

            <div className="space-y-4">
              {passiveIncomeGoal ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      {passiveIncomeGoal.name}
                    </p>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(memoizedPassiveIncome)} /{' '}
                      {formatCurrency(
                        parseFloat(passiveIncomeGoal.targetAmount.toString())
                      )}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(escapeProgress, 100)}
                    className="h-3 mb-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Progress: {escapeProgress.toFixed(1)}%
                    </span>
                    <span
                      className={
                        escapeProgress >= 100
                          ? 'text-green-600 font-semibold'
                          : 'text-gray-600'
                      }
                    >
                      {escapeProgress >= 100
                        ? '🎉 Financial Freedom!'
                        : 'Keep building passive income'}
                    </span>
                  </div>
                  {passiveIncomeGoal.description && (
                    <p className="text-xs text-gray-500 mt-2">
                      {passiveIncomeGoal.description}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      Passive Income vs Monthly Expenses
                    </p>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(memoizedPassiveIncome)} /{' '}
                      {formatCurrency(monthlyExpenses)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(escapeProgress, 100)}
                    className="h-3 mb-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Progress: {escapeProgress.toFixed(1)}%
                    </span>
                    <span
                      className={
                        escapeProgress >= 100
                          ? 'text-green-600 font-semibold'
                          : 'text-gray-600'
                      }
                    >
                      {escapeProgress >= 100
                        ? '🎉 Financial Freedom!'
                        : 'Keep building passive income'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Add expenses to automatically create your escape the rat
                    race goal
                  </p>
                </div>
              )}
              {/* Financial Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-600">TOTAL INCOME</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(financialSummary.totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">TOTAL EXPENSES</p>
                  <p className="font-semibold text-red-600">
                    {formatCurrency(financialSummary.totalExpenses)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">CASH FLOW</p>
                  <p
                    className={`font-semibold ${financialSummary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(financialSummary.cashFlow, {
                      showSign: true,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">NET WORTH</p>
                  <p
                    className={`font-semibold ${financialSummary.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(financialSummary.netWorth, {
                      showSign: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Rich Dad Definition */}
          <Card className="p-6 bg-purple-50 border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Rich Dad Definition
            </h3>
            <p className="text-sm text-purple-800">
              <strong>Asset:</strong> Puts money in your pocket.{' '}
              <strong>Liability:</strong> Takes money out of your pocket. The
              rich buy assets, the poor and middle class buy liabilities they
              think are assets.
            </p>
          </Card>

          {/* Cash Flow Quadrant */}
          <CashFlowQuadrant />
        </div>
      )}

      {activeTab === 'income-expenses' && <IncomeExpenseManager />}
      {activeTab === 'assets' && <AssetManager />}
      {activeTab === 'liabilities' && <LiabilityManager />}
    </div>
  )
}
