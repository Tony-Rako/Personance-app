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
import { Button } from '@/components/ui/button'
import { Plus, Trash2, DollarSign, CreditCard, PiggyBank } from 'lucide-react'
import type { AssetType } from '@prisma/client'

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

interface InitialDataStepProps {
  data: InitialDataStepData
  onChange: (data: InitialDataStepData) => void
}

const assetTypeOptions = [
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'INVESTMENTS', label: 'Investments' },
  { value: 'CASH_EQUIVALENTS', label: 'Cash & Savings' },
  { value: 'STOCKS_FUNDS_CDS', label: 'Stocks/Funds/CDs' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'PERSONAL_PROPERTY', label: 'Personal Property' },
] as const

const commonLiabilityTypes = [
  'Home Mortgage',
  'Car Loan',
  'Credit Card',
  'Student Loan',
  'Personal Loan',
  'Other',
]

const commonExpenseCategories = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Entertainment',
  'Other',
]

export function InitialDataStep({ data, onChange }: InitialDataStepProps) {
  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addAsset = () => {
    const newAsset: AssetData = {
      id: generateId(),
      name: '',
      type: '',
      value: '',
    }
    onChange({
      ...data,
      assets: [...data.assets, newAsset],
    })
  }

  const updateAsset = (
    id: string,
    field: keyof AssetData,
    value: string | number
  ) => {
    onChange({
      ...data,
      assets: data.assets.map(asset =>
        asset.id === id ? { ...asset, [field]: value } : asset
      ),
    })
  }

  const removeAsset = (id: string) => {
    onChange({
      ...data,
      assets: data.assets.filter(asset => asset.id !== id),
    })
  }

  const addLiability = () => {
    const newLiability: LiabilityData = {
      id: generateId(),
      name: '',
      type: '',
      balance: '',
      interestRate: '',
    }
    onChange({
      ...data,
      liabilities: [...data.liabilities, newLiability],
    })
  }

  const updateLiability = (
    id: string,
    field: keyof LiabilityData,
    value: string | number
  ) => {
    onChange({
      ...data,
      liabilities: data.liabilities.map(liability =>
        liability.id === id ? { ...liability, [field]: value } : liability
      ),
    })
  }

  const removeLiability = (id: string) => {
    onChange({
      ...data,
      liabilities: data.liabilities.filter(liability => liability.id !== id),
    })
  }

  const addExpense = () => {
    const newExpense: ExpenseData = {
      id: generateId(),
      category: '',
      amount: '',
    }
    onChange({
      ...data,
      monthlyExpenses: [...data.monthlyExpenses, newExpense],
    })
  }

  const updateExpense = (
    id: string,
    field: keyof ExpenseData,
    value: string | number
  ) => {
    onChange({
      ...data,
      monthlyExpenses: data.monthlyExpenses.map(expense =>
        expense.id === id ? { ...expense, [field]: value } : expense
      ),
    })
  }

  const removeExpense = (id: string) => {
    onChange({
      ...data,
      monthlyExpenses: data.monthlyExpenses.filter(
        expense => expense.id !== id
      ),
    })
  }

  return (
    <OnboardingStep>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Initial Financial Data
          </h2>
          <p className="text-gray-600">
            Add at least one entry in each category to get started. You can add
            more details later.
          </p>
        </div>

        {/* Assets Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PiggyBank className="h-5 w-5 text-green-600" />
                Assets
              </CardTitle>
              <Button onClick={addAsset} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Asset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.assets.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>
                  No assets added yet. Click &quot;Add Asset&quot; to get
                  started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.assets.map(asset => (
                  <div
                    key={asset.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label>Asset Name</Label>
                      <Input
                        placeholder="e.g., Primary Home"
                        value={asset.name}
                        onChange={e =>
                          updateAsset(asset.id, 'name', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={asset.type}
                        onValueChange={value =>
                          updateAsset(asset.id, 'type', value as AssetType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {assetTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Current Value</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={asset.value}
                        onChange={e =>
                          updateAsset(
                            asset.id,
                            'value',
                            e.target.value ? parseFloat(e.target.value) : ''
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeAsset(asset.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liabilities Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-red-600" />
                Liabilities
              </CardTitle>
              <Button onClick={addLiability} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Liability
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.liabilities.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>
                  No liabilities added yet. Click &quot;Add Liability&quot; to
                  get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.liabilities.map(liability => (
                  <div
                    key={liability.id}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="e.g., Chase Credit Card"
                        value={liability.name}
                        onChange={e =>
                          updateLiability(liability.id, 'name', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={liability.type}
                        onValueChange={value =>
                          updateLiability(liability.id, 'type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonLiabilityTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Balance</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={liability.balance}
                        onChange={e =>
                          updateLiability(
                            liability.id,
                            'balance',
                            e.target.value ? parseFloat(e.target.value) : ''
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interest Rate (%)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        step="0.01"
                        value={liability.interestRate}
                        onChange={e =>
                          updateLiability(
                            liability.id,
                            'interestRate',
                            e.target.value ? parseFloat(e.target.value) : ''
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeLiability(liability.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Expenses Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Monthly Expenses
              </CardTitle>
              <Button onClick={addExpense} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Add at least one expense category with estimated monthly amount
            </p>
          </CardHeader>
          <CardContent>
            {data.monthlyExpenses.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>
                  No expenses added yet. Click &quot;Add Expense&quot; to get
                  started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.monthlyExpenses.map(expense => (
                  <div
                    key={expense.id}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={expense.category}
                        onValueChange={value =>
                          updateExpense(expense.id, 'category', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonExpenseCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Amount</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={expense.amount}
                        onChange={e =>
                          updateExpense(
                            expense.id,
                            'amount',
                            e.target.value ? parseFloat(e.target.value) : ''
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeExpense(expense.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Getting Started
          </h3>
          <p className="text-yellow-800 text-sm">
            Don&apos;t worry about being perfect here. Add at least one item in
            each category to get started. You can always add more details and
            refine your data later in the dashboard.
          </p>
        </div>
      </div>
    </OnboardingStep>
  )
}
