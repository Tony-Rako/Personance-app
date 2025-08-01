'use client'

import { OnboardingStep } from '../onboarding-wizard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle,
  TrendingUp,
  Target,
  BookOpen,
  Sparkles,
} from 'lucide-react'

export function CompletionStep() {
  return (
    <OnboardingStep>
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Congratulations! Your Financial Profile is Complete
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You&apos;ve successfully set up your Personance account. We now have
            everything we need to provide personalized financial recommendations
            and help you achieve your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="border-2 border-green-100 bg-green-50">
            <CardHeader className="text-center pb-3">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-green-900">
                Default Goal Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800">
                We&apos;ve automatically created your primary goal: &quot;Escape
                the Rat Race&quot;. This will help guide your financial journey
                toward financial freedom.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 bg-blue-50">
            <CardHeader className="text-center pb-3">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-blue-900">
                Personalized Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">
                Your dashboard is now customized based on your profile, goals,
                and financial situation for maximum relevance.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 bg-purple-50">
            <CardHeader className="text-center pb-3">
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-purple-900">
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-800">
                Based on your risk tolerance and experience level, you&apos;ll
                receive tailored investment and savings strategies.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 bg-orange-50">
            <CardHeader className="text-center pb-3">
              <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-orange-900">
                Financial Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800">
                Access curated learning resources and tips to improve your
                financial literacy and make informed decisions.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-gray-900 mb-3">
            What Happens Next?
          </h3>
          <div className="text-left space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                Explore your personalized dashboard with real-time financial
                insights
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Track your progress toward escaping the rat race</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                Add more detailed financial data as you grow more comfortable
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                Receive personalized recommendations based on your profile
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 text-white rounded-lg p-4">
          <p className="font-medium">
            Ready to start your journey to financial freedom?
          </p>
          <p className="text-blue-100 text-sm mt-1">
            Click &quot;Complete Setup&quot; to access your personalized
            Personance dashboard.
          </p>
        </div>
      </div>
    </OnboardingStep>
  )
}
