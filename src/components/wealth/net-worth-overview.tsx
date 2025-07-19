'use client'

import { Card } from '@/components/ui/card'
import { trpc } from '@/lib/trpc'
import {
  formatCurrency,
  formatPercentage,
  calculateNetWorth,
} from '@/lib/financial-utils'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  Coins,
} from 'lucide-react'
import { format } from 'date-fns'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  color: string
}

function MetricCard({
  title,
  value,
  change,
  changeType,
  icon,
  color,
}: MetricCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div
              className={`flex items-center space-x-1 text-sm mt-1 ${
                changeType === 'positive'
                  ? 'text-green-600'
                  : changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
              {changeType === 'negative' && (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default function NetWorthOverview() {
  const { data: totalAssets, isLoading: assetsLoading } =
    trpc.asset.getTotalValue.useQuery()
  const { data: totalLiabilities, isLoading: liabilitiesLoading } =
    trpc.liability.getTotalBalance.useQuery()

  const isLoading = assetsLoading || liabilitiesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="grid md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const assets = totalAssets || 0
  const liabilities = totalLiabilities || 0
  const netWorth = calculateNetWorth(assets, liabilities)

  // Mock monthly change (in real app, this would be calculated from historical data)
  const monthlyChange = netWorth * 0.0256 // Assume 2.56% growth
  const monthlyChangePercent =
    netWorth > 0 ? (monthlyChange / netWorth) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Net Worth Overview</h2>
        <p className="text-gray-600">
          Updated as of {format(new Date(), 'MMM dd, yyyy')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Assets"
          value={formatCurrency(assets)}
          icon={<Building className="h-6 w-6 text-white" />}
          color="bg-green-100 text-green-600"
        />

        <MetricCard
          title="Total Liabilities"
          value={formatCurrency(liabilities)}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-red-100 text-red-600"
        />

        <MetricCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          change={formatCurrency(monthlyChange, { showSign: true })}
          changeType={monthlyChange >= 0 ? 'positive' : 'negative'}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-blue-100 text-blue-600"
        />

        <MetricCard
          title="Monthly Change"
          value={formatPercentage(monthlyChangePercent)}
          change={'$22,000'}
          changeType="positive"
          icon={<Coins className="h-6 w-6 text-white" />}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Yearly Performance
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              +18.64%
            </div>
            <div className="text-gray-600 mb-1">($22,000)</div>
            <div className="text-sm text-gray-500">
              Year-over-year change in net worth
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Independence
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">35%</div>
            <div className="text-gray-600 mb-1">
              Progress toward financial freedom goal of $400,000
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: '35%' }}
              ></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
