'use client'

import { Card } from '@/components/ui/card'
import { useCurrencyFormat } from '@/hooks/use-currency-format'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function AssetsVsLiabilities() {
  const { formatAmount } = useCurrencyFormat()
  const assetsData = [
    {
      name: 'Emergency Fund',
      value: 15000,
      type: 'Cash Equivalents',
      income: 75,
    },
    { name: 'Interest/Dividends', value: 0, type: 'Investments', income: 150 },
  ]

  const liabilitiesData = [
    { name: 'Home Mortgage', balance: 46000, payment: 400 },
  ]

  const totalAssetIncome = assetsData.reduce(
    (sum, asset) => sum + asset.income,
    0
  )
  const totalLiabilityPayments = liabilitiesData.reduce(
    (sum, liability) => sum + liability.payment,
    0
  )

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Assets vs Liabilities
      </h3>
      <p className="text-gray-600 mb-6">
        Understanding what puts money in your pocket vs what takes money out
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Assets (Money IN)</h4>
          </div>

          <div className="space-y-3">
            {assetsData.map((asset, index) => (
              <div
                key={index}
                className="bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{asset.name}</p>
                    <p className="text-sm text-gray-600">{asset.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      +{formatAmount(asset.income)}/mo
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatAmount(asset.value)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-green-900">
                  Total Monthly Income
                </span>
                <span className="font-bold text-green-600">
                  +{formatAmount(totalAssetIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-red-900">
              Liabilities (Money OUT)
            </h4>
          </div>

          <div className="space-y-3">
            {liabilitiesData.map((liability, index) => (
              <div
                key={index}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {liability.name}
                    </p>
                    <p className="text-sm text-gray-600">Monthly Payment</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      -{formatAmount(liability.payment)}/mo
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatAmount(liability.balance)} balance
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-red-900">
                  Total Monthly Payments
                </span>
                <span className="font-bold text-red-600">
                  -{formatAmount(totalLiabilityPayments)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Net Cash Flow</h4>
            <p className="text-sm text-gray-600">
              Assets income minus liability payments
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-2xl font-bold ${totalAssetIncome - totalLiabilityPayments >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {totalAssetIncome - totalLiabilityPayments >= 0 ? '+' : ''}
              {formatAmount(totalAssetIncome - totalLiabilityPayments)}
            </p>
            <p className="text-sm text-gray-600">per month</p>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">
          Rich Dad Definition
        </h4>
        <p className="text-sm text-blue-800">
          <strong>Asset:</strong> Puts money in your pocket.{' '}
          <strong>Liability:</strong> Takes money out of your pocket. The rich
          buy assets, the poor and middle class buy liabilities they think are
          assets.
        </p>
      </div>
    </Card>
  )
}
