'use client'

import { useState, useEffect } from 'react'
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
import { AssetType, type Asset } from '@prisma/client'
import type { AssetFormData } from '@/types/financial'

interface AssetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset?: Asset | null
  defaultType?: AssetType
  title?: string
}

export function AssetFormDialog({
  open,
  onOpenChange,
  asset,
  defaultType = AssetType.INVESTMENTS,
  title,
}: AssetFormDialogProps) {
  const [formData, setFormData] = useState<AssetFormData>(() => {
    const initialData: AssetFormData = {
      name: asset?.name || '',
      type: asset?.type || defaultType,
      value: asset ? parseFloat(asset.value.toString()) : 0,
    }

    if (asset?.costBasis) {
      initialData.costBasis = parseFloat(asset.costBasis.toString())
    }

    if (asset?.growth) {
      initialData.growth = parseFloat(asset.growth.toString())
    }

    return initialData
  })

  const utils = trpc.useUtils()

  const createAsset = trpc.asset.create.useMutation({
    onSuccess: () => {
      utils.asset.getAll.invalidate()
      utils.asset.getTotalValue.invalidate()
      utils.asset.getByType.invalidate()
      utils.asset.getPortfolioAllocation.invalidate()
      onOpenChange(false)
      setFormData({
        name: '',
        type: defaultType,
        value: 0,
      })
    },
  })

  const updateAsset = trpc.asset.update.useMutation({
    onSuccess: () => {
      utils.asset.getAll.invalidate()
      utils.asset.getTotalValue.invalidate()
      utils.asset.getByType.invalidate()
      utils.asset.getPortfolioAllocation.invalidate()
      onOpenChange(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (asset) {
      updateAsset.mutate({
        id: asset.id,
        ...formData,
      })
    } else {
      createAsset.mutate(formData)
    }
  }

  const isLoading = createAsset.isPending || updateAsset.isPending

  const assetTypeLabels: Record<AssetType, string> = {
    REAL_ESTATE: 'Real Estate',
    INVESTMENTS: 'Investments',
    CASH_EQUIVALENTS: 'Cash Equivalents',
    STOCKS_FUNDS_CDS: 'Stocks/Funds/CDs',
    BUSINESS: 'Business',
    PERSONAL_PROPERTY: 'Personal Property',
  }

  // Reset form when defaultType changes
  useEffect(() => {
    if (!asset && open) {
      setFormData(prev => ({
        ...prev,
        type: defaultType,
      }))
    }
  }, [defaultType, asset, open])

  const dialogTitle =
    title || (asset ? 'Edit Asset' : `Add ${assetTypeLabels[defaultType]}`)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Asset Name</label>
            <Input
              placeholder="e.g., Primary Residence, Tesla Stock, Rental Property"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Asset Type</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.type}
              onChange={e =>
                setFormData({
                  ...formData,
                  type: e.target.value as AssetType,
                })
              }
            >
              {Object.values(AssetType).map(type => (
                <option key={type} value={type}>
                  {assetTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Current Value
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.value || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  value: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          {formData.type === AssetType.INVESTMENTS && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cost Basis (Optional)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.costBasis || ''}
                  onChange={e => {
                    const value = e.target.value
                    const newData = { ...formData }
                    if (value) {
                      newData.costBasis = parseFloat(value)
                    } else {
                      delete newData.costBasis
                    }
                    setFormData(newData)
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Growth Rate % (Optional)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.growth || ''}
                  onChange={e => {
                    const value = e.target.value
                    const newData = { ...formData }
                    if (value) {
                      newData.growth = parseFloat(value)
                    } else {
                      delete newData.growth
                    }
                    setFormData(newData)
                  }}
                />
              </div>
            </>
          )}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : asset ? 'Update' : 'Add'} Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
