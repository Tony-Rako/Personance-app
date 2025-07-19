"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/financial-utils"
import { 
  TrendingUp, 
  BookOpen, 
  Users, 
  Building, 
  Briefcase
} from "lucide-react"

export default function CashFlowQuadrant() {
  const employeeIncome = 3000
  const investorIncome = 150
  const totalIncome = employeeIncome + investorIncome
  
  const employeePercentage = totalIncome > 0 ? (employeeIncome / totalIncome) * 100 : 0
  const investorPercentage = totalIncome > 0 ? (investorIncome / totalIncome) * 100 : 0

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Cash Flow Quadrant</h3>
      <p className="text-gray-600 mb-6">
        Track your income sources and progress towards financial freedom
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Top Left - Employee */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Employee</h4>
              <p className="text-sm text-gray-600">Earned income from job</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Income</span>
              <span className="font-medium">{formatCurrency(employeeIncome)}</span>
            </div>
            <Progress value={employeePercentage} className="h-2" />
            <p className="text-xs text-gray-500">Trade time for money</p>
          </div>
        </div>

        {/* Top Right - Business Owner */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500 text-white">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Business Owner</h4>
              <p className="text-sm text-gray-600">Own systems and people</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Income</span>
              <span className="font-medium">{formatCurrency(0)}</span>
            </div>
            <Progress value={0} className="h-2" />
            <p className="text-xs text-gray-500">Business works without you</p>
          </div>
        </div>

        {/* Bottom Left - Self-Employed */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-lg bg-orange-500 text-white">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Self-Employed</h4>
              <p className="text-sm text-gray-600">Own job or practice</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Income</span>
              <span className="font-medium">{formatCurrency(0)}</span>
            </div>
            <Progress value={0} className="h-2" />
            <p className="text-xs text-gray-500">You ARE the business</p>
          </div>
        </div>

        {/* Bottom Right - Investor */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Investor</h4>
              <p className="text-sm text-gray-600">Money works for you</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Income</span>
              <span className="font-medium">{formatCurrency(investorIncome)}</span>
            </div>
            <Progress value={investorPercentage} className="h-2" />
            <p className="text-xs text-gray-500">Assets generate income</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Rich Dad Wisdom</h4>
            <p className="text-sm text-blue-800 mt-1">
              The goal is to move from the left side to the right side where you have more control and pay less taxes.
            </p>
            <p className="text-xs text-blue-600 mt-2">- Robert Kiyosaki</p>
          </div>
        </div>
      </div>
    </Card>
  )
}