"use client"

import { Card } from "@/components/ui/card"
import { useFinancialSummary } from "@/hooks/use-financial-summary"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  CreditCard,
  PiggyBank
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  description?: string
}

function MetricCard({ title, value, change, changeType, icon, description }: MetricCardProps) {
  return (
    <Card className="p-6 transition-all hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={cn(
              "flex items-center space-x-1 text-sm",
              changeType === "positive" && "text-green-600",
              changeType === "negative" && "text-red-600",
              changeType === "neutral" && "text-gray-600"
            )}>
              {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
              {changeType === "negative" && <TrendingDown className="h-3 w-3" />}
              <span>{change}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg",
          changeType === "positive" && "bg-green-100 text-green-600",
          changeType === "negative" && "bg-red-100 text-red-600",
          (!changeType || changeType === "neutral") && "bg-blue-100 text-blue-600"
        )}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default function FinancialOverview() {
  const { summary, formattedSummary, isLoading } = useFinancialSummary()

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const netWorthChangeType = summary.monthlyChange > 0 ? "positive" : 
                            summary.monthlyChange < 0 ? "negative" : "neutral"
  
  const cashFlowChangeType = summary.cashFlow > 0 ? "positive" : 
                            summary.cashFlow < 0 ? "negative" : "neutral"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
        <p className="text-gray-600">Your complete financial picture at a glance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Net Worth"
          value={formattedSummary.netWorth}
          change={`${formattedSummary.monthlyChange} this month`}
          changeType={netWorthChangeType}
          icon={<TrendingUp className="h-6 w-6" />}
          description="Total assets minus liabilities"
        />

        <MetricCard
          title="Monthly Income"
          value={formattedSummary.totalIncome}
          icon={<DollarSign className="h-6 w-6" />}
          description="Total monthly income from all sources"
        />

        <MetricCard
          title="Monthly Expenses"
          value={formattedSummary.totalExpenses}
          icon={<CreditCard className="h-6 w-6" />}
          description="Total monthly recurring expenses"
        />

        <MetricCard
          title="Cash Flow"
          value={formattedSummary.cashFlow}
          changeType={cashFlowChangeType}
          icon={<Wallet className="h-6 w-6" />}
          description="Monthly income minus expenses"
        />

        <MetricCard
          title="Total Assets"
          value={formattedSummary.totalAssets}
          icon={<PiggyBank className="h-6 w-6" />}
          description="Combined value of all your assets"
        />

        <MetricCard
          title="Total Liabilities"
          value={formattedSummary.totalLiabilities}
          icon={<CreditCard className="h-6 w-6" />}
          description="Total amount owed across all debts"
        />
      </div>
    </div>
  )
}