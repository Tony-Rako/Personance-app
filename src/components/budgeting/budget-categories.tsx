'use client'

import React, { useState } from 'react'
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
import {
  formatPercentage,
  calculateBudgetProgress,
} from '@/lib/financial-utils'
import { useCurrencyFormat } from '@/hooks/use-currency-format'
import {
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import type { BudgetCategoryFormData } from '@/types/financial'

const categoryColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
]

interface AddCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetId: string
}

function AddCategoryDialog({
  open,
  onOpenChange,
  budgetId,
}: AddCategoryDialogProps) {
  const defaultColor = categoryColors[0] || '#3B82F6'
  const [formData, setFormData] = useState<BudgetCategoryFormData>({
    name: '',
    allocatedAmount: 0,
    color: defaultColor,
  })

  const utils = trpc.useUtils()
  const createCategory = trpc.budgetCategory.create.useMutation({
    onSuccess: () => {
      utils.budget.getCurrent.invalidate()
      onOpenChange(false)
      setFormData({ name: '', allocatedAmount: 0, color: defaultColor })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCategory.mutate({
      name: formData.name,
      allocatedAmount: formData.allocatedAmount,
      color: formData.color || defaultColor,
      budgetId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Budget Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Category Name
            </label>
            <Input
              placeholder="e.g., Housing, Food, Transportation"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Allocated Amount
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.allocatedAmount || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  allocatedAmount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex space-x-2">
              {categoryColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color
                      ? 'border-gray-400'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color: color })}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createCategory.isPending}>
              {createCategory.isPending ? 'Adding...' : 'Add Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: {
    id: string
    name: string
    allocatedAmount: { toString(): string }
    color: string
  } | null
}

function EditCategoryDialog({
  open,
  onOpenChange,
  category,
}: EditCategoryDialogProps) {
  const [formData, setFormData] = useState<BudgetCategoryFormData>({
    name: category?.name || '',
    allocatedAmount: category
      ? parseFloat(category.allocatedAmount.toString())
      : 0,
    color: category?.color || categoryColors[0] || '#3B82F6',
  })

  const utils = trpc.useUtils()
  const updateCategory = trpc.budgetCategory.update.useMutation({
    onSuccess: () => {
      utils.budget.getCurrent.invalidate()
      onOpenChange(false)
    },
  })

  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        allocatedAmount: parseFloat(category.allocatedAmount.toString()),
        color: category.color,
      })
    }
  }, [category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return

    updateCategory.mutate({
      id: category.id,
      name: formData.name,
      allocatedAmount: formData.allocatedAmount,
      color: formData.color,
    })
  }

  if (!category) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Budget Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Category Name
            </label>
            <Input
              placeholder="e.g., Housing, Food, Transportation"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Allocated Amount
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.allocatedAmount || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  allocatedAmount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex space-x-2">
              {categoryColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color
                      ? 'border-gray-400'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color: color })}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateCategory.isPending}>
              {updateCategory.isPending ? 'Updating...' : 'Update Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface CategoryCardProps {
  category: {
    id: string
    name: string
    allocatedAmount: { toString(): string }
    spentAmount: { toString(): string }
    color: string
  }
  budgetEndDate: Date
  onEdit: (category: {
    id: string
    name: string
    allocatedAmount: { toString(): string }
    color: string
  }) => void
}

function CategoryCard({ category, budgetEndDate, onEdit }: CategoryCardProps) {
  const { formatAmount } = useCurrencyFormat()
  const allocated = parseFloat(category.allocatedAmount.toString())
  const spent = parseFloat(category.spentAmount.toString())
  const remaining = allocated - spent
  const progress = calculateBudgetProgress(spent, allocated)
  const isOverBudget = spent > allocated

  const utils = trpc.useUtils()
  const deleteCategory = trpc.budgetCategory.delete.useMutation({
    onSuccess: () => {
      utils.budget.getCurrent.invalidate()
    },
  })

  const daysRemaining = Math.max(
    0,
    Math.ceil((budgetEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  const getStatusIcon = () => {
    if (isOverBudget) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    } else if (progress > 80) {
      return <Clock className="h-4 w-4 text-orange-600" />
    } else {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  const getStatusText = () => {
    if (isOverBudget) {
      return 'Over budget'
    } else if (progress > 80) {
      return 'Nearly depleted'
    } else {
      return 'On track'
    }
  }

  const getStatusColor = () => {
    if (isOverBudget) {
      return 'text-red-600'
    } else if (progress > 80) {
      return 'text-orange-600'
    } else {
      return 'text-green-600'
    }
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h3 className="font-medium text-gray-900">{category.name}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onEdit({
                id: category.id,
                name: category.name,
                allocatedAmount: category.allocatedAmount,
                color: category.color,
              })
            }
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteCategory.mutate({ id: category.id })}
            disabled={deleteCategory.isPending}
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Spent</span>
          <span
            className={
              isOverBudget ? 'text-red-600 font-medium' : 'text-gray-900'
            }
          >
            {formatAmount(spent)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Budget</span>
          <span className="text-gray-900">{formatAmount(allocated)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Remaining</span>
          <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatAmount(remaining)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Progress</span>
          <span className={isOverBudget ? 'text-red-600' : 'text-gray-700'}>
            {formatPercentage(Math.min(progress, 100))}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverBudget
                ? 'bg-red-500'
                : progress > 80
                  ? 'bg-orange-500'
                  : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          {isOverBudget && progress > 100 && (
            <div
              className="h-2 bg-red-600 rounded-full mt-1"
              style={{ width: `${Math.min(progress - 100, 50)}%` }}
            />
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <span className="text-xs text-gray-500">{daysRemaining} days left</span>
      </div>
    </Card>
  )
}

interface BudgetCategoriesProps {
  currentBudget: {
    id: string
    categories: Array<{
      id: string
      name: string
      allocatedAmount: { toString(): string }
      spentAmount: { toString(): string }
      color: string
    }>
    endDate: Date
  }
}

export default function BudgetCategories({
  currentBudget,
}: BudgetCategoriesProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{
    id: string
    name: string
    allocatedAmount: { toString(): string }
    color: string
  } | null>(null)

  const handleEditCategory = (category: {
    id: string
    name: string
    allocatedAmount: { toString(): string }
    color: string
  }) => {
    setEditingCategory(category)
    setShowEditDialog(true)
  }

  if (!currentBudget) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Budget Categories</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {currentBudget.categories.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentBudget.categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              budgetEndDate={currentBudget.endDate}
              onEdit={handleEditCategory}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="max-w-sm mx-auto">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No categories yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add budget categories to start tracking your spending across
              different areas.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              Add First Category
            </Button>
          </div>
        </Card>
      )}

      <AddCategoryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        budgetId={currentBudget.id}
      />

      <EditCategoryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        category={editingCategory}
      />
    </div>
  )
}
