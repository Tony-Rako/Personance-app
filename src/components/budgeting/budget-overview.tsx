'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBudgetSummary } from '@/hooks/use-financial-summary'
import { formatCurrency, formatPercentage } from '@/lib/financial-utils'
import BudgetCreateDialog from './budget-create-dialog'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { format } from 'date-fns'

export default function BudgetOverview() {
  const { summary, currentBudget, isLoading } = useBudgetSummary()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!currentBudget) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Create Your First Budget
          </h3>
          <p className="text-gray-600 mb-6">
            Start taking control of your finances by creating a monthly budget.
            Track your spending and stay on top of your financial goals.
          </p>
          <Button size="lg" onClick={() => setShowCreateDialog(true)}>
            Create Budget
          </Button>
        </div>
      </Card>
    )
  }

  const progressPercentage = Math.min(summary.progressPercentage, 100)
  const isOverBudget = summary.totalSpent > summary.totalBudgeted
  const daysInMonth = new Date(
    currentBudget.endDate.getFullYear(),
    currentBudget.endDate.getMonth() + 1,
    0
  ).getDate()
  const daysElapsed = Math.floor(
    (Date.now() - currentBudget.startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const expectedSpendingRate = Math.min((daysElapsed / daysInMonth) * 100, 100)

  return (
    <div className="space-y-6">
      {/* Budget Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentBudget.name}
            </h2>
            <p className="text-gray-600">
              {format(currentBudget.startDate, 'MMM dd')} -{' '}
              {format(currentBudget.endDate, 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Edit Budget
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              New Budget
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Budget Progress
            </span>
            <span
              className={`text-sm font-medium ${
                isOverBudget ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {formatPercentage(progressPercentage)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          {isOverBudget && (
            <div className="flex items-center space-x-1 mt-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Over budget by{' '}
                {formatCurrency(summary.totalSpent - summary.totalBudgeted)}
              </span>
            </div>
          )}
        </div>

        {/* Budget Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Budgeted</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalBudgeted)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p
              className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}
            >
              {formatCurrency(summary.totalSpent)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p
              className={`text-2xl font-bold ${
                summary.remaining > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(summary.remaining)}
            </p>
          </div>
        </div>
      </Card>

      {/* Budget Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Spending Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Categories on track</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">
                  {summary.categoriesOnTrack}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Categories over budget
              </span>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-600">
                  {summary.categoriesOverBudget}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Expected vs actual spending
              </span>
              <div className="flex items-center space-x-2">
                {progressPercentage > expectedSpendingRate ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-600">
                      +
                      {formatPercentage(
                        progressPercentage - expectedSpendingRate
                      )}{' '}
                      above pace
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      {formatPercentage(
                        expectedSpendingRate - progressPercentage
                      )}{' '}
                      under pace
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Budget Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Budget utilization</span>
              <span
                className={`font-medium ${
                  progressPercentage > 90
                    ? 'text-red-600'
                    : progressPercentage > 75
                      ? 'text-orange-600'
                      : 'text-green-600'
                }`}
              >
                {progressPercentage > 90
                  ? 'High'
                  : progressPercentage > 75
                    ? 'Medium'
                    : 'Low'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Days remaining</span>
              <span className="font-medium text-gray-900">
                {Math.max(0, daysInMonth - daysElapsed)} days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average daily spend</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(
                  daysElapsed > 0 ? summary.totalSpent / daysElapsed : 0
                )}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Create Dialog */}
      <BudgetCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}
