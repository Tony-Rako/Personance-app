'use client'

import { useState } from 'react'
import NetWorthOverview from '@/components/wealth/net-worth-overview'
import AssetAllocation from '@/components/wealth/asset-allocation'
import CashEquivalents from '@/components/wealth/cash-equivalents'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/financial-utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Target, Calendar, DollarSign } from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { useAutoSnapshot } from '@/hooks/use-auto-snapshot'

function PerformanceMetrics() {
  const { data: performanceData } =
    trpc.networth.getPerformanceMetrics.useQuery()
  const { data: goals } = trpc.goal.getAll.useQuery()

  if (!performanceData) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Find financial independence goal or use default
  const fiGoal = goals?.find(
    goal =>
      goal.type === 'RETIREMENT' ||
      goal.name.toLowerCase().includes('financial') ||
      goal.name.toLowerCase().includes('freedom')
  )
  const fiTarget = fiGoal?.targetAmount ? Number(fiGoal.targetAmount) : 400000
  const fiProgress =
    fiTarget > 0
      ? Math.min((performanceData.currentNetWorth / fiTarget) * 100, 100)
      : 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Metrics
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp
                className={`h-4 w-4 ${performanceData.yearlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
              />
              <span className="text-sm text-gray-600">Yearly Performance</span>
            </div>
            <div className="text-right">
              <div
                className={`text-lg font-bold ${performanceData.yearlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {performanceData.yearlyGrowth >= 0 ? '+' : ''}
                {performanceData.yearlyGrowth.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">
                ({formatCurrency(performanceData.yearlyGrowthAmount)})
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {performanceData.snapshotCount > 0
              ? 'Year-over-year change in net worth'
              : 'Start tracking to see performance metrics'}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Financial Independence
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Progress</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {fiProgress.toFixed(0)}%
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${fiProgress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            Progress toward financial freedom goal of {formatCurrency(fiTarget)}
          </div>
        </div>
      </Card>
    </div>
  )
}

function NetWorthChart() {
  const [period, setPeriod] = useState<'6M' | '1Y' | 'ALL'>('6M')
  const { data: historyData, isLoading } =
    trpc.networth.getNetWorthHistory.useQuery({ period })

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  // Format data for chart
  const data =
    historyData?.map(
      (item: {
        date: Date
        netWorth: number
        totalAssets: number
        totalLiabilities: number
      }) => ({
        month: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
        }),
        date: item.date,
        netWorth: item.netWorth,
        assets: item.totalAssets,
        liabilities: item.totalLiabilities,
      })
    ) || []

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Net Worth Trend</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant={period === '6M' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('6M')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            6M
          </Button>
          <Button
            variant={period === '1Y' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('1Y')}
          >
            1Y
          </Button>
          <Button
            variant={period === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('ALL')}
          >
            All
          </Button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={value => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [
                formatCurrency(value),
                'Net Worth',
              ]}
              labelFormatter={label => `Month: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function WealthInsights() {
  const { data: insights, isLoading } =
    trpc.networth.getWealthInsights.useQuery()

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  const formattedInsights =
    insights?.map(insight => ({
      icon:
        insight.type === 'positive' ? (
          <TrendingUp className="h-5 w-5 text-green-600" />
        ) : insight.type === 'warning' ? (
          <DollarSign className="h-5 w-5 text-orange-600" />
        ) : (
          <Target className="h-5 w-5 text-blue-600" />
        ),
      title: insight.title,
      description: insight.description,
      type: insight.type,
    })) || []

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Wealth Insights
      </h3>
      <div className="space-y-4">
        {formattedInsights.length > 0 ? (
          formattedInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'positive'
                  ? 'bg-green-50 border-green-400'
                  : insight.type === 'warning'
                    ? 'bg-orange-50 border-orange-400'
                    : 'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">{insight.icon}</div>
                <div>
                  <h4
                    className={`font-medium ${
                      insight.type === 'positive'
                        ? 'text-green-800'
                        : insight.type === 'warning'
                          ? 'text-orange-800'
                          : 'text-blue-800'
                    }`}
                  >
                    {insight.title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      insight.type === 'positive'
                        ? 'text-green-700'
                        : insight.type === 'warning'
                          ? 'text-orange-700'
                          : 'text-blue-700'
                    }`}
                  >
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No insights available yet</div>
            <div className="text-sm text-gray-400">
              Add some assets and liabilities to get personalized wealth
              insights
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function WealthPage() {
  // Automatically create snapshots when user visits the page
  useAutoSnapshot()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Personance Wealth</h1>
        <p className="text-gray-600 mt-2">
          Track your assets, monitor your net worth, and build long-term wealth.
        </p>
      </div>

      {/* Net Worth Overview */}
      <NetWorthOverview />

      {/* Performance Metrics */}
      <PerformanceMetrics />

      {/* Net Worth Chart */}
      <NetWorthChart />

      {/* Asset Management */}
      <AssetAllocation />

      {/* Cash & Equivalents */}
      <CashEquivalents />

      {/* Insights */}
      <WealthInsights />
    </div>
  )
}
