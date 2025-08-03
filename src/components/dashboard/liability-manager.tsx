'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { trpc } from '@/lib/trpc'
import { useCurrencyFormat } from '@/hooks/use-currency-format'
import { Plus, Trash2, Edit, CreditCard, AlertTriangle } from 'lucide-react'
import type { Liability } from '@prisma/client'
import type { LiabilityFormData } from '@/types/financial'

interface LiabilityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  liability?: Liability | null
}

function LiabilityFormDialog({
  open,
  onOpenChange,
  liability,
}: LiabilityFormDialogProps) {
  const [formData, setFormData] = useState<LiabilityFormData>(() => {
    const initialData: LiabilityFormData = {
      name: liability?.name || '',
      type: liability?.type || '',
      balance: liability ? parseFloat(liability.balance.toString()) : 0,
    }

    if (liability?.interestRate) {
      initialData.interestRate = parseFloat(liability.interestRate.toString())
    }

    if (liability?.minimumPayment) {
      initialData.minimumPayment = parseFloat(
        liability.minimumPayment.toString()
      )
    }

    if (liability?.dueDate) {
      initialData.dueDate = liability.dueDate
    }

    return initialData
  })

  const utils = trpc.useUtils()

  const createLiability = trpc.liability.create.useMutation({
    onSuccess: () => {
      utils.liability.getAll.invalidate()
      utils.liability.getTotalBalance.invalidate()
      onOpenChange(false)
      setFormData({
        name: '',
        type: '',
        balance: 0,
      })
    },
  })

  const updateLiability = trpc.liability.update.useMutation({
    onSuccess: () => {
      utils.liability.getAll.invalidate()
      utils.liability.getTotalBalance.invalidate()
      onOpenChange(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (liability) {
      updateLiability.mutate({
        id: liability.id,
        ...formData,
      })
    } else {
      createLiability.mutate(formData)
    }
  }

  const isLoading = createLiability.isPending || updateLiability.isPending

  const liabilityTypes = [
    'Mortgage',
    'Car Loan',
    'Credit Card',
    'Student Loan',
    'Personal Loan',
    'Business Loan',
    'Line of Credit',
    'Other Debt',
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {liability ? 'Edit Liability' : 'Add Liability'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Liability Name
            </label>
            <Input
              placeholder="e.g., Home Mortgage, Car Loan, Credit Card"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Liability Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.type}
              onChange={e =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                })
              }
              required
            >
              <option value="">Select type...</option>
              {liabilityTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Current Balance
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.balance || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  balance: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Interest Rate % (Optional)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.interestRate || ''}
              onChange={e => {
                const newFormData = { ...formData }
                if (e.target.value) {
                  newFormData.interestRate = parseFloat(e.target.value)
                } else {
                  delete newFormData.interestRate
                }
                setFormData(newFormData)
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Annual interest rate percentage
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Minimum Payment (Optional)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.minimumPayment || ''}
              onChange={e => {
                const newFormData = { ...formData }
                if (e.target.value) {
                  newFormData.minimumPayment = parseFloat(e.target.value)
                } else {
                  delete newFormData.minimumPayment
                }
                setFormData(newFormData)
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Monthly minimum payment amount
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Due Date (Optional)
            </label>
            <Input
              type="date"
              value={
                formData.dueDate
                  ? formData.dueDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={e => {
                const newFormData = { ...formData }
                if (e.target.value) {
                  newFormData.dueDate = new Date(e.target.value)
                } else {
                  delete newFormData.dueDate
                }
                setFormData(newFormData)
              }}
            />
            <p className="text-xs text-gray-500 mt-1">Next payment due date</p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? liability
                  ? 'Updating...'
                  : 'Adding...'
                : liability
                  ? 'Update Liability'
                  : 'Add Liability'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function LiabilityManager() {
  const { formatAmount } = useCurrencyFormat()
  const [showLiabilityDialog, setShowLiabilityDialog] = useState(false)
  const [editingLiability, setEditingLiability] = useState<Liability | null>(
    null
  )

  const { data: liabilities, isLoading } = trpc.liability.getAll.useQuery()
  const { data: totalBalance } = trpc.liability.getTotalBalance.useQuery()

  const utils = trpc.useUtils()
  const deleteLiability = trpc.liability.delete.useMutation({
    onSuccess: () => {
      utils.liability.getAll.invalidate()
      utils.liability.getTotalBalance.invalidate()
    },
  })

  const handleEditLiability = (liability: Liability) => {
    setEditingLiability(liability)
    setShowLiabilityDialog(true)
  }

  const handleCloseLiabilityDialog = () => {
    setShowLiabilityDialog(false)
    setEditingLiability(null)
  }

  const getLiabilityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Mortgage: 'bg-blue-50 border-blue-200',
      'Car Loan': 'bg-orange-50 border-orange-200',
      'Credit Card': 'bg-red-50 border-red-200',
      'Student Loan': 'bg-purple-50 border-purple-200',
      'Personal Loan': 'bg-yellow-50 border-yellow-200',
      'Business Loan': 'bg-green-50 border-green-200',
      'Line of Credit': 'bg-pink-50 border-pink-200',
    }
    return colors[type] || 'bg-gray-50 border-gray-200'
  }

  const getLiabilityTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      Mortgage: '🏠',
      'Car Loan': '🚗',
      'Credit Card': '💳',
      'Student Loan': '🎓',
      'Personal Loan': '💰',
      'Business Loan': '🏢',
      'Line of Credit': '📊',
    }
    return icons[type] || '💸'
  }

  const calculateMonthlyInterest = (balance: number, interestRate: number) => {
    return (balance * (interestRate / 100)) / 12
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Liabilities</h3>
            {totalBalance && (
              <p className="text-sm text-gray-600">
                Total Balance: {formatAmount(totalBalance)}
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setShowLiabilityDialog(true)}
          variant="destructive"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Liability
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-20 rounded-lg"
              ></div>
            ))}
          </div>
        ) : liabilities && liabilities.length > 0 ? (
          liabilities.map(liability => {
            const balance = parseFloat(liability.balance.toString())
            const interestRate = liability.interestRate
              ? parseFloat(liability.interestRate.toString())
              : null
            const minimumPayment = liability.minimumPayment
              ? parseFloat(liability.minimumPayment.toString())
              : null
            const monthlyInterest = interestRate
              ? calculateMonthlyInterest(balance, interestRate)
              : null

            return (
              <div
                key={liability.id}
                className={`p-4 rounded-lg border-2 ${getLiabilityTypeColor(liability.type)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">
                        {getLiabilityTypeIcon(liability.type)}
                      </span>
                      <h4 className="font-medium text-gray-900">
                        {liability.name}
                      </h4>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {liability.type}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-red-600 mb-1">
                      {formatAmount(balance)}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      {interestRate && (
                        <div>
                          <span className="text-xs text-gray-500">
                            Interest Rate:
                          </span>
                          <p className="font-medium">{interestRate}% APR</p>
                        </div>
                      )}
                      {minimumPayment && (
                        <div>
                          <span className="text-xs text-gray-500">
                            Min Payment:
                          </span>
                          <p className="font-medium">
                            {formatAmount(minimumPayment)}
                          </p>
                        </div>
                      )}
                      {monthlyInterest && (
                        <div>
                          <span className="text-xs text-gray-500">
                            Monthly Interest:
                          </span>
                          <p className="font-medium text-red-600">
                            {formatAmount(monthlyInterest)}
                          </p>
                        </div>
                      )}
                      {liability.dueDate && (
                        <div>
                          <span className="text-xs text-gray-500">
                            Next Due:
                          </span>
                          <p className="font-medium">
                            {liability.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLiability(liability)}
                      title="Edit Liability"
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        deleteLiability.mutate({ id: liability.id })
                      }
                      disabled={deleteLiability.isPending}
                      title="Delete Liability"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {interestRate && interestRate > 10 && (
                  <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      High interest rate - consider prioritizing this debt
                    </span>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No liabilities yet</h4>
            <p className="text-sm mb-4">
              Track your debts and liabilities to manage cash flow
            </p>
            <Button
              onClick={() => setShowLiabilityDialog(true)}
              variant="destructive"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Liability
            </Button>
          </div>
        )}
      </div>

      <LiabilityFormDialog
        open={showLiabilityDialog}
        onOpenChange={handleCloseLiabilityDialog}
        liability={editingLiability}
      />
    </Card>
  )
}
