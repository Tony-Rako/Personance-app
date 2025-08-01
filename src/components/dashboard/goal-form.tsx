'use client'

import { useState } from 'react'
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
import { GoalType } from '@prisma/client'
import type { GoalFormData } from '@/types/financial'

interface GoalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?:
    | {
        id: string
        name: string
        type: GoalType
        targetAmount: number
        targetDate?: Date
        description?: string
      }
    | undefined
}

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
}: GoalFormDialogProps) {
  const [formData, setFormData] = useState<GoalFormData>(() => {
    const initialData: GoalFormData = {
      name: goal?.name || '',
      type: goal?.type || GoalType.SAVINGS,
      targetAmount: goal?.targetAmount || 0,
    }

    if (goal?.targetDate) {
      initialData.targetDate = goal.targetDate
    }

    if (goal?.description) {
      initialData.description = goal.description
    }

    return initialData
  })

  const utils = trpc.useUtils()

  const createGoal = trpc.goal.create.useMutation({
    onSuccess: () => {
      utils.goal.getAll.invalidate()
      utils.goal.getActive.invalidate()
      utils.goal.getProgress.invalidate()
      utils.goal.getTotalProgress.invalidate()
      onOpenChange(false)
      setFormData({
        name: '',
        type: GoalType.SAVINGS,
        targetAmount: 0,
      })
    },
  })

  const updateGoal = trpc.goal.update.useMutation({
    onSuccess: () => {
      utils.goal.getAll.invalidate()
      utils.goal.getActive.invalidate()
      utils.goal.getProgress.invalidate()
      utils.goal.getTotalProgress.invalidate()
      onOpenChange(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (goal) {
      updateGoal.mutate({
        id: goal.id,
        ...formData,
      })
    } else {
      createGoal.mutate(formData)
    }
  }

  const isLoading = createGoal.isPending || updateGoal.isPending

  const goalTypeLabels: Record<GoalType, string> = {
    SAVINGS: 'General Savings',
    DEBT_PAYOFF: 'Debt Payoff',
    INVESTMENT: 'Investment',
    RETIREMENT: 'Retirement',
    EMERGENCY_FUND: 'Emergency Fund',
    MAJOR_PURCHASE: 'Major Purchase',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Goal Name</label>
            <Input
              placeholder="e.g., Emergency Fund, New Car, Retirement"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Goal Type</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.type}
              onChange={e =>
                setFormData({
                  ...formData,
                  type: e.target.value as GoalType,
                })
              }
            >
              {Object.values(GoalType).map(type => (
                <option key={type} value={type}>
                  {goalTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Target Amount
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.targetAmount || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  targetAmount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Target Date (Optional)
            </label>
            <Input
              type="date"
              value={
                formData.targetDate
                  ? formData.targetDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={e => {
                const newFormData = { ...formData }
                if (e.target.value) {
                  newFormData.targetDate = new Date(e.target.value)
                } else {
                  delete newFormData.targetDate
                }
                setFormData(newFormData)
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md min-h-[80px] resize-none"
              placeholder="Add any additional details about your goal..."
              value={formData.description || ''}
              onChange={e => {
                const newFormData = { ...formData }
                if (e.target.value) {
                  newFormData.description = e.target.value
                } else {
                  delete newFormData.description
                }
                setFormData(newFormData)
              }}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? goal
                  ? 'Updating...'
                  : 'Creating...'
                : goal
                  ? 'Update Goal'
                  : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
