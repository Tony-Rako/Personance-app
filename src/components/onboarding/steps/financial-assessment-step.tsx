'use client'

import { OnboardingStep } from '../onboarding-wizard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TrendingUp, Shield, Clock, BookOpen } from 'lucide-react'
import type {
  FinancialExperience,
  RiskTolerance,
  InvestmentTimeHorizon,
} from '@prisma/client'

interface FinancialAssessmentData {
  financialExperience: FinancialExperience | ''
  riskTolerance: RiskTolerance | ''
  investmentTimeHorizon: InvestmentTimeHorizon | ''
  primaryFinancialGoals: string[]
}

interface FinancialAssessmentStepProps {
  data: FinancialAssessmentData
  onChange: (data: FinancialAssessmentData) => void
}

const experienceOptions = [
  {
    value: 'BEGINNER',
    label: 'Beginner',
    description: 'New to investing and financial planning',
  },
  {
    value: 'SOME_EXPERIENCE',
    label: 'Some Experience',
    description: 'Basic understanding of investments',
  },
  {
    value: 'EXPERIENCED',
    label: 'Experienced',
    description: 'Comfortable with various investment types',
  },
  {
    value: 'VERY_EXPERIENCED',
    label: 'Very Experienced',
    description: 'Advanced knowledge and active investor',
  },
] as const

const riskToleranceOptions = [
  {
    value: 'VERY_CONSERVATIVE',
    label: 'Very Conservative',
    description: 'Minimal risk, capital preservation focused',
  },
  {
    value: 'CONSERVATIVE',
    label: 'Conservative',
    description: 'Low risk, steady growth preferred',
  },
  {
    value: 'MODERATE',
    label: 'Moderate',
    description: 'Balanced approach to risk and return',
  },
  {
    value: 'AGGRESSIVE',
    label: 'Aggressive',
    description: 'Higher risk for potential higher returns',
  },
  {
    value: 'VERY_AGGRESSIVE',
    label: 'Very Aggressive',
    description: 'Maximum risk tolerance for growth',
  },
] as const

const timeHorizonOptions = [
  {
    value: 'SHORT_TERM',
    label: 'Short Term (1-3 years)',
    description: 'Need access to funds soon',
  },
  {
    value: 'MEDIUM_TERM',
    label: 'Medium Term (3-10 years)',
    description: 'Building for mid-term goals',
  },
  {
    value: 'LONG_TERM',
    label: 'Long Term (10+ years)',
    description: 'Long-term wealth building focus',
  },
] as const

const goalOptions = [
  'Escape the rat race',
  'Build emergency fund',
  'Pay off debt',
  'Save for retirement',
  'Buy a home',
  'Start a business',
  "Children's education",
  'Travel and experiences',
  'Generate passive income',
  'Build generational wealth',
]

export function FinancialAssessmentStep({
  data,
  onChange,
}: FinancialAssessmentStepProps) {
  const updateField = (
    field: keyof FinancialAssessmentData,
    value: string | string[]
  ) => {
    onChange({ ...data, [field]: value })
  }

  const toggleGoal = (goal: string) => {
    const currentGoals = data.primaryFinancialGoals || []
    const isSelected = currentGoals.includes(goal)

    if (isSelected) {
      updateField(
        'primaryFinancialGoals',
        currentGoals.filter(g => g !== goal)
      )
    } else {
      updateField('primaryFinancialGoals', [...currentGoals, goal])
    }
  }

  return (
    <OnboardingStep>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Financial Assessment
          </h2>
          <p className="text-gray-600">
            Help us understand your financial experience and preferences to
            provide tailored recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Financial Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={data.financialExperience}
                onValueChange={value =>
                  updateField(
                    'financialExperience',
                    value as FinancialExperience
                  )
                }
                className="space-y-3"
              >
                {experienceOptions.map(option => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-2"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`exp-${option.value}`}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`exp-${option.value}`}
                        className="font-medium"
                      >
                        {option.label}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-600" />
                Risk Tolerance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={data.riskTolerance}
                onValueChange={value =>
                  updateField('riskTolerance', value as RiskTolerance)
                }
                className="space-y-3"
              >
                {riskToleranceOptions.map(option => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-2"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`risk-${option.value}`}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`risk-${option.value}`}
                        className="font-medium"
                      >
                        {option.label}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              Investment Time Horizon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.investmentTimeHorizon}
              onValueChange={value =>
                updateField(
                  'investmentTimeHorizon',
                  value as InvestmentTimeHorizon
                )
              }
              className="space-y-3"
            >
              {timeHorizonOptions.map(option => (
                <div key={option.value} className="flex items-start space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`time-${option.value}`}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`time-${option.value}`}
                      className="font-medium"
                    >
                      {option.label}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Primary Financial Goals
            </CardTitle>
            <p className="text-sm text-gray-600">
              Select all that apply (we recommend starting with &quot;Escape the
              rat race&quot;)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalOptions.map(goal => {
                const isSelected =
                  data.primaryFinancialGoals?.includes(goal) || false
                const isEscapeRatRace = goal === 'Escape the rat race'

                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? isEscapeRatRace
                          ? 'border-orange-500 bg-orange-50 text-orange-900'
                          : 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal}</span>
                      {isEscapeRatRace && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Why This Matters</h3>
          <p className="text-blue-800 text-sm">
            Your financial profile helps us customize investment
            recommendations, risk management strategies, and goal-setting
            approaches. This ensures you receive advice that matches your
            comfort level and timeline.
          </p>
        </div>
      </div>
    </OnboardingStep>
  )
}
