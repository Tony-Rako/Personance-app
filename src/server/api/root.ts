import { createTRPCRouter } from '@/server/trpc'
import { incomeRouter } from './routers/income'
import { expenseRouter } from './routers/expense'
import { budgetRouter, budgetCategoryRouter } from './routers/budget'
import { assetRouter } from './routers/assets'
import { liabilityRouter } from './routers/liabilities'
import { transactionRouter } from './routers/transaction'
import { goalRouter } from './routers/goal'
import { netWorthRouter } from './routers/networth'
import { onboardingRouter } from './routers/onboarding'

export const appRouter = createTRPCRouter({
  income: incomeRouter,
  expense: expenseRouter,
  budget: budgetRouter,
  budgetCategory: budgetCategoryRouter,
  asset: assetRouter,
  liability: liabilityRouter,
  transaction: transactionRouter,
  goal: goalRouter,
  networth: netWorthRouter,
  onboarding: onboardingRouter,
})

export type AppRouter = typeof appRouter
