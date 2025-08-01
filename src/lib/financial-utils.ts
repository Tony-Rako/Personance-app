import { format } from 'date-fns'

// Currency formatting
export const formatCurrency = (
  amount: number,
  options?: {
    showCents?: boolean
    showSign?: boolean
  }
) => {
  const { showCents = true, showSign = false } = options || {}

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })

  const formatted = formatter.format(Math.abs(amount))

  if (showSign && amount !== 0) {
    return amount >= 0 ? `+${formatted}` : `-${formatted}`
  }

  return amount < 0 ? `-${formatted}` : formatted
}

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 1) => {
  return `${value.toFixed(decimals)}%`
}

// Calculate net worth
export const calculateNetWorth = (
  totalAssets: number,
  totalLiabilities: number
) => {
  return totalAssets - totalLiabilities
}

// Calculate budget progress
export const calculateBudgetProgress = (spent: number, allocated: number) => {
  if (allocated === 0) return 0
  return Math.min((spent / allocated) * 100, 100)
}

// Calculate remaining budget
export const calculateRemainingBudget = (allocated: number, spent: number) => {
  return Math.max(allocated - spent, 0)
}

// Calculate financial independence progress
export const calculateFIProgress = (
  currentNetWorth: number,
  targetAmount: number
) => {
  if (targetAmount === 0) return 0
  return Math.min((currentNetWorth / targetAmount) * 100, 100)
}

// Calculate monthly cash flow
export const calculateCashFlow = (
  monthlyIncome: number,
  monthlyExpenses: number
) => {
  return monthlyIncome - monthlyExpenses
}

// Calculate debt-to-income ratio
export const calculateDebtToIncomeRatio = (
  monthlyDebtPayments: number,
  monthlyIncome: number
) => {
  if (monthlyIncome === 0) return 0
  return (monthlyDebtPayments / monthlyIncome) * 100
}

// Calculate emergency fund months
export const calculateEmergencyFundMonths = (
  emergencyFund: number,
  monthlyExpenses: number
) => {
  if (monthlyExpenses === 0) return 0
  return emergencyFund / monthlyExpenses
}

// Calculate compound interest
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  compoundingFrequency: number = 12
) => {
  const rateDecimal = rate / 100
  return (
    principal *
    Math.pow(
      1 + rateDecimal / compoundingFrequency,
      compoundingFrequency * time
    )
  )
}

// Calculate loan payment (PMT formula)
export const calculateLoanPayment = (
  principal: number,
  annualRate: number,
  years: number
) => {
  if (annualRate === 0) return principal / (years * 12)

  const monthlyRate = annualRate / 100 / 12
  const numberOfPayments = years * 12

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  )
}

// Calculate investment return percentage
export const calculateInvestmentReturn = (
  currentValue: number,
  initialValue: number
) => {
  if (initialValue === 0) return 0
  return ((currentValue - initialValue) / initialValue) * 100
}

// Calculate passive income from income sources
export const calculatePassiveIncome = (
  incomes: Array<{ source: string; amount: number }>
) => {
  return incomes.reduce((total, income) => {
    const isPassive =
      income.source.toLowerCase().includes('dividend') ||
      income.source.toLowerCase().includes('interest') ||
      income.source.toLowerCase().includes('rental') ||
      income.source.toLowerCase().includes('investment') ||
      income.source.toLowerCase().includes('capital gains') ||
      income.source.toLowerCase().includes('business profit') ||
      income.source.toLowerCase().includes('real estate')
    return isPassive ? total + income.amount : total
  }, 0)
}

// Calculate active income from income sources
export const calculateActiveIncome = (
  incomes: Array<{ source: string; amount: number }>
) => {
  return incomes.reduce((total, income) => {
    const isActive =
      income.source.toLowerCase().includes('salary') ||
      income.source.toLowerCase().includes('wage') ||
      income.source.toLowerCase().includes('job') ||
      income.source.toLowerCase().includes('employment') ||
      income.source.toLowerCase().includes('freelance') ||
      income.source.toLowerCase().includes('consulting') ||
      income.source.toLowerCase().includes('contract')
    return isActive ? total + income.amount : total
  }, 0)
}

