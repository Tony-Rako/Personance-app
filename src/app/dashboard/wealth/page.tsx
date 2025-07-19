"use client"

import NetWorthOverview from "@/components/wealth/net-worth-overview"
import AssetAllocation from "@/components/wealth/asset-allocation"
import CashEquivalents from "@/components/wealth/cash-equivalents"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/financial-utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Target, Calendar, DollarSign } from "lucide-react"

function PerformanceMetrics() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Yearly Performance</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">+18.64%</div>
              <div className="text-xs text-gray-500">($22,000)</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Year-over-year change in net worth
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Independence</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Progress</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">35%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "35%" }}></div>
          </div>
          <div className="text-sm text-gray-600">
            Progress toward financial freedom goal of $400,000
          </div>
        </div>
      </Card>
    </div>
  )
}

function NetWorthChart() {
  // Mock historical data for net worth trend
  const data = [
    { month: "Jan", netWorth: 120000, assets: 290000, liabilities: 170000 },
    { month: "Feb", netWorth: 125000, assets: 295000, liabilities: 170000 },
    { month: "Mar", netWorth: 130000, assets: 300000, liabilities: 170000 },
    { month: "Apr", netWorth: 135000, assets: 315000, liabilities: 180000 },
    { month: "May", netWorth: 140000, assets: 325000, liabilities: 185000 },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Net Worth Trend</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            6M
          </Button>
          <Button variant="outline" size="sm">
            1Y
          </Button>
          <Button variant="outline" size="sm">
            All
          </Button>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), "Net Worth"]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="netWorth" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function WealthInsights() {
  const insights = [
    {
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      title: "Strong Growth Trajectory",
      description: "Your net worth has grown 18.64% this year, outpacing the average market return.",
      type: "positive"
    },
    {
      icon: <Target className="h-5 w-5 text-blue-600" />,
      title: "Investment Diversification",
      description: "Consider rebalancing your portfolio. Real estate makes up 77% of your assets.",
      type: "neutral"
    },
    {
      icon: <DollarSign className="h-5 w-5 text-orange-600" />,
      title: "Emergency Fund Goal",
      description: "You're $3,000 away from your 6-month emergency fund target.",
      type: "warning"
    }
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Wealth Insights</h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            insight.type === "positive" ? "bg-green-50 border-green-400" :
            insight.type === "warning" ? "bg-orange-50 border-orange-400" :
            "bg-blue-50 border-blue-400"
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {insight.icon}
              </div>
              <div>
                <h4 className={`font-medium ${
                  insight.type === "positive" ? "text-green-800" :
                  insight.type === "warning" ? "text-orange-800" :
                  "text-blue-800"
                }`}>
                  {insight.title}
                </h4>
                <p className={`text-sm mt-1 ${
                  insight.type === "positive" ? "text-green-700" :
                  insight.type === "warning" ? "text-orange-700" :
                  "text-blue-700"
                }`}>
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function WealthPage() {
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