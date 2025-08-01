import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import { GoalType, type FinancialGoal } from '@prisma/client'

export const goalRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.financialGoal.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }),

  getActive: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.financialGoal.findMany({
      where: {
        userId: ctx.session.user.id,
        isCompleted: false,
      },
      orderBy: {
        targetDate: 'asc',
      },
    })
  }),

  getByType: protectedProcedure.query(async ({ ctx }) => {
    const goals = await ctx.prisma.financialGoal.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })

    const goalsByType = goals.reduce(
      (acc, goal) => {
        const type = goal.type
        const currentAmount = parseFloat(goal.currentAmount.toString())
        const targetAmount = parseFloat(goal.targetAmount.toString())

        if (!acc[type]) {
          acc[type] = {
            totalCurrent: 0,
            totalTarget: 0,
            count: 0,
            goals: [],
          }
        }
        acc[type].totalCurrent += currentAmount
        acc[type].totalTarget += targetAmount
        acc[type].count += 1
        acc[type].goals.push(goal)
        return acc
      },
      {} as Record<
        GoalType,
        {
          totalCurrent: number
          totalTarget: number
          count: number
          goals: FinancialGoal[]
        }
      >
    )

    return goalsByType
  }),

  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const goals = await ctx.prisma.financialGoal.findMany({
      where: {
        userId: ctx.session.user.id,
        isCompleted: false,
      },
    })

    return goals.map(goal => {
      const currentAmount = parseFloat(goal.currentAmount.toString())
      const targetAmount = parseFloat(goal.targetAmount.toString())
      const progressPercentage =
        targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0

      const monthsRemaining = goal.targetDate
        ? Math.ceil(
            (goal.targetDate.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24 * 30)
          )
        : undefined

      const onTrack = goal.targetDate
        ? progressPercentage >= 100 - (monthsRemaining || 0) * 10 // Simple on-track calculation
        : progressPercentage > 0

      return {
        id: goal.id,
        name: goal.name,
        type: goal.type,
        currentAmount,
        targetAmount,
        progressPercentage: Math.min(progressPercentage, 100),
        targetDate: goal.targetDate,
        monthsRemaining,
        onTrack,
      }
    })
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.nativeEnum(GoalType),
        targetAmount: z.number().positive(),
        targetDate: z.date().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data: {
        name: string
        type: GoalType
        targetAmount: number
        userId: string
        targetDate?: Date
        description?: string
      } = {
        name: input.name,
        type: input.type,
        targetAmount: input.targetAmount,
        userId: ctx.session.user.id,
      }

      if (input.targetDate) {
        data.targetDate = input.targetDate
      }

      if (input.description) {
        data.description = input.description
      }

      return ctx.prisma.financialGoal.create({
        data,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        type: z.nativeEnum(GoalType).optional(),
        targetAmount: z.number().positive().optional(),
        currentAmount: z.number().min(0).optional(),
        targetDate: z.date().optional(),
        description: z.string().optional(),
        isCompleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...inputData } = input

      const updateData: {
        updatedAt: Date
        name?: string
        type?: GoalType
        targetAmount?: number
        currentAmount?: number
        targetDate?: Date
        description?: string
        isCompleted?: boolean
      } = { updatedAt: new Date() }

      if (inputData.name !== undefined) updateData.name = inputData.name
      if (inputData.type !== undefined) updateData.type = inputData.type
      if (inputData.targetAmount !== undefined)
        updateData.targetAmount = inputData.targetAmount
      if (inputData.currentAmount !== undefined)
        updateData.currentAmount = inputData.currentAmount
      if (inputData.targetDate !== undefined)
        updateData.targetDate = inputData.targetDate
      if (inputData.description !== undefined)
        updateData.description = inputData.description
      if (inputData.isCompleted !== undefined)
        updateData.isCompleted = inputData.isCompleted

      return ctx.prisma.financialGoal.update({
        where: { id, userId: ctx.session.user.id },
        data: updateData,
      })
    }),

  updateProgress: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        currentAmount: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.prisma.financialGoal.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      })

      if (!goal) {
        throw new Error('Goal not found')
      }

      const targetAmount = parseFloat(goal.targetAmount.toString())
      const isCompleted = input.currentAmount >= targetAmount

      return ctx.prisma.financialGoal.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: {
          currentAmount: input.currentAmount,
          isCompleted,
          updatedAt: new Date(),
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.financialGoal.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      })
    }),

  getTotalProgress: protectedProcedure.query(async ({ ctx }) => {
    const goals = await ctx.prisma.financialGoal.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })

    const totalCurrent = goals.reduce(
      (sum, goal) => sum + parseFloat(goal.currentAmount.toString()),
      0
    )

    const totalTarget = goals.reduce(
      (sum, goal) => sum + parseFloat(goal.targetAmount.toString()),
      0
    )

    const overallProgress =
      totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
    const completedGoals = goals.filter(goal => goal.isCompleted).length
    const activeGoals = goals.filter(goal => !goal.isCompleted).length

    return {
      totalCurrent,
      totalTarget,
      overallProgress: Math.min(overallProgress, 100),
      completedGoals,
      activeGoals,
      totalGoals: goals.length,
    }
  }),

  getPassiveIncomeGoal: protectedProcedure.query(async ({ ctx }) => {
    // Find existing passive income goal
    let passiveIncomeGoal = await ctx.prisma.financialGoal.findFirst({
      where: {
        userId: ctx.session.user.id,
        OR: [
          { name: { contains: 'passive income', mode: 'insensitive' } },
          { name: { contains: 'rat race', mode: 'insensitive' } },
          { name: { contains: 'financial freedom', mode: 'insensitive' } },
        ],
      },
    })

    // If no passive income goal exists, get monthly expenses to create target
    if (!passiveIncomeGoal) {
      const monthlyExpenses = await ctx.prisma.expense.findMany({
        where: {
          userId: ctx.session.user.id,
          isRecurring: true,
        },
      })

      const totalMonthlyExpenses = monthlyExpenses.reduce((sum, expense) => {
        const amount = parseFloat(expense.amount.toString())
        // Convert to monthly amount based on frequency
        switch (expense.frequency) {
          case 'weekly':
            return sum + amount * 4.33
          case 'bi-weekly':
            return sum + amount * 2.17
          case 'yearly':
            return sum + amount / 12
          default:
            return sum + amount // monthly
        }
      }, 0)

      // Create passive income goal with target = monthly expenses
      if (totalMonthlyExpenses > 0) {
        passiveIncomeGoal = await ctx.prisma.financialGoal.create({
          data: {
            name: 'Escape the Rat Race - Passive Income Goal',
            type: 'RETIREMENT', // Using RETIREMENT as closest match
            targetAmount: totalMonthlyExpenses,
            currentAmount: 0,
            description:
              'Achieve financial freedom by generating passive income equal to monthly expenses',
            userId: ctx.session.user.id,
          },
        })
      }
    }

    return passiveIncomeGoal
  }),

  updatePassiveIncomeProgress: protectedProcedure
    .input(z.object({ passiveIncome: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Throttling mechanism: Only allow updates every 5 seconds per user
      const cacheKey = `passive_income_update_${userId}`
      const lastUpdate = (globalThis as Record<string, Record<string, number>>)
        .passiveIncomeCache?.[cacheKey]
      const now = Date.now()

      if (lastUpdate && now - lastUpdate < 5000) {
        console.log(
          `Throttled updatePassiveIncomeProgress for user ${userId} - last update was ${(now - lastUpdate) / 1000}s ago`
        )
        return null
      }

      // Initialize cache if it doesn't exist
      if (
        !(globalThis as Record<string, Record<string, number>>)
          .passiveIncomeCache
      ) {
        ;(
          globalThis as Record<string, Record<string, number>>
        ).passiveIncomeCache = {}
      }
      ;(
        globalThis as Record<string, Record<string, number>>
      ).passiveIncomeCache[cacheKey] = now

      // Find or create passive income goal
      const passiveIncomeGoal = await ctx.prisma.financialGoal.findFirst({
        where: {
          userId: ctx.session.user.id,
          OR: [
            { name: { contains: 'passive income', mode: 'insensitive' } },
            { name: { contains: 'rat race', mode: 'insensitive' } },
            { name: { contains: 'financial freedom', mode: 'insensitive' } },
          ],
        },
      })

      if (passiveIncomeGoal) {
        const currentAmount = parseFloat(
          passiveIncomeGoal.currentAmount.toString()
        )

        // Only update if the change is significant (> $1)
        if (Math.abs(currentAmount - input.passiveIncome) <= 1) {
          console.log(
            `Skipped updatePassiveIncomeProgress - change too small: ${Math.abs(currentAmount - input.passiveIncome)}`
          )
          return passiveIncomeGoal
        }

        const targetAmount = parseFloat(
          passiveIncomeGoal.targetAmount.toString()
        )
        const isCompleted = input.passiveIncome >= targetAmount

        console.log(
          `Updating passive income goal: ${currentAmount} -> ${input.passiveIncome}`
        )
        return ctx.prisma.financialGoal.update({
          where: { id: passiveIncomeGoal.id },
          data: {
            currentAmount: input.passiveIncome,
            isCompleted,
            updatedAt: new Date(),
          },
        })
      }

      return null
    }),
})
