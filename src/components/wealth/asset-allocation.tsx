'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import { formatPercentage } from '@/lib/financial-utils'
import { useCurrencyFormat } from '@/hooks/use-currency-format'
import {
  Building,
  TrendingUp,
  Coins,
  Briefcase,
  Home,
  Plus,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { AssetFormDialog } from '@/components/shared/asset-form-dialog'
import { AssetType } from '@prisma/client'

const ASSET_TYPE_CONFIG = {
  REAL_ESTATE: {
    label: 'Real Estate',
    icon: <Home className="h-5 w-5" />,
    color: '#3B82F6',
    description: 'Primary residence and investment properties',
  },
  INVESTMENTS: {
    label: 'Investments',
    icon: <TrendingUp className="h-5 w-5" />,
    color: '#8B5CF6',
    description: 'Stocks, bonds, mutual funds, ETFs',
  },
  CASH_EQUIVALENTS: {
    label: 'Cash & Equivalents',
    icon: <Coins className="h-5 w-5" />,
    color: '#10B981',
    description: 'Checking, savings, money market accounts',
  },
  STOCKS_FUNDS_CDS: {
    label: 'Stocks/Funds/CDs',
    icon: <Briefcase className="h-5 w-5" />,
    color: '#F59E0B',
    description: 'Individual stocks, index funds, CDs',
  },
  BUSINESS: {
    label: 'Business',
    icon: <Building className="h-5 w-5" />,
    color: '#EF4444',
    description: 'Business ownership and partnerships',
  },
  PERSONAL_PROPERTY: {
    label: 'Personal Property',
    icon: <Building className="h-5 w-5" />,
    color: '#6B7280',
    description: 'Vehicles, jewelry, collectibles',
  },
}

interface AssetTypeCardProps {
  type: keyof typeof ASSET_TYPE_CONFIG
  value: number
  percentage: number
  count: number
  onAddAsset: (assetType: AssetType) => void
}

function AssetTypeCard({
  type,
  value,
  percentage,
  count,
  onAddAsset,
}: AssetTypeCardProps) {
  const { formatAmount } = useCurrencyFormat()
  const config = ASSET_TYPE_CONFIG[type]

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <div style={{ color: config.color }}>{config.icon}</div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{config.label}</h3>
            <p className="text-xs text-gray-500">
              {count} {count === 1 ? 'asset' : 'assets'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddAsset(type as AssetType)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">
            {formatAmount(value)}
          </span>
          <span className="text-sm font-medium" style={{ color: config.color }}>
            {formatPercentage(percentage)}
          </span>
        </div>
        <p className="text-xs text-gray-600">{config.description}</p>
      </div>
    </Card>
  )
}

interface ChartData {
  name: string
  value: number
  percentage: number
  color: string
}

interface TooltipPayload {
  payload: ChartData
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
}

function AllocationChart({ data }: { data: ChartData[] }) {
  const { formatAmount } = useCurrencyFormat()
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      if (!data) return null
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatAmount(data.value)} ({formatPercentage(data.percentage)})
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Asset Allocation
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-600 truncate">{item.name}</span>
              <span className="text-gray-900 font-medium">
                {formatPercentage(item.percentage)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default function AssetAllocation() {
  const { formatAmount } = useCurrencyFormat()
  const [assetDialogOpen, setAssetDialogOpen] = useState(false)
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>(
    AssetType.INVESTMENTS
  )

  const { data: portfolioData, isLoading } =
    trpc.asset.getPortfolioAllocation.useQuery()
  const { data: assets } = trpc.asset.getAll.useQuery()

  const handleAddAsset = (assetType: AssetType) => {
    setSelectedAssetType(assetType)
    setAssetDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const allocation = portfolioData?.allocation || []

  const chartData = allocation.map(item => ({
    name: ASSET_TYPE_CONFIG[item.type as keyof typeof ASSET_TYPE_CONFIG].label,
    value: item.value,
    percentage: item.percentage,
    color: ASSET_TYPE_CONFIG[item.type as keyof typeof ASSET_TYPE_CONFIG].color,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Asset Allocation</h2>
        <Button
          variant="outline"
          onClick={() => handleAddAsset(AssetType.INVESTMENTS)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AllocationChart data={chartData} />

        <div className="space-y-4">
          {allocation.map(allocationItem => (
            <AssetTypeCard
              key={allocationItem.type}
              type={allocationItem.type as keyof typeof ASSET_TYPE_CONFIG}
              value={allocationItem.value}
              percentage={allocationItem.percentage}
              count={allocationItem.count}
              onAddAsset={handleAddAsset}
            />
          ))}
        </div>
      </div>

      {/* Asset Details - Dynamic based on allocation */}
      {allocation.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {allocation.slice(0, 2).map(allocationItem => {
            const config =
              ASSET_TYPE_CONFIG[
                allocationItem.type as keyof typeof ASSET_TYPE_CONFIG
              ]
            const typeAssets =
              assets?.filter(asset => asset.type === allocationItem.type) || []

            return (
              <Card key={allocationItem.type} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {config.label}
                </h3>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatAmount(allocationItem.value)}
                </div>
                <div className="space-y-3">
                  {typeAssets.slice(0, 3).map(asset => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {config.icon}
                        <span className="text-sm text-gray-900">
                          {asset.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(Number(asset.value))}
                        </div>
                        {asset.growth && (
                          <div
                            className={`text-xs ${Number(asset.growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {Number(asset.growth) >= 0 ? '+' : ''}
                            {formatPercentage(Number(asset.growth))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {typeAssets.length === 0 && (
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Click to add new {config.label.toLowerCase()} asset
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Asset Form Dialog */}
      <AssetFormDialog
        open={assetDialogOpen}
        onOpenChange={setAssetDialogOpen}
        defaultType={selectedAssetType}
      />
    </div>
  )
}
