'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Stepper, type Step } from '@/components/ui/stepper'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  children: React.ReactNode[]
  steps: Step[]
  initialStep?: number
}

export function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
  children,
  steps,
  initialStep = 0,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [isLoading, setIsLoading] = useState(false)

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const handleNext = useCallback(async () => {
    if (isLastStep) {
      setIsLoading(true)
      try {
        await onComplete()
      } finally {
        setIsLoading(false)
      }
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }, [isLastStep, onComplete, steps.length])

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  // Note: Step clicking disabled for now - could be enabled later
  // const handleStepClick = useCallback((stepIndex: number) => {
  //   if (stepIndex <= currentStep) {
  //     setCurrentStep(stepIndex)
  //   }
  // }, [currentStep])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Personance
          </DialogTitle>
          <p className="text-gray-600 text-center mt-2">
            Let&apos;s set up your financial profile to provide personalized
            recommendations
          </p>
        </DialogHeader>

        {/* Stepper */}
        <div className="px-6 pb-6">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            className="cursor-pointer"
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="min-h-[400px]">{children[currentStep]}</div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-6 bg-gray-50 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLastStep ? (
              isLoading ? (
                'Completing...'
              ) : (
                'Complete Setup'
              )
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export interface OnboardingStepProps {
  onNext?: () => void
  onPrevious?: () => void
  isValid?: boolean
  className?: string
  children: React.ReactNode
}

export function OnboardingStep({
  children,
  className,
  ...props
}: OnboardingStepProps) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {children}
    </div>
  )
}
