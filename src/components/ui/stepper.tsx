'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, currentStep, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isUpcoming = index > currentStep

            return (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                      {
                        'border-green-500 bg-green-500 text-white': isCompleted,
                        'border-blue-500 bg-blue-500 text-white': isCurrent,
                        'border-gray-300 bg-white text-gray-500': isUpcoming,
                      }
                    )}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn('text-sm font-medium', {
                        'text-green-600': isCompleted,
                        'text-blue-600': isCurrent,
                        'text-gray-500': isUpcoming,
                      })}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-4 h-0.5 w-12 flex-1 transition-colors lg:w-20',
                      {
                        'bg-green-500': index < currentStep,
                        'bg-gray-300': index >= currentStep,
                      }
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
Stepper.displayName = 'Stepper'

export { Stepper, type Step }
