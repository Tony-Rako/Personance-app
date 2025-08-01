'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercentage } from '@/lib/financial-utils'
import { Plus, Wallet, PiggyBank, Building2, TrendingUp } from 'lucide-react'
import { trpc } from '@/lib/trpc'

interface CashAccountProps {
  name: string
  value: number
  growth: number
  lastUpdated: string
  icon: React.ReactNode
  type: 'checking' | 'savings' | 'emergency'
}

function CashAccountCard({
  name,
  value,
  growth,
  lastUpdated,
  icon,
  type,
}: CashAccountProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'emergency':
        return 'bg-green-100 text-green-600'
      case 'savings':
        return 'bg-blue-100 text-blue-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getTypeColor()}`}>{icon}</div>
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-xs text-gray-500">{lastUpdated}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(value)}
          </span>
          <div className="flex items-center space-x-1">
            {growth !== 0 && (
              <>
                <TrendingUp
                  className={`h-3 w-3 ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}
                />
                <span
                  className={`text-sm font-medium ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {growth > 0 ? '+' : ''}
                  {formatPercentage(growth)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function CashEquivalents() {
  const { data: assets, isLoading } = trpc.asset.getAll.useQuery()
  const { data: expenses } = trpc.expense.getAll.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Get cash equivalent assets
  const cashAssets =
    assets?.filter(asset => asset.type === 'CASH_EQUIVALENTS') || []

  // Map assets to account format with intelligent categorization
  const accounts = cashAssets.map(asset => {
    let type: 'emergency' | 'checking' | 'savings' = 'savings'
    let icon = <Building2 className="h-5 w-5" />

    const nameLower = asset.name.toLowerCase()
    if (nameLower.includes('emergency') || nameLower.includes('e-fund')) {
      type = 'emergency'
      icon = <PiggyBank className="h-5 w-5" />
    } else if (
      nameLower.includes('checking') ||
      nameLower.includes('current')
    ) {
      type = 'checking'
      icon = <Wallet className="h-5 w-5" />
    }

    return {
      name: asset.name,
      value: Number(asset.value),
      growth: asset.growth ? Number(asset.growth) : 0,
      lastUpdated: asset.lastUpdated.toLocaleDateString(),
      icon,
      type,
    }
  })

  const totalCash = accounts.reduce((sum, account) => sum + account.value, 0)

  // Calculate monthly expenses for emergency fund analysis
  const monthlyExpenses =
    expenses?.reduce((sum, expense) => {
      const amount = Number(expense.amount)
      switch (expense.frequency) {
        case 'yearly':
          return sum + amount / 12
        case 'weekly':
          return sum + amount * 4.33
        case 'bi-weekly':
          return sum + amount * 2.17
        default:
          return sum + amount
      }
    }, 0) || 0

  // Emergency fund calculations
  const emergencyFund = accounts.find(acc => acc.type === 'emergency')
  const emergencyAmount = emergencyFund?.value || 0
  const recommendedAmount = monthlyExpenses * 6
  const emergencyMonths =
    monthlyExpenses > 0 ? emergencyAmount / monthlyExpenses : 0
  const emergencyProgress =
    recommendedAmount > 0 ? (emergencyAmount / recommendedAmount) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Cash & Equivalents
          </h2>
          <p className="text-gray-600">Total: {formatCurrency(totalCash)}</p>
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account, index) => (
          <CashAccountCard
            key={index}
            name={account.name}
            value={account.value}
            growth={account.growth}
            lastUpdated={account.lastUpdated}
            icon={account.icon}
            type={account.type}
          />
        ))}
      </div>

      {/* Cash Flow Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Emergency Fund Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Amount</span>
              <span className="font-medium">
                {formatCurrency(emergencyAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recommended (6 months)</span>
              <span className="font-medium">
                {formatCurrency(recommendedAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Coverage</span>
              <span
                className={`font-medium ${emergencyMonths >= 6 ? 'text-green-600' : emergencyMonths >= 3 ? 'text-orange-600' : 'text-red-600'}`}
              >
                {emergencyMonths.toFixed(1)} months
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${emergencyProgress >= 100 ? 'bg-green-500' : emergencyProgress >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(emergencyProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {emergencyProgress >= 100
                ? "Excellent! You've reached your emergency fund goal."
                : emergencyProgress >= 50
                  ? `You're on track. Consider adding ${formatCurrency(recommendedAmount - emergencyAmount)} more.`
                  : 'Focus on building your emergency fund to 3-6 months of expenses.'}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cash Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cash Assets</span>
              <span className="font-medium text-blue-600">
                {formatCurrency(totalCash)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Expenses</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(monthlyExpenses)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cash Accounts</span>
              <span className="font-medium text-gray-900">
                {accounts.length} accounts
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Liquidity Ratio</span>
              <span className="font-medium text-green-600">
                {monthlyExpenses > 0
                  ? (totalCash / monthlyExpenses).toFixed(1)
                  : '∞'}
                x
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {totalCash > monthlyExpenses * 3
                ? 'Strong liquidity position for unexpected expenses.'
                : 'Consider increasing cash reserves for better financial security.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Button variant="outline" className="justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Add Cash Account
          </Button>
          <Button variant="outline" className="justify-start">
            <TrendingUp className="h-4 w-4 mr-2" />
            Transfer to Investment
          </Button>
          <Button variant="outline" className="justify-start">
            <PiggyBank className="h-4 w-4 mr-2" />
            Boost Emergency Fund
          </Button>
        </div>
      </Card>
    </div>
  )
}
