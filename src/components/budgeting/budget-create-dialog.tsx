'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { trpc } from '@/lib/trpc'
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns'

interface BudgetFormData {
  name: string
  totalAmount: number | string
  startDate: string
  endDate: string
}

interface BudgetCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function BudgetCreateDialog({
  open,
  onOpenChange,
}: BudgetCreateDialogProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize with current month
  const currentDate = new Date()
  const defaultStartDate = startOfMonth(currentDate)
  const defaultEndDate = endOfMonth(currentDate)

  const [formData, setFormData] = useState<BudgetFormData>({
    name: `${format(currentDate, 'MMMM yyyy')} Budget`,
    totalAmount: '',
    startDate: format(defaultStartDate, 'yyyy-MM-dd'),
    endDate: format(defaultEndDate, 'yyyy-MM-dd'),
  })

  const utils = trpc.useUtils()
  const createBudget = trpc.budget.create.useMutation({
    onSuccess: () => {
      utils.budget.getCurrent.invalidate()
      utils.budget.getAll.invalidate()
      onOpenChange(false)
      // Reset form
      setFormData({
        name: `${format(addMonths(currentDate, 1), 'MMMM yyyy')} Budget`,
        totalAmount: '',
        startDate: format(
          startOfMonth(addMonths(currentDate, 1)),
          'yyyy-MM-dd'
        ),
        endDate: format(endOfMonth(addMonths(currentDate, 1)), 'yyyy-MM-dd'),
      })
      setErrors({})
    },
    onError: error => {
      setErrors({ submit: error.message })
    },
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required'
    }

    const amount =
      typeof formData.totalAmount === 'string'
        ? parseFloat(formData.totalAmount)
        : formData.totalAmount

    if (!amount || amount <= 0) {
      newErrors.totalAmount = 'Total amount must be greater than 0'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)

      if (end <= start) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const amount =
      typeof formData.totalAmount === 'string'
        ? parseFloat(formData.totalAmount)
        : formData.totalAmount

    createBudget.mutate({
      name: formData.name.trim(),
      totalAmount: amount,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    })
  }

  const handleQuickFill = (months: number) => {
    const startDate = startOfMonth(addMonths(currentDate, months))
    const endDate = endOfMonth(addMonths(currentDate, months))

    setFormData({
      ...formData,
      name: `${format(startDate, 'MMMM yyyy')} Budget`,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <DialogTitle>Create New Budget</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Budget Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Budget Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., January 2024 Budget"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500">{errors.name}</span>
              </div>
            )}
          </div>

          {/* Total Amount */}
          <div>
            <Label
              htmlFor="totalAmount"
              className="text-sm font-medium text-gray-700"
            >
              Total Budget Amount
            </Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.totalAmount}
              onChange={e =>
                setFormData({ ...formData, totalAmount: e.target.value })
              }
              className={errors.totalAmount ? 'border-red-500' : ''}
            />
            {errors.totalAmount && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500">
                  {errors.totalAmount}
                </span>
              </div>
            )}
          </div>

          {/* Quick Fill Options */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Quick Fill Dates
            </Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill(0)}
                className="flex-1"
              >
                This Month
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill(1)}
                className="flex-1"
              >
                Next Month
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="startDate"
                className="text-sm font-medium text-gray-700"
              >
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={e =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-500">
                    {errors.startDate}
                  </span>
                </div>
              )}
            </div>

            <div>
              <Label
                htmlFor="endDate"
                className="text-sm font-medium text-gray-700"
              >
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={e =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-500">{errors.endDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{errors.submit}</span>
            </div>
          )}

          {/* Success tip */}
          <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-700">
              After creating your budget, you can add categories to track
              spending.
            </span>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={createBudget.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={createBudget.isPending}
              className="min-w-[100px]"
            >
              {createBudget.isPending ? 'Creating...' : 'Create Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
