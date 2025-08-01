'use client'

import { OnboardingStep } from '../onboarding-wizard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, TrendingUp, Shield, BookOpen } from 'lucide-react'

export function WelcomeStep() {
  return (
    <OnboardingStep>
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Take Control of Your Financial Future
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Personance helps you build wealth, escape the rat race, and achieve
            financial freedom through personalized insights and actionable
            strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
            <CardHeader className="text-center pb-3">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Set Clear Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Define your financial objectives with our default goal: escape
                the rat race and build lasting wealth.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
            <CardHeader className="text-center pb-3">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Monitor your assets, liabilities, and net worth growth with
                comprehensive financial tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
            <CardHeader className="text-center pb-3">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Personalized Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Get tailored recommendations based on your risk tolerance,
                experience level, and financial situation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 hover:border-orange-200 transition-colors">
            <CardHeader className="text-center pb-3">
              <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Financial Education</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Learn key concepts and strategies to improve your financial
                literacy and make informed decisions.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-2">What to Expect</h3>
          <p className="text-blue-800 text-sm">
            This setup will take about 5-10 minutes. We will ask about your
            demographics, financial situation, goals, and collect basic
            information about your assets and liabilities. All information is
            secure and used only to provide personalized recommendations.
          </p>
        </div>
      </div>
    </OnboardingStep>
  )
}
