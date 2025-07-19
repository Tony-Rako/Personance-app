"use client"

import FinancialOverview from "@/components/dashboard/financial-overview"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Path to Financial Freedom Starts Here</h1>
        <p className="text-gray-600 mt-2">
          Transform your financial future by building assets, creating passive income, and achieving true wealth.
        </p>
      </div>

      {/* Goal Setting Call to Action */}
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Ready to set your financial goals?</p>
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          Create Your First Goal →
        </button>
      </div>

      {/* Financial Overview - 6 Card Grid */}
      <FinancialOverview />
    </div>
  )
}