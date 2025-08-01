'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { OnboardingWizard } from './onboarding-wizard'
import { WelcomeStep } from './steps/welcome-step'
import { DemographicsStep } from './steps/demographics-step'
import { FinancialAssessmentStep } from './steps/financial-assessment-step'
import { InitialDataStep } from './steps/initial-data-step'
import { CompletionStep } from './steps/completion-step'
import { useToast } from '@/hooks/use-toast'
import type {
  IncomeRange,
  FinancialExperience,
  RiskTolerance,
  InvestmentTimeHorizon,
  AssetType,
} from '@prisma/client'

interface DemographicsData {
  age: number | ''
  occupation: string
  householdSize: number | ''
  numberOfDependents: number | ''
  annualIncomeRange: IncomeRange | ''
}

interface FinancialAssessmentData {
  financialExperience: FinancialExperience | ''
  riskTolerance: RiskTolerance | ''
  investmentTimeHorizon: InvestmentTimeHorizon | ''
  primaryFinancialGoals: string[]
}

interface AssetData {
  id: string
  name: string
  type: AssetType | ''
  value: number | ''
}

interface LiabilityData {
  id: string
  name: string
  type: string
  balance: number | ''
  interestRate: number | ''
}

interface ExpenseData {
  id: string
  category: string
  amount: number | ''
}

interface InitialDataStepData {
  assets: AssetData[]
  liabilities: LiabilityData[]
  monthlyExpenses: ExpenseData[]
}

interface OnboardingContainerProps {
  isOpen: boolean
  onClose: () => void
}

const steps = [
  { title: 'Welcome', description: 'Getting started' },
  { title: 'About You', description: 'Personal details' },
  { title: 'Financial Profile', description: 'Experience & goals' },
  { title: 'Initial Setup', description: 'Assets & expenses' },
  { title: 'Complete', description: "You're all set!" },
]

export function OnboardingContainer({
  isOpen,
  onClose,
}: OnboardingContainerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [demographicsData, setDemographicsData] = useState<DemographicsData>({
    age: '',
    occupation: '',
    householdSize: '',
    numberOfDependents: '',
    annualIncomeRange: '',
  })

  const [financialAssessmentData, setFinancialAssessmentData] =
    useState<FinancialAssessmentData>({
      financialExperience: '',
      riskTolerance: '',
      investmentTimeHorizon: '',
      primaryFinancialGoals: ['Escape the rat race'], // Default goal pre-selected
    })

  const [initialData, setInitialData] = useState<InitialDataStepData>({
    assets: [],
    liabilities: [],
    monthlyExpenses: [],
  })

  const completeOnboardingMutation =
    trpc.onboarding.completeOnboarding.useMutation({
      onSuccess: () => {
        toast({
          title: 'Welcome to Personance!',
          description: 'Your profile has been created successfully.',
        })
        utils.onboarding.getOnboardingStatus.invalidate()
        onClose()
        router.push('/dashboard')
      },
      onError: error => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to complete onboarding',
          variant: 'destructive',
        })
      },
    })

  const handleComplete = async () => {
    // Validate required fields
    if (!demographicsData.age || !demographicsData.occupation) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your age and occupation.',
        variant: 'destructive',
      })
      return
    }

    if (
      !financialAssessmentData.financialExperience ||
      !financialAssessmentData.riskTolerance
    ) {
      toast({
        title: 'Missing Information',
        description: 'Please complete your financial assessment.',
        variant: 'destructive',
      })
      return
    }

    // Prepare data for submission
    const profileData = {
      age:
        typeof demographicsData.age === 'number'
          ? demographicsData.age
          : undefined,
      occupation: demographicsData.occupation || undefined,
      householdSize:
        typeof demographicsData.householdSize === 'number'
          ? demographicsData.householdSize
          : undefined,
      numberOfDependents:
        typeof demographicsData.numberOfDependents === 'number'
          ? demographicsData.numberOfDependents
          : undefined,
      annualIncomeRange: demographicsData.annualIncomeRange || undefined,
      financialExperience:
        financialAssessmentData.financialExperience || undefined,
      riskTolerance: financialAssessmentData.riskTolerance || undefined,
      investmentTimeHorizon:
        financialAssessmentData.investmentTimeHorizon || undefined,
      primaryFinancialGoals: financialAssessmentData.primaryFinancialGoals,
    }

    // Filter and format assets
    const validAssets = initialData.assets
      .filter(
        asset => asset.name && asset.type && typeof asset.value === 'number'
      )
      .map(asset => ({
        name: asset.name,
        type: asset.type as AssetType,
        value: asset.value as number,
      }))

    // Filter and format liabilities
    const validLiabilities = initialData.liabilities
      .filter(
        liability =>
          liability.name &&
          liability.type &&
          typeof liability.balance === 'number'
      )
      .map(liability => ({
        name: liability.name,
        type: liability.type,
        balance: liability.balance as number,
        interestRate:
          typeof liability.interestRate === 'number'
            ? liability.interestRate
            : undefined,
      }))

    // Filter and format expenses
    const validExpenses = initialData.monthlyExpenses
      .filter(expense => expense.category && typeof expense.amount === 'number')
      .map(expense => ({
        category: expense.category,
        amount: expense.amount as number,
      }))

    await completeOnboardingMutation.mutateAsync({
      profile: profileData,
      assets: validAssets.length > 0 ? validAssets : undefined,
      liabilities: validLiabilities.length > 0 ? validLiabilities : undefined,
      monthlyExpenses: validExpenses.length > 0 ? validExpenses : undefined,
    })
  }

  return (
    <OnboardingWizard
      isOpen={isOpen}
      onClose={onClose}
      onComplete={handleComplete}
      steps={steps}
    >
      <WelcomeStep />
      <DemographicsStep
        data={demographicsData}
        onChange={setDemographicsData}
      />
      <FinancialAssessmentStep
        data={financialAssessmentData}
        onChange={setFinancialAssessmentData}
      />
      <InitialDataStep data={initialData} onChange={setInitialData} />
      <CompletionStep />
    </OnboardingWizard>
  )
}
