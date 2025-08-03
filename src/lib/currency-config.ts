export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  locale: string
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
  },
  CAD: {
    code: 'CAD',
    symbol: 'CAD',
    name: 'Canadian Dollar',
    locale: 'en-CA',
  },
  AUD: {
    code: 'AUD',
    symbol: 'AUD',
    name: 'Australian Dollar',
    locale: 'en-AU',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
  },
}

export const DEFAULT_CURRENCY = 'EUR'

export const getSupportedCurrencies = () => Object.keys(CURRENCY_CONFIGS)

export const getCurrencyConfig = (currencyCode: string): CurrencyConfig => {
  const config = CURRENCY_CONFIGS[currencyCode]
  if (config) {
    return config
  }
  const defaultConfig = CURRENCY_CONFIGS[DEFAULT_CURRENCY]
  if (!defaultConfig) {
    throw new Error(
      `Default currency ${DEFAULT_CURRENCY} not found in configuration`
    )
  }
  return defaultConfig
}

export const formatCurrencyWithConfig = (
  amount: number,
  currencyConfig: CurrencyConfig,
  options?: {
    showCents?: boolean
    showSign?: boolean
  }
) => {
  const { showCents = true, showSign = false } = options || {}

  const formatter = new Intl.NumberFormat(currencyConfig.locale, {
    style: 'currency',
    currency: currencyConfig.code,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })

  const formatted = formatter.format(Math.abs(amount))

  if (showSign && amount !== 0) {
    return amount >= 0 ? `+${formatted}` : `-${formatted}`
  }

  return amount < 0 ? `-${formatted}` : formatted
}
