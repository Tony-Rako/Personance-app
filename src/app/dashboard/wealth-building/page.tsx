'use client'

import CashFlowQuadrant from '@/components/wealth-building/cash-flow-quadrant'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/financial-utils'
import { Plus, Trash2, DollarSign, CreditCard } from 'lucide-react'

export default function WealthBuildingPage() {
  // Sample data - would come from API in real app
  const incomeData = [
    {
      id: 1,
      name: 'Police Officer Salary',
      amount: 3000,
      frequency: 'monthly',
    },
    { id: 2, name: 'Interest/Dividends', amount: 150, frequency: 'monthly' },
  ]

  const expenseData = [
    { id: 1, name: 'Grocery', amount: 50, frequency: 'weekly' },
    { id: 2, name: 'Taxes', amount: 580, frequency: 'monthly' },
    { id: 3, name: 'Home Mortgage Payment', amount: 400, frequency: 'monthly' },
  ]

  const assets = [
    { category: 'Stocks/Funds/CDs', items: [], total: 0 },
    { category: 'Real Estate/Business', items: [], total: 0 },
  ]

  const liabilities = [
    { name: 'Home Mortgage', amount: 46000 },
    { name: 'Car Loans', amount: 5000 },
    { name: 'Credit Cards', amount: 2000 },
    { name: 'Retail Debt', amount: 1000 },
  ]

  const passiveIncomeGoal = {
    current: 0,
    target: 2000,
    progress: 0,
  }

  const totalIncome = 3000
  const totalExpenses = 1880
  const netCashFlow = -175

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wealth Building</h1>
        <p className="text-gray-600 mt-2">
          Apply Rich Dad Poor Dad principles to build lasting wealth and achieve
          financial freedom.
        </p>
      </div>

      <CashFlowQuadrant />

      {/* Main Content - 2 Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Income Sources */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Income Sources
                </h3>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {incomeData.map(income => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{income.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(income.amount)} / {income.frequency}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Real Estate/Business Tab */}
              <div className="border-t pt-4">
                <div className="border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium">
                      Real Estate/Business
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Expenses */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Expenses
                </h3>
              </div>
              <Button size="sm" variant="destructive">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {expenseData.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{expense.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(expense.amount)} / {expense.frequency}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Additional expense categories */}
              <div className="text-sm text-gray-600 space-y-1 mt-4 pl-3 border-l-2 border-gray-200">
                <p>Car Loan Payment</p>
                <p>Credit Card Payment</p>
                <p>Retail Payment</p>
                <p>Other Expenses</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Financial Goals */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Financial Goals
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">
                    Increase Passive Income To Escape The Rat Race
                  </p>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(passiveIncomeGoal.current)} of{' '}
                    {formatCurrency(passiveIncomeGoal.target)}
                  </span>
                </div>
                <Progress
                  value={passiveIncomeGoal.progress}
                  className="h-2 mb-2"
                />
                <p className="text-xs text-blue-600">$0 of $2000</p>
                <p className="text-xs text-gray-500">Passive Income</p>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-600">CASH</p>
                  <p className="font-semibold">$520</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">TOTAL INCOME</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">TOTAL EXPENSES</p>
                  <p className="font-semibold text-red-600">
                    -{formatCurrency(totalExpenses)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">PAYDAY</p>
                  <p className="font-semibold">$1,120</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Assets & Liabilities */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Assets */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Assets</h3>
            <Button variant="ghost" size="sm" className="text-blue-600">
              Manage
            </Button>
          </div>

          {assets.map((asset, index) => (
            <div
              key={index}
              className="py-3 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{asset.category}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Cost/Share ▲</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                + Add {asset.category}
              </p>
            </div>
          ))}
        </Card>

        {/* Liabilities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Liabilities</h3>
            <Button variant="ghost" size="sm" className="text-blue-600">
              Manage
            </Button>
          </div>

          <div className="space-y-3">
            {liabilities.map((liability, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <span className="text-gray-900">{liability.name}</span>
                <span className="font-medium">
                  {formatCurrency(liability.amount)}
                </span>
              </div>
            ))}
            <div className="pt-2">
              <p className="text-sm text-gray-500">
                Click to add new liability
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Net Cash Flow */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Net Cash Flow
            </h3>
            <p className="text-sm text-gray-600">
              Assets income minus liability payments
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(netCashFlow)}
            </p>
            <p className="text-sm text-gray-600">per month</p>
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
          <strong>Liability:</strong> Takes money out of your pocket. The rich
          buy assets, the poor and middle class buy liabilities they think are
          assets.
        </p>
      </Card>
    </div>
  )
}
