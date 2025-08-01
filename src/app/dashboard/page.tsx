'use client'

import { useState, useEffect } from 'react'
import FinancialOverview from '@/components/dashboard/financial-overview'
import GoalManager from '@/components/dashboard/goal-manager'
import { GoalFormDialog } from '@/components/dashboard/goal-form'
import { OnboardingContainer } from '@/components/onboarding/onboarding-container'
import { trpc } from '@/lib/trpc'

export default function DashboardPage() {
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const { data: goals } = trpc.goal.getAll.useQuery()
  const { data: onboardingStatus, isLoading: onboardingLoading } =
    trpc.onboarding.getOnboardingStatus.useQuery()

  const hasGoals = goals && goals.length > 0

  // Check if user needs onboarding
  useEffect(() => {
    if (!onboardingLoading && onboardingStatus) {
      // If user needs authentication, don't show onboarding
      if (onboardingStatus.needsAuth) {
        return
      }
      // If user is authenticated but hasn't completed onboarding, show it
      if (!onboardingStatus.completed) {
        setShowOnboarding(true)
      }
    }
  }, [onboardingStatus, onboardingLoading])

  // Show loading state while checking onboarding status
  if (onboardingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If user needs authentication, show normal dashboard (they'll be redirected by auth)
  if (onboardingStatus?.needsAuth) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Personance
          </h1>
          <p className="text-gray-600 mt-2">
            Please sign in to access your personalized financial dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Your Path to Financial Freedom Starts Here
          </h1>
          <p className="text-gray-600 mt-2">
            Transform your financial future by building assets, creating passive
            income, and achieving true wealth.
          </p>
        </div>

        {/* Onboarding completion banner - Show if onboarding is complete but user just finished */}
        {onboardingStatus?.completed && !hasGoals && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Welcome to Personance!
                </h3>
                <div className="mt-1 text-sm text-green-700">
                  <p>
                    Your profile is complete. We&apos;ve created your
                    &quot;Escape the Rat Race&quot; goal to get you started.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goal Setting Call to Action - Only show if no goals exist */}
        {!hasGoals && onboardingStatus?.completed && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Ready to set additional financial goals?
            </p>
            <button
              onClick={() => setShowGoalDialog(true)}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Create Another Goal →
            </button>
          </div>
        )}

        {/* Goals Section - Show if goals exist */}
        {hasGoals && <GoalManager />}

        {/* Financial Overview - 6 Card Grid */}
        <FinancialOverview />

        {/* Goal Creation Dialog */}
        <GoalFormDialog
          open={showGoalDialog}
          onOpenChange={setShowGoalDialog}
        />
      </div>

      {/* Onboarding Flow */}
      <OnboardingContainer
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  )
}
