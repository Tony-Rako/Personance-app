import { PrismaClient } from '@prisma/client'
import { AssetType, TransactionType, GoalType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@personance.app' },
    update: {},
    create: {
      email: 'demo@personance.app',
      name: 'Demo User',
    },
  })

  await prisma.income.createMany({
    data: [
      {
        userId: user.id,
        source: 'Police Officer Salary',
        amount: 3000,
        frequency: 'monthly',
        isActive: true,
      },
      {
        userId: user.id,
        source: 'Interest/Dividends',
        amount: 150,
        frequency: 'monthly',
        isActive: true,
      },
    ],
  })

  await prisma.expense.createMany({
    data: [
      {
        userId: user.id,
        category: 'Taxes',
        amount: 580,
        frequency: 'monthly',
        isRecurring: true,
      },
      {
        userId: user.id,
        category: 'Home Mortgage Payment',
        amount: 400,
        frequency: 'monthly',
        isRecurring: true,
      },
    ],
  })

  const budget = await prisma.budget.create({
    data: {
      userId: user.id,
      name: 'Monthly Budget - May 2025',
      totalAmount: 3000,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-05-31'),
    },
  })

  await prisma.budgetCategory.createMany({
    data: [
      {
        userId: user.id,
        budgetId: budget.id,
        name: 'Housing',
        allocatedAmount: 1200,
        spentAmount: 1200,
        color: '#EF4444',
      },
      {
        userId: user.id,
        budgetId: budget.id,
        name: 'Food',
        allocatedAmount: 600,
        spentAmount: 350,
        color: '#10B981',
      },
    ],
  })

  await prisma.asset.createMany({
    data: [
      {
        userId: user.id,
        name: 'Primary Home',
        type: AssetType.REAL_ESTATE,
        value: 250000,
        growth: 5.2,
      },
      {
        userId: user.id,
        name: 'Emergency Fund',
        type: AssetType.CASH_EQUIVALENTS,
        value: 15000,
        growth: 0.5,
      },
    ],
  })

  await prisma.liability.createMany({
    data: [
      {
        userId: user.id,
        name: 'Home Mortgage',
        type: 'Home Mortgage',
        balance: 46000,
        interestRate: 3.5,
        minimumPayment: 400,
      },
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    await prisma.$disconnect()
    process.exit(1)
  })