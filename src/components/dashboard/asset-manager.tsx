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
import { formatCurrency } from '@/lib/financial-utils'
import { Plus, Trash2, Edit, TrendingUp } from 'lucide-react'
import { AssetType, type Asset } from '@prisma/client'
import type { AssetFormData } from '@/types/financial'

interface AssetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset?: Asset | null
}

function AssetFormDialog({ open, onOpenChange, asset }: AssetFormDialogProps) {
  const [formData, setFormData] = useState<AssetFormData>(() => {
    const initialData: AssetFormData = {
      name: asset?.name || '',
      type: asset?.type || AssetType.INVESTMENTS,
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
        type: AssetType.INVESTMENTS,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
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
                const newFormData = { ...formData }
                if (e.target.value) {
                  newFormData.costBasis = parseFloat(e.target.value)
                } else {
                  delete newFormData.costBasis
                }
                setFormData(newFormData)
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              What you originally paid for this asset
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Annual Growth Rate % (Optional)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.growth || ''}
              onChange={e => {
                const newFormData = { ...formData }
                if (e.target.value) {
                  newFormData.growth = parseFloat(e.target.value)
                } else {
                  delete newFormData.growth
                }
                setFormData(newFormData)
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Expected annual growth percentage
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? asset
                  ? 'Updating...'
                  : 'Adding...'
                : asset
                  ? 'Update Asset'
                  : 'Add Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AssetManager() {
  const [showAssetDialog, setShowAssetDialog] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  const { data: assets, isLoading } = trpc.asset.getAll.useQuery()
  const { data: totalValue } = trpc.asset.getTotalValue.useQuery()

  const utils = trpc.useUtils()
  const deleteAsset = trpc.asset.delete.useMutation({
    onSuccess: () => {
      utils.asset.getAll.invalidate()
      utils.asset.getTotalValue.invalidate()
      utils.asset.getByType.invalidate()
      utils.asset.getPortfolioAllocation.invalidate()
    },
  })

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setShowAssetDialog(true)
  }

  const handleCloseAssetDialog = () => {
    setShowAssetDialog(false)
    setEditingAsset(null)
  }

  const getAssetTypeColor = (type: AssetType) => {
    const colors = {
      REAL_ESTATE: 'bg-blue-50 border-blue-200',
      INVESTMENTS: 'bg-green-50 border-green-200',
      CASH_EQUIVALENTS: 'bg-yellow-50 border-yellow-200',
      STOCKS_FUNDS_CDS: 'bg-purple-50 border-purple-200',
      BUSINESS: 'bg-orange-50 border-orange-200',
      PERSONAL_PROPERTY: 'bg-gray-50 border-gray-200',
    }
    return colors[type] || 'bg-gray-50 border-gray-200'
  }

  const getAssetTypeIcon = (type: AssetType) => {
    const icons = {
      REAL_ESTATE: '🏠',
      INVESTMENTS: '📈',
      CASH_EQUIVALENTS: '💰',
      STOCKS_FUNDS_CDS: '📊',
      BUSINESS: '🏢',
      PERSONAL_PROPERTY: '🚗',
    }
    return icons[type] || '💎'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Assets</h3>
            {totalValue && (
              <p className="text-sm text-gray-600">
                Total Value: {formatCurrency(totalValue)}
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAssetDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Asset
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
        ) : assets && assets.length > 0 ? (
          assets.map(asset => {
            const value = parseFloat(asset.value.toString())
            const costBasis = asset.costBasis
              ? parseFloat(asset.costBasis.toString())
              : null
            const gain = costBasis ? value - costBasis : null
            const gainPercentage =
              costBasis && costBasis > 0
                ? ((value - costBasis) / costBasis) * 100
                : null

            return (
              <div
                key={asset.id}
                className={`p-4 rounded-lg border-2 ${getAssetTypeColor(asset.type)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">
                        {getAssetTypeIcon(asset.type)}
                      </span>
                      <h4 className="font-medium text-gray-900">
                        {asset.name}
                      </h4>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {asset.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {formatCurrency(value)}
                    </p>
                    {gain !== null && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span
                          className={
                            gain >= 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {formatCurrency(gain, { showSign: true })}
                        </span>
                        {gainPercentage !== null && (
                          <span
                            className={
                              gainPercentage >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            ({gainPercentage > 0 ? '+' : ''}
                            {gainPercentage.toFixed(2)}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAsset(asset)}
                      title="Edit Asset"
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAsset.mutate({ id: asset.id })}
                      disabled={deleteAsset.isPending}
                      title="Delete Asset"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {asset.growth && (
                  <div className="text-sm text-gray-600">
                    Expected Growth: {parseFloat(asset.growth.toString())}%
                    annually
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No assets yet</h4>
            <p className="text-sm mb-4">
              Start building wealth by adding your first asset
            </p>
            <Button
              onClick={() => setShowAssetDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Asset
            </Button>
          </div>
        )}
      </div>

      <AssetFormDialog
        open={showAssetDialog}
        onOpenChange={handleCloseAssetDialog}
        asset={editingAsset}
      />
    </Card>
  )
}
