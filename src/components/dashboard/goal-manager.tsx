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
import { Plus, Target, Trash2, Edit, DollarSign } from 'lucide-react'
import { GoalFormDialog } from './goal-form'
import { GoalType, type FinancialGoal } from '@prisma/client'

interface EditGoal {
  id: string
  name: string
  type: GoalType
  targetAmount: number
  targetDate?: Date
  description?: string
}

interface ProgressGoal {
  id: string
  name: string
  currentAmount: number
  targetAmount: number
}

interface UpdateProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: {
    id: string
    name: string
    currentAmount: number
    targetAmount: number
  } | null
}

function UpdateProgressDialog({
  open,
  onOpenChange,
  goal,
}: UpdateProgressDialogProps) {
  const { formatAmount } = useCurrencyFormat()
  const [amount, setAmount] = useState(0)

  const utils = trpc.useUtils()
  const updateProgress = trpc.goal.updateProgress.useMutation({
    onSuccess: () => {
      utils.goal.getAll.invalidate()
      utils.goal.getActive.invalidate()
      utils.goal.getProgress.invalidate()
      utils.goal.getTotalProgress.invalidate()
      onOpenChange(false)
      setAmount(0)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (goal) {
      updateProgress.mutate({
        id: goal.id,
        currentAmount: amount,
      })
    }
  }

  if (!goal) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Progress - {goal.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Current: {formatAmount(goal.currentAmount)} / Target:{' '}
              {formatAmount(goal.targetAmount)}
            </p>
            <label className="block text-sm font-medium mb-1">New Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount || ''}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateProgress.isPending}>
              {updateProgress.isPending ? 'Updating...' : 'Update Progress'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function GoalManager() {
  const { formatAmount } = useCurrencyFormat()
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<EditGoal | null>(null)
  const [progressGoal, setProgressGoal] = useState<ProgressGoal | null>(null)

  const { data: goals, isLoading } = trpc.goal.getAll.useQuery()
  const { data: goalProgressData } = trpc.goal.getProgress.useQuery()

  const utils = trpc.useUtils()
  const deleteGoal = trpc.goal.delete.useMutation({
    onSuccess: () => {
      utils.goal.getAll.invalidate()
      utils.goal.getActive.invalidate()
      utils.goal.getProgress.invalidate()
      utils.goal.getTotalProgress.invalidate()
    },
  })

  const handleEditGoal = (goal: FinancialGoal) => {
    const editGoal: EditGoal = {
      id: goal.id,
      name: goal.name,
      type: goal.type,
      targetAmount: parseFloat(goal.targetAmount.toString()),
    }

    if (goal.targetDate) {
      editGoal.targetDate = goal.targetDate
    }

    if (goal.description) {
      editGoal.description = goal.description
    }

    setEditingGoal(editGoal)
    setShowGoalDialog(true)
  }

  const handleUpdateProgress = (goal: FinancialGoal) => {
    setProgressGoal({
      id: goal.id,
      name: goal.name,
      currentAmount: parseFloat(goal.currentAmount.toString()),
      targetAmount: parseFloat(goal.targetAmount.toString()),
    })
    setShowProgressDialog(true)
  }

  const handleCloseGoalDialog = () => {
    setShowGoalDialog(false)
    setEditingGoal(null)
  }

  const handleCloseProgressDialog = () => {
    setShowProgressDialog(false)
    setProgressGoal(null)
  }

  const getGoalTypeColor = (type: GoalType) => {
    const colors = {
      SAVINGS: 'bg-blue-50 border-blue-200',
      DEBT_PAYOFF: 'bg-red-50 border-red-200',
      INVESTMENT: 'bg-green-50 border-green-200',
      RETIREMENT: 'bg-purple-50 border-purple-200',
      EMERGENCY_FUND: 'bg-orange-50 border-orange-200',
      MAJOR_PURCHASE: 'bg-yellow-50 border-yellow-200',
    }
    return colors[type] || 'bg-gray-50 border-gray-200'
  }

  const getGoalTypeIcon = (type: GoalType) => {
    switch (type) {
      case 'SAVINGS':
        return '💰'
      case 'DEBT_PAYOFF':
        return '💳'
      case 'INVESTMENT':
        return '📈'
      case 'RETIREMENT':
        return '🏖️'
      case 'EMERGENCY_FUND':
        return '🚨'
      case 'MAJOR_PURCHASE':
        return '🛒'
      default:
        return '🎯'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Financial Goals
          </h3>
        </div>
        <Button
          size="sm"
          onClick={() => setShowGoalDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-24 rounded-lg"
              ></div>
            ))}
          </div>
        ) : goals && goals.length > 0 ? (
          goals.map(goal => {
            const currentAmount = parseFloat(goal.currentAmount.toString())
            const targetAmount = parseFloat(goal.targetAmount.toString())
            const progressPercentage =
              targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
            const progressData = goalProgressData?.find(p => p.id === goal.id)

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-lg border-2 ${getGoalTypeColor(goal.type)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">
                        {getGoalTypeIcon(goal.type)}
                      </span>
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      {goal.isCompleted && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {goal.name.toLowerCase().includes('rat race') ||
                      goal.name.toLowerCase().includes('passive income') ||
                      goal.name.toLowerCase().includes('financial freedom') ? (
                        <span>
                          <span className="font-medium">Passive Income:</span>{' '}
                          {formatAmount(currentAmount)} /
                          <span className="font-medium">
                            {' '}
                            Monthly Expenses:
                          </span>{' '}
                          {formatAmount(targetAmount)}
                        </span>
                      ) : (
                        <span>
                          {formatAmount(currentAmount)} /{' '}
                          {formatAmount(targetAmount)}
                        </span>
                      )}
                    </p>
                    {goal.targetDate && (
                      <p className="text-xs text-gray-500">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                        {progressData?.monthsRemaining && (
                          <span className="ml-2">
                            ({progressData.monthsRemaining} months remaining)
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateProgress(goal)}
                      title="Update Progress"
                    >
                      <DollarSign className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditGoal(goal)}
                      title="Edit Goal"
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal.mutate({ id: goal.id })}
                      disabled={deleteGoal.isPending}
                      title="Delete Goal"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {goal.name.toLowerCase().includes('rat race') ||
                      goal.name.toLowerCase().includes('passive income') ||
                      goal.name.toLowerCase().includes('financial freedom')
                        ? 'Financial Freedom'
                        : 'Progress'}
                    </span>
                    <span
                      className={`font-medium ${
                        progressPercentage >= 100 ? 'text-green-600' : ''
                      }`}
                    >
                      {Math.min(progressPercentage, 100).toFixed(1)}%
                      {(goal.name.toLowerCase().includes('rat race') ||
                        goal.name.toLowerCase().includes('passive income') ||
                        goal.name
                          .toLowerCase()
                          .includes('financial freedom')) &&
                        progressPercentage >= 100 &&
                        ' 🎉'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progressPercentage >= 100
                          ? 'bg-green-500'
                          : progressData?.onTrack
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    {goal.description}
                  </p>
                )}

                {/* Special message for rat race goal */}
                {(goal.name.toLowerCase().includes('rat race') ||
                  goal.name.toLowerCase().includes('passive income') ||
                  goal.name.toLowerCase().includes('financial freedom')) && (
                  <p
                    className={`text-xs mt-2 ${
                      progressPercentage >= 100
                        ? 'text-green-600 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {progressPercentage >= 100
                      ? "🎉 Congratulations! You've achieved financial freedom!"
                      : progressPercentage >= 75
                        ? 'Almost there! Financial freedom is within reach.'
                        : progressPercentage >= 50
                          ? 'Great progress! Keep building passive income.'
                          : progressPercentage >= 25
                            ? 'Good start! Focus on creating passive income streams.'
                            : 'Start building passive income to escape the rat race.'}
                  </p>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No goals yet</h4>
            <p className="text-sm mb-4">
              Start your financial journey by creating your first goal
            </p>
            <Button
              onClick={() => setShowGoalDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        )}
      </div>

      <GoalFormDialog
        open={showGoalDialog}
        onOpenChange={handleCloseGoalDialog}
        goal={editingGoal || undefined}
      />

      <UpdateProgressDialog
        open={showProgressDialog}
        onOpenChange={handleCloseProgressDialog}
        goal={progressGoal}
      />
    </Card>
  )
}
