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
import { Plus, Trash2, DollarSign, CreditCard } from 'lucide-react'
import type { IncomeFormData, ExpenseFormData } from '@/types/financial'

interface AddIncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AddIncomeDialog({ open, onOpenChange }: AddIncomeDialogProps) {
  const [formData, setFormData] = useState<IncomeFormData>({
    source: '',
    amount: 0,
    frequency: 'monthly',
  })

  const utils = trpc.useUtils()
  const createIncome = trpc.income.create.useMutation({
    onSuccess: () => {
      utils.income.getAll.invalidate()
      utils.income.getTotalMonthly.invalidate()
      onOpenChange(false)
      setFormData({ source: '', amount: 0, frequency: 'monthly' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createIncome.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Income Source</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Source</label>
            <Input
              placeholder="e.g., Police Officer Salary"
              value={formData.source}
              onChange={e =>
                setFormData({ ...formData, source: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Frequency</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.frequency}
              onChange={e =>
                setFormData({
                  ...formData,
                  frequency: e.target.value as
                    | 'weekly'
                    | 'bi-weekly'
                    | 'monthly'
                    | 'yearly',
                })
              }
            >
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createIncome.isPending}>
              {createIncome.isPending ? 'Adding...' : 'Add Income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: '',
    amount: 0,
    frequency: 'monthly',
    isRecurring: true,
  })

  const utils = trpc.useUtils()
  const createExpense = trpc.expense.create.useMutation({
    onSuccess: () => {
      utils.expense.getAll.invalidate()
      utils.expense.getTotalMonthly.invalidate()
      onOpenChange(false)
      setFormData({
        category: '',
        amount: 0,
        frequency: 'monthly',
        isRecurring: true,
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createExpense.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Input
              placeholder="e.g., Home Mortgage Payment"
              value={formData.category}
              onChange={e =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Frequency</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.frequency}
              onChange={e =>
                setFormData({
                  ...formData,
                  frequency: e.target.value as
                    | 'weekly'
                    | 'bi-weekly'
                    | 'monthly'
                    | 'yearly',
                })
              }
            >
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={e =>
                setFormData({ ...formData, isRecurring: e.target.checked })
              }
            />
            <label htmlFor="isRecurring" className="text-sm">
              Recurring expense
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createExpense.isPending}>
              {createExpense.isPending ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function IncomeExpenseManager() {
  const { formatAmount } = useCurrencyFormat()
  const [showIncomeDialog, setShowIncomeDialog] = useState(false)
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)

  const { data: incomes, isLoading: incomesLoading } =
    trpc.income.getAll.useQuery()
  const { data: expenses, isLoading: expensesLoading } =
    trpc.expense.getAll.useQuery()

  const utils = trpc.useUtils()
  const deleteIncome = trpc.income.delete.useMutation({
    onSuccess: () => {
      utils.income.getAll.invalidate()
      utils.income.getTotalMonthly.invalidate()
    },
  })

  const deleteExpense = trpc.expense.delete.useMutation({
    onSuccess: () => {
      utils.expense.getAll.invalidate()
      utils.expense.getTotalMonthly.invalidate()
    },
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Income Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Income Sources
            </h3>
          </div>
          <Button
            size="sm"
            onClick={() => setShowIncomeDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {incomesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-200 h-16 rounded"
                ></div>
              ))}
            </div>
          ) : incomes && incomes.length > 0 ? (
            incomes.map(income => (
              <div
                key={income.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{income.source}</p>
                  <p className="text-sm text-gray-600">
                    {formatAmount(parseFloat(income.amount.toString()))} /{' '}
                    {income.frequency}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteIncome.mutate({ id: income.id })}
                  disabled={deleteIncome.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No income sources yet</p>
              <p className="text-sm">
                Add your first income source to get started
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Expenses Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
          </div>
          <Button
            size="sm"
            onClick={() => setShowExpenseDialog(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {expensesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-200 h-16 rounded"
                ></div>
              ))}
            </div>
          ) : expenses && expenses.length > 0 ? (
            expenses.map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {expense.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatAmount(parseFloat(expense.amount.toString()))} /{' '}
                    {expense.frequency}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteExpense.mutate({ id: expense.id })}
                  disabled={deleteExpense.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No expenses yet</p>
              <p className="text-sm">
                Add your first expense to track spending
              </p>
            </div>
          )}
        </div>
      </Card>

      <AddIncomeDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
      />
      <AddExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
      />
    </div>
  )
}
