"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, formatPercentage } from "@/lib/financial-utils"
import { Target, PiggyBank, Building, TrendingUp } from "lucide-react"

export default function EscapeRatRaceProgress() {
  const monthlyExpenses = 1880
  const passiveIncome = 150
  const targetPassiveIncome = 2000
  
  const progressPercentage = (passiveIncome / targetPassiveIncome) * 100
  const expensesCoverage = (passiveIncome / monthlyExpenses) * 100

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Escape the Rat Race</h3>
      <p className="text-gray-600 mb-6">
        When your passive income exceeds your expenses, you achieve financial freedom
      </p>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Passive Income Goal</h4>
            <span className="text-sm text-gray-600">
              {formatCurrency(passiveIncome)} of {formatCurrency(targetPassiveIncome)}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3 mb-2" />
          <p className="text-sm text-gray-600">
            {formatPercentage(progressPercentage)} complete • {formatCurrency(targetPassiveIncome - passiveIncome)} remaining
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Expenses Coverage</h4>
            <span className="text-sm text-gray-600">
              {formatCurrency(passiveIncome)} covers {formatPercentage(expensesCoverage)} of expenses
            </span>
          </div>
          <Progress value={Math.min(expensesCoverage, 100)} className="h-3 mb-2" />
          <p className="text-sm text-gray-600">
            Monthly expenses: {formatCurrency(monthlyExpenses)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Financial Freedom Status</h4>
              {expensesCoverage >= 100 ? (
                <p className="text-sm text-green-800 mt-1">
                  Congratulations! Your passive income covers all expenses.
                </p>
              ) : (
                <p className="text-sm text-blue-800 mt-1">
                  You need {formatCurrency(monthlyExpenses - passiveIncome)} more in monthly passive income to achieve financial freedom.
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Next Steps to Build Passive Income</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <PiggyBank className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-gray-700">Increase emergency fund to invest in income-producing assets</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Building className="h-4 w-4 text-green-600" />
              <p className="text-sm text-gray-700">Research real estate investment opportunities</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-gray-700">Explore dividend-paying stocks and index funds</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}