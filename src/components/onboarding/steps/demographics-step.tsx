'use client'

import { OnboardingStep } from '../onboarding-wizard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, Users, DollarSign } from 'lucide-react'
import type { IncomeRange } from '@prisma/client'

interface DemographicsData {
  age: number | ''
  occupation: string
  householdSize: number | ''
  numberOfDependents: number | ''
  annualIncomeRange: IncomeRange | ''
}

interface DemographicsStepProps {
  data: DemographicsData
  onChange: (data: DemographicsData) => void
}

const incomeRangeOptions = [
  { value: 'UNDER_25K', label: 'Under $25,000' },
  { value: 'RANGE_25K_50K', label: '$25,000 - $50,000' },
  { value: 'RANGE_50K_75K', label: '$50,000 - $75,000' },
  { value: 'RANGE_75K_100K', label: '$75,000 - $100,000' },
  { value: 'RANGE_100K_150K', label: '$100,000 - $150,000' },
  { value: 'RANGE_150K_250K', label: '$150,000 - $250,000' },
  { value: 'OVER_250K', label: 'Over $250,000' },
] as const

export function DemographicsStep({ data, onChange }: DemographicsStepProps) {
  const updateField = (
    field: keyof DemographicsData,
    value: string | number | IncomeRange
  ) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <OnboardingStep>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Tell Us About Yourself
          </h2>
          <p className="text-gray-600">
            This information helps us provide personalized financial
            recommendations tailored to your situation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={data.age}
                  onChange={e =>
                    updateField(
                      'age',
                      e.target.value ? parseInt(e.target.value) : ''
                    )
                  }
                  min="18"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  placeholder="e.g., Software Engineer, Teacher, etc."
                  value={data.occupation}
                  onChange={e => updateField('occupation', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-green-600" />
                Household Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="householdSize">Household Size</Label>
                <Input
                  id="householdSize"
                  type="number"
                  placeholder="Total people in household"
                  value={data.householdSize}
                  onChange={e =>
                    updateField(
                      'householdSize',
                      e.target.value ? parseInt(e.target.value) : ''
                    )
                  }
                  min="1"
                  max="20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependents">Number of Dependents</Label>
                <Input
                  id="dependents"
                  type="number"
                  placeholder="Children or other dependents"
                  value={data.numberOfDependents}
                  onChange={e =>
                    updateField(
                      'numberOfDependents',
                      e.target.value ? parseInt(e.target.value) : ''
                    )
                  }
                  min="0"
                  max="10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Annual Income Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="incomeRange">
                Select your annual household income range
              </Label>
              <Select
                value={data.annualIncomeRange}
                onValueChange={value =>
                  updateField('annualIncomeRange', value as IncomeRange)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose income range" />
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
          </CardContent>
        </Card>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Privacy Note:</strong> All personal information is encrypted
            and stored securely. We use this data only to provide personalized
            financial insights and recommendations. Your information is never
            shared with third parties.
          </p>
        </div>
      </div>
    </OnboardingStep>
  )
}
