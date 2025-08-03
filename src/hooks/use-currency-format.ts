import { useCallback } from 'react'
import { useCurrency } from '@/contexts/currency-context'
import { formatCurrency } from '@/lib/financial-utils'

interface CurrencyFormatOptions {
  showCents?: boolean
  showSign?: boolean
}

export function useCurrencyFormat() {
  const { currency } = useCurrency()

  const formatAmount = useCallback(
    (amount: number, options?: CurrencyFormatOptions) => {
      return formatCurrency(amount, {
        ...options,
        currency,
      })
    },
    [currency]
  )

  return {
    formatAmount,
    currency,
    currencySymbol: currency.symbol,
    currencyCode: currency.code,
  }
}
