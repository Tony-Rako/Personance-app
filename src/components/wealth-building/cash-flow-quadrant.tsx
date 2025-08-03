'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc'
import { useFinancialSummary } from '@/hooks/use-financial-summary'
import { useCurrencyFormat } from '@/hooks/use-currency-format'
import { TrendingUp, BookOpen, Users, Building, Briefcase } from 'lucide-react'

function CashFlowQuadrant() {
  const { formatAmount } = useCurrencyFormat()
  // Get real financial data
  const { summary: financialSummary } = useFinancialSummary()
  const { data: incomes } = trpc.income.getAll.useQuery()

  // Memoize total income calculation
  const totalIncome = React.useMemo(
    () => financialSummary.totalIncome,
    [financialSummary.totalIncome]
  )

  // Memoize income calculations to prevent unnecessary recalculations
  const { employeeIncome, selfEmployedIncome, businessIncome, investorIncome } =
    React.useMemo(() => {
      if (!incomes)
        return {
          employeeIncome: 0,
          selfEmployedIncome: 0,
          businessIncome: 0,
          investorIncome: 0,
        }

      return incomes.reduce(
        (acc, income) => {
          const source = income.source.toLowerCase()
          const amount = parseFloat(income.amount.toString())

          // Employee income: salary/wages (most incomes that aren't from assets)
          if (
            source.includes('salary') ||
            source.includes('wage') ||
            source.includes('job') ||
            source.includes('employment')
          ) {
            acc.employeeIncome += amount
          }
          // Self-employed income: freelance, consulting, etc.
          else if (
            source.includes('freelance') ||
            source.includes('consulting') ||
            source.includes('contract') ||
            (source.includes('business') && !source.includes('rental'))
          ) {
            acc.selfEmployedIncome += amount
          }
          // Business income: business profits, rental income from real estate business
          else if (
            source.includes('rental') ||
            source.includes('business profit') ||
            source.includes('real estate')
          ) {
            acc.businessIncome += amount
          }
          // Investor income: dividends, interest, capital gains
          else if (
            source.includes('dividend') ||
            source.includes('interest') ||
            source.includes('capital gains') ||
            source.includes('investment') ||
            source.includes('stocks') ||
            source.includes('bonds')
          ) {
            acc.investorIncome += amount
          }

          return acc
        },
        {
          employeeIncome: 0,
          selfEmployedIncome: 0,
          businessIncome: 0,
          investorIncome: 0,
        }
      )
    }, [incomes])

  // Memoize percentage calculations
  const {
    employeePercentage,
    selfEmployedPercentage,
    businessPercentage,
    investorPercentage,
    rightSidePercentage,
  } = React.useMemo(() => {
    const empPerc = totalIncome > 0 ? (employeeIncome / totalIncome) * 100 : 0
    const selfPerc =
      totalIncome > 0 ? (selfEmployedIncome / totalIncome) * 100 : 0
    const bizPerc = totalIncome > 0 ? (businessIncome / totalIncome) * 100 : 0
    const invPerc = totalIncome > 0 ? (investorIncome / totalIncome) * 100 : 0
    const rightSidePerc = bizPerc + invPerc

    return {
      employeePercentage: empPerc,
      selfEmployedPercentage: selfPerc,
      businessPercentage: bizPerc,
      investorPercentage: invPerc,
      rightSidePercentage: rightSidePerc,
    }
  }, [
    totalIncome,
    employeeIncome,
    selfEmployedIncome,
    businessIncome,
    investorIncome,
  ])

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Cash Flow Quadrant
      </h3>
      <p className="text-gray-600 mb-2">
        Track your income sources and progress towards financial freedom
      </p>

      {/* Progress Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Right Side Progress
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {rightSidePercentage.toFixed(1)}%
          </span>
        </div>
        <Progress value={rightSidePercentage} className="h-2 mb-2" />
        <p className="text-xs text-gray-600">
          {rightSidePercentage >= 50
            ? '🎉 Majority income from right side - approaching financial freedom!'
            : 'Keep building passive income to reach the right side'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Top Left - Employee */}
        <div
          className={`border-2 rounded-lg p-4 ${employeePercentage > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
        >
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
              <span className="font-medium">
                {formatAmount(employeeIncome)}
              </span>
            </div>
            <Progress value={employeePercentage} className="h-2" />
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Trade time for money</span>
              <span className="text-gray-600">
                {employeePercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Right - Business Owner */}
        <div
          className={`border-2 rounded-lg p-4 ${businessPercentage > 0 ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
        >
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
              <span className="font-medium">
                {formatAmount(businessIncome)}
              </span>
            </div>
            <Progress value={businessPercentage} className="h-2" />
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Business works without you</span>
              <span className="text-gray-600">
                {businessPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Left - Self-Employed */}
        <div
          className={`border-2 rounded-lg p-4 ${selfEmployedPercentage > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}
        >
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
              <span className="font-medium">
                {formatAmount(selfEmployedIncome)}
              </span>
            </div>
            <Progress value={selfEmployedPercentage} className="h-2" />
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">You ARE the business</span>
              <span className="text-gray-600">
                {selfEmployedPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Right - Investor */}
        <div
          className={`border-2 rounded-lg p-4 ${investorPercentage > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
        >
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
              <span className="font-medium">
                {formatAmount(investorIncome)}
              </span>
            </div>
            <Progress value={investorPercentage} className="h-2" />
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Assets generate income</span>
              <span className="text-gray-600">
                {investorPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Rich Dad Wisdom</h4>
            <p className="text-sm text-blue-800 mt-1">
              The goal is to move from the left side to the right side where you
              have more control and pay less taxes.
            </p>
            <p className="text-xs text-blue-600 mt-2">- Robert Kiyosaki</p>
            {rightSidePercentage < 25 && (
              <p className="text-xs text-orange-600 mt-1 font-medium">
                💡 Tip: Start building assets that generate passive income to
                move to the right side!
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(CashFlowQuadrant)
