'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'
import { Loader2, X } from 'lucide-react'
import type {
  IncomeRange,
  FinancialExperience,
  RiskTolerance,
  InvestmentTimeHorizon,
} from '@prisma/client'

const profileSchema = z.object({
  age: z.number().min(18).max(100).nullable().optional(),
  occupation: z.string().nullable().optional(),
  householdSize: z.number().min(1).max(20).nullable().optional(),
  numberOfDependents: z.number().min(0).max(10).nullable().optional(),
  annualIncomeRange: z
    .enum([
      'UNDER_25K',
      'RANGE_25K_50K',
      'RANGE_50K_75K',
      'RANGE_75K_100K',
      'RANGE_100K_150K',
      'RANGE_150K_250K',
      'OVER_250K',
    ])
    .nullable()
    .optional(),
  financialExperience: z
    .enum(['BEGINNER', 'SOME_EXPERIENCE', 'EXPERIENCED', 'VERY_EXPERIENCED'])
    .nullable()
    .optional(),
  riskTolerance: z
    .enum([
      'VERY_CONSERVATIVE',
      'CONSERVATIVE',
      'MODERATE',
      'AGGRESSIVE',
      'VERY_AGGRESSIVE',
    ])
    .nullable()
    .optional(),
  investmentTimeHorizon: z
    .enum(['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'])
    .nullable()
    .optional(),
  preferredCurrency: z.string().nullable().optional(),
  notificationsEnabled: z.boolean().nullable().optional(),
  primaryFinancialGoals: z.array(z.string()).optional(),
  financialConcerns: z.array(z.string()).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const incomeRangeOptions = [
  { value: 'UNDER_25K', label: 'Under $25,000' },
  { value: 'RANGE_25K_50K', label: '$25,000 - $50,000' },
  { value: 'RANGE_50K_75K', label: '$50,000 - $75,000' },
  { value: 'RANGE_75K_100K', label: '$75,000 - $100,000' },
  { value: 'RANGE_100K_150K', label: '$100,000 - $150,000' },
  { value: 'RANGE_150K_250K', label: '$150,000 - $250,000' },
  { value: 'OVER_250K', label: 'Over $250,000' },
]

const experienceOptions = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'SOME_EXPERIENCE', label: 'Some Experience' },
  { value: 'EXPERIENCED', label: 'Experienced' },
  { value: 'VERY_EXPERIENCED', label: 'Very Experienced' },
]

const riskToleranceOptions = [
  { value: 'VERY_CONSERVATIVE', label: 'Very Conservative' },
  { value: 'CONSERVATIVE', label: 'Conservative' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'AGGRESSIVE', label: 'Aggressive' },
  { value: 'VERY_AGGRESSIVE', label: 'Very Aggressive' },
]

const timeHorizonOptions = [
  { value: 'SHORT_TERM', label: 'Short Term (1-3 years)' },
  { value: 'MEDIUM_TERM', label: 'Medium Term (3-10 years)' },
  { value: 'LONG_TERM', label: 'Long Term (10+ years)' },
]

