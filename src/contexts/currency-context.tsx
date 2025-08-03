'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc'
import {
  getCurrencyConfig,
  DEFAULT_CURRENCY,
  type CurrencyConfig,
} from '@/lib/currency-config'

interface CurrencyContextType {
  currency: CurrencyConfig
  isLoading: boolean
  updateCurrency: (currencyCode: string) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
)

interface CurrencyProviderProps {
  children: React.ReactNode
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrency] = useState<CurrencyConfig>(
    getCurrencyConfig(DEFAULT_CURRENCY)
  )

  // Get user profile data to load currency preference
  const { data: profile, isLoading } = trpc.onboarding.getUserProfile.useQuery()
  const utils = trpc.useUtils()

  // Update currency when profile loads or changes
  useEffect(() => {
    if (profile?.preferredCurrency) {
      setCurrency(getCurrencyConfig(profile.preferredCurrency))
    }
  }, [profile?.preferredCurrency])

  const updateCurrency = async (currencyCode: string) => {
    const newCurrency = getCurrencyConfig(currencyCode)
    setCurrency(newCurrency)

    // Invalidate queries to refresh all currency displays
    utils.onboarding.getUserProfile.invalidate()
  }

  const value: CurrencyContextType = {
    currency,
    isLoading,
    updateCurrency,
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
