"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercentage } from "@/lib/financial-utils"
import { Plus, Wallet, PiggyBank, Building2, TrendingUp } from "lucide-react"

interface CashAccountProps {
  name: string
  value: number
  growth: number
  lastUpdated: string
  icon: React.ReactNode
  type: "checking" | "savings" | "emergency"
}

function CashAccountCard({ name, value, growth, lastUpdated, icon, type }: CashAccountProps) {
  const getTypeColor = () => {
    switch (type) {
      case "emergency":
        return "bg-green-100 text-green-600"
      case "savings":
        return "bg-blue-100 text-blue-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getTypeColor()}`}>
            {icon}
          </div>
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
          <span className="text-xl font-bold text-gray-900">{formatCurrency(value)}</span>
          <div className="flex items-center space-x-1">
            {growth !== 0 && (
              <>
                <TrendingUp className={`h-3 w-3 ${growth > 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth > 0 ? '+' : ''}{formatPercentage(growth)}
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
  // Mock data based on the original app screenshots
  const accounts = [
    {
      name: "Emergency Fund",
      value: 15000,
      growth: 0.5,
      lastUpdated: "May 16, 2025",
      icon: <PiggyBank className="h-5 w-5" />,
      type: "emergency" as const
    },
    {
      name: "Checking Account", 
      value: 5000,
      growth: 0,
      lastUpdated: "May 16, 2025",
      icon: <Wallet className="h-5 w-5" />,
      type: "checking" as const
    },
    {
      name: "Savings Account",
      value: 10000,
      growth: 0.65,
      lastUpdated: "May 16, 2025", 
      icon: <Building2 className="h-5 w-5" />,
      type: "savings" as const
    }
  ]

  const totalCash = accounts.reduce((sum, account) => sum + account.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cash & Equivalents</h2>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Fund Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Amount</span>
              <span className="font-medium">{formatCurrency(15000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recommended (6 months)</span>
              <span className="font-medium">{formatCurrency(18000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Coverage</span>
              <span className="font-medium text-orange-600">5.0 months</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: "83%" }}></div>
            </div>
            <p className="text-sm text-gray-600">
              You're close to your emergency fund goal. Consider adding {formatCurrency(3000)} more.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Inflow</span>
              <span className="font-medium text-green-600">+{formatCurrency(3000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Outflow</span>
              <span className="font-medium text-red-600">-{formatCurrency(1880)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Net Cash Flow</span>
              <span className="font-medium text-green-600">+{formatCurrency(1120)}</span>
            </div>
            <p className="text-sm text-gray-600">
              Your positive cash flow allows for {formatCurrency(1120)} in additional savings or investments monthly.
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
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