'use client'

import BudgetOverview from '@/components/budgeting/budget-overview'
import BudgetCategories from '@/components/budgeting/budget-categories'
import { useBudgetSummary } from '@/hooks/use-financial-summary'
import { useCurrencyFormat } from '@/hooks/use-currency-format'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

function BudgetTips() {
  const tips = [
    {
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      title: "You're under budget!",
      description:
        "You're currently $1,150 under your monthly budget. Great job keeping expenses in check!",
      type: 'success',
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
      title: 'Budget Tip',
      description:
        'Consider allocating your remaining funds toward savings or paying down debt to improve your financial health.',
      type: 'info',
    },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Spending Goals
      </h3>
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              tip.type === 'success'
                ? 'bg-green-50 border-green-400'
                : tip.type === 'info'
                  ? 'bg-blue-50 border-blue-400'
                  : 'bg-amber-50 border-amber-400'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
              <div>
                <h4
                  className={`font-medium ${
                    tip.type === 'success'
                      ? 'text-green-800'
                      : tip.type === 'info'
                        ? 'text-blue-800'
                        : 'text-amber-800'
                  }`}
                >
                  {tip.title}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    tip.type === 'success'
                      ? 'text-green-700'
                      : tip.type === 'info'
                        ? 'text-blue-700'
                        : 'text-amber-700'
                  }`}
                >
                  {tip.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SpendingGoals() {
  const { formatAmount } = useCurrencyFormat()
  // Mock data based on the original app screenshots
  const goals = [
    {
      name: 'Housing',
      allocated: 1200,
      spent: 1200,
      remaining: 0,
      color: '#EF4444',
    },
    {
      name: 'Food',
      allocated: 600,
      spent: 350,
      remaining: 250,
      color: '#10B981',
    },
    {
      name: 'Transportation',
      allocated: 200,
      spent: 120,
      remaining: 80,
      color: '#10B981',
    },
    {
      name: 'Entertainment',
      allocated: 300,
      spent: 180,
      remaining: 120,
      color: '#10B981',
    },
    {
      name: 'Utilities',
      allocated: 250,
      spent: 0,
      remaining: 250,
      color: '#6B7280',
    },
    {
      name: 'Personal',
      allocated: 450,
      spent: 0,
      remaining: 450,
      color: '#6B7280',
    },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Budget Categories
        </h3>
        <p className="text-sm text-gray-500">
          Create a budget to start adding categories
        </p>
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => {
          const progress =
            goal.allocated > 0 ? (goal.spent / goal.allocated) * 100 : 0
          const isOverBudget = goal.spent > goal.allocated
          const usageText =
            goal.allocated > 0 ? `${Math.round(progress)}% used` : '0% used'

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{goal.name}</span>
                <span className="text-sm text-gray-600">
                  {formatAmount(goal.spent)} of {formatAmount(goal.allocated)}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: goal.color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {formatAmount(goal.remaining)} remaining
                </span>
                <span
                  className={`${
                    isOverBudget
                      ? 'text-red-600'
                      : progress === 0
                        ? 'text-gray-500'
                        : 'text-gray-700'
                  }`}
                >
                  {usageText}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t">
        <div className="text-center text-gray-500 text-sm">
          Budget categories will be available after creating your first budget
        </div>
      </div>
    </Card>
  )
}

export default function BudgetingPage() {
  const { currentBudget, isLoading } = useBudgetSummary()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        </div>
        <div className="grid gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Personance Budget</h1>
        <p className="text-gray-600 mt-2">
          Take control of your spending with smart budget tracking and insights.
        </p>
      </div>

      {/* Budget Overview */}
      <BudgetOverview />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {currentBudget ? (
            <BudgetCategories currentBudget={currentBudget} />
          ) : (
            <SpendingGoals />
          )}
        </div>

        <div className="space-y-6">
          <BudgetTips />
        </div>
      </div>
    </div>
  )
}