export function ProfileSettings() {
  const { toast } = useToast()
  const [goalInput, setGoalInput] = useState('')
  const [concernInput, setConcernInput] = useState('')

  // Get user profile data
  const { data: profile, isLoading } = trpc.onboarding.getUserProfile.useQuery()
  const utils = trpc.useUtils()

  // Update profile mutation
  const updateProfile = trpc.onboarding.saveUserProfile.useMutation({
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      })
      utils.onboarding.getUserProfile.invalidate()
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      })
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      preferredCurrency: 'USD',
      notificationsEnabled: true,
      primaryFinancialGoals: [],
      financialConcerns: [],
    },
  })

  // Load profile data into form when available
  useEffect(() => {
    if (profile) {
      setValue('age', profile.age)
      setValue('occupation', profile.occupation)
      setValue('householdSize', profile.householdSize)
      setValue('numberOfDependents', profile.numberOfDependents)
      setValue('annualIncomeRange', profile.annualIncomeRange)
      setValue('financialExperience', profile.financialExperience)
      setValue('riskTolerance', profile.riskTolerance)
      setValue('investmentTimeHorizon', profile.investmentTimeHorizon)
      setValue('preferredCurrency', profile.preferredCurrency || 'USD')
      setValue('notificationsEnabled', profile.notificationsEnabled ?? true)
      setValue('primaryFinancialGoals', profile.primaryFinancialGoals || [])
      setValue('financialConcerns', profile.financialConcerns || [])
    }
  }, [profile, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync({
      ...data,
      preferredCurrency: data.preferredCurrency || 'USD',
      notificationsEnabled: data.notificationsEnabled ?? true,
    })
  }

  const addGoal = () => {
    if (goalInput.trim()) {
      const currentGoals = watch('primaryFinancialGoals') || []
      const updatedGoals = [...currentGoals, goalInput.trim()]
      setValue('primaryFinancialGoals', updatedGoals, { shouldDirty: true })
      setGoalInput('')
    }
  }

  const removeGoal = (goalToRemove: string) => {
    const currentGoals = watch('primaryFinancialGoals') || []
    const updatedGoals = currentGoals.filter(goal => goal !== goalToRemove)
    setValue('primaryFinancialGoals', updatedGoals, { shouldDirty: true })
  }

  const addConcern = () => {
    if (concernInput.trim()) {
      const currentConcerns = watch('financialConcerns') || []
      const updatedConcerns = [...currentConcerns, concernInput.trim()]
      setValue('financialConcerns', updatedConcerns, { shouldDirty: true })
      setConcernInput('')
    }
  }

  const removeConcern = (concernToRemove: string) => {
    const currentConcerns = watch('financialConcerns') || []
    const updatedConcerns = currentConcerns.filter(
      concern => concern !== concernToRemove
    )
    setValue('financialConcerns', updatedConcerns, { shouldDirty: true })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              {...register('age', { valueAsNumber: true })}
              placeholder="Enter your age"
            />
            {errors.age && (
              <p className="text-sm text-red-600">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              {...register('occupation')}
              placeholder="e.g., Software Engineer"
            />
            {errors.occupation && (
              <p className="text-sm text-red-600">
                {errors.occupation.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="householdSize">Household Size</Label>
            <Input
              id="householdSize"
              type="number"
              {...register('householdSize', { valueAsNumber: true })}
              placeholder="Total people in household"
            />
            {errors.householdSize && (
              <p className="text-sm text-red-600">
                {errors.householdSize.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfDependents">Number of Dependents</Label>
            <Input
              id="numberOfDependents"
              type="number"
              {...register('numberOfDependents', { valueAsNumber: true })}
              placeholder="Children or other dependents"
            />
            {errors.numberOfDependents && (
              <p className="text-sm text-red-600">
                {errors.numberOfDependents.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Financial Profile */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Financial Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Annual Income Range</Label>
            <Select
              value={watch('annualIncomeRange') || ''}
              onValueChange={value =>
                setValue('annualIncomeRange', value as IncomeRange)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select income range" />
              </SelectTrigger>
              <SelectContent>
                {incomeRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Financial Experience</Label>
            <Select
              value={watch('financialExperience') || ''}
              onValueChange={value =>
                setValue('financialExperience', value as FinancialExperience)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Risk Tolerance</Label>
            <Select
              value={watch('riskTolerance') || ''}
              onValueChange={value =>
                setValue('riskTolerance', value as RiskTolerance)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk tolerance" />
              </SelectTrigger>
              <SelectContent>
                {riskToleranceOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Investment Time Horizon</Label>
            <Select
              value={watch('investmentTimeHorizon') || ''}
              onValueChange={value =>
                setValue(
                  'investmentTimeHorizon',
                  value as InvestmentTimeHorizon
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time horizon" />
              </SelectTrigger>
              <SelectContent>
                {timeHorizonOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Financial Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Primary Financial Goals</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              placeholder="Add a financial goal..."
              onKeyPress={e =>
                e.key === 'Enter' && (e.preventDefault(), addGoal())
              }
            />
            <Button
              type="button"
              onClick={addGoal}
              disabled={!goalInput.trim()}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {watch('primaryFinancialGoals')?.map(goal => (
              <Badge
                key={goal}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {goal}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() => removeGoal(goal)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Concerns */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Financial Concerns</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={concernInput}
              onChange={e => setConcernInput(e.target.value)}
              placeholder="Add a financial concern..."
              onKeyPress={e =>
                e.key === 'Enter' && (e.preventDefault(), addConcern())
              }
            />
            <Button
              type="button"
              onClick={addConcern}
              disabled={!concernInput.trim()}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {watch('financialConcerns')?.map(concern => (
              <Badge
                key={concern}
                variant="outline"
                className="flex items-center gap-1"
              >
                {concern}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() => removeConcern(concern)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          className="min-w-24"
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}