// Calculate escape the rat race progress
export const calculateEscapeRatRaceProgress = (
  passiveIncome: number,
  monthlyExpenses: number
) => {
  if (monthlyExpenses === 0) return 0
  return Math.min((passiveIncome / monthlyExpenses) * 100, 100)
}

// Calculate right side quadrant percentage (Business + Investor)
export const calculateRightSidePercentage = (
  businessIncome: number,
  investorIncome: number,
  totalIncome: number
) => {
  if (totalIncome === 0) return 0
  return ((businessIncome + investorIncome) / totalIncome) * 100
}

// Calculate annualized return
export const calculateAnnualizedReturn = (
  currentValue: number,
  initialValue: number,
  years: number
) => {
  if (initialValue === 0 || years === 0) return 0
  return (Math.pow(currentValue / initialValue, 1 / years) - 1) * 100
}

// Convert frequency to monthly multiplier
export const frequencyToMonthlyMultiplier = (frequency: string) => {
  switch (frequency.toLowerCase()) {
    case 'weekly':
      return 4.33 // Average weeks per month
    case 'bi-weekly':
      return 2.17 // Average bi-weeks per month
    case 'monthly':
      return 1
    case 'quarterly':
      return 1 / 3
    case 'yearly':
      return 1 / 12
    default:
      return 1
  }
}

// Calculate spending velocity (how fast money is being spent)
export const calculateSpendingVelocity = (
  totalSpent: number,
  daysInPeriod: number
) => {
  return totalSpent / daysInPeriod
}

// Calculate savings rate
export const calculateSavingsRate = (
  monthlyIncome: number,
  monthlyExpenses: number
) => {
  if (monthlyIncome === 0) return 0
  const savings = monthlyIncome - monthlyExpenses
  return (savings / monthlyIncome) * 100
}

// Calculate asset allocation percentage
export const calculateAllocationPercentage = (
  assetValue: number,
  totalPortfolioValue: number
) => {
  if (totalPortfolioValue === 0) return 0
  return (assetValue / totalPortfolioValue) * 100
}

// Calculate time to reach financial goal
export const calculateTimeToGoal = (
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number,
  annualReturn: number = 0
) => {
  if (monthlyContribution <= 0) return Infinity
  if (currentAmount >= targetAmount) return 0

  if (annualReturn === 0) {
    return (targetAmount - currentAmount) / monthlyContribution
  }

  const monthlyRate = annualReturn / 100 / 12
  const remaining = targetAmount - currentAmount

  return (
    Math.log(1 + (remaining * monthlyRate) / monthlyContribution) /
    Math.log(1 + monthlyRate)
  )
}

// Calculate retirement readiness score
export const calculateRetirementReadiness = (
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  monthlyContribution: number,
  targetRetirementIncome: number,
  expectedReturn: number = 7
) => {
  const yearsToRetirement = retirementAge - currentAge
  const monthsToRetirement = yearsToRetirement * 12
  const monthlyReturn = expectedReturn / 100 / 12

  // Calculate future value of current savings and contributions
  const futureValue =
    currentSavings * Math.pow(1 + monthlyReturn, monthsToRetirement) +
    (monthlyContribution *
      (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1)) /
      monthlyReturn

  // Calculate required nest egg (25x annual expenses rule)
  const requiredNestEgg = targetRetirementIncome * 25

  return (futureValue / requiredNestEgg) * 100
}

// Date utilities for financial calculations
export const getMonthsFromNow = (months: number) => {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date
}

export const formatDateForDisplay = (date: Date) => {
  return format(date, 'MMM dd, yyyy')
}

export const getStartOfMonth = (date: Date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export const getEndOfMonth = (date: Date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}
