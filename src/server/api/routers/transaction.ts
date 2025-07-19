import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import { TransactionType, type Transaction } from '@prisma/client'

export const transactionRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        category: z.string().optional(),
        type: z.nativeEnum(TransactionType).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, category, type, startDate, endDate } = input

      const where: {
        userId: string
        category?: string
        type?: TransactionType
        date?: {
          gte?: Date
          lte?: Date
        }
      } = {
        userId: ctx.session.user.id,
      }

      if (category) where.category = category
      if (type) where.type = type
      if (startDate || endDate) {
        where.date = {}
        if (startDate) where.date.gte = startDate
        if (endDate) where.date.lte = endDate
      }

      const findManyOptions: {
        where: typeof where
        take: number
        orderBy: { date: 'desc' }
        cursor?: { id: string }
      } = {
        where,
        take: limit + 1,
        orderBy: {
          date: 'desc',
        },
      }

      if (cursor) {
        findManyOptions.cursor = { id: cursor }
      }

      const transactions =
        await ctx.prisma.transaction.findMany(findManyOptions)

      let nextCursor: typeof cursor | undefined = undefined
      if (transactions.length > limit) {
        const nextItem = transactions.pop()
        nextCursor = nextItem?.id
      }

      return {
        transactions,
        nextCursor,
      }
    }),

  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.transaction.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        take: input.limit,
        orderBy: {
          date: 'desc',
        },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string().min(1),
        category: z.string().min(1),
        type: z.nativeEnum(TransactionType),
        date: z.date(),
        accountName: z.string().optional(),
        tags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createData = {
        ...input,
        userId: ctx.session.user.id,
        accountName: input.accountName || null,
      }

      const transaction = await ctx.prisma.transaction.create({
        data: createData,
      })

      // Update budget category spent amount if it's an expense
      if (input.type === TransactionType.EXPENSE) {
        // Find current budget and category
        const currentBudget = await ctx.prisma.budget.findFirst({
          where: {
            userId: ctx.session.user.id,
            startDate: { lte: input.date },
            endDate: { gte: input.date },
          },
          include: {
            categories: {
              where: {
                name: input.category,
              },
            },
          },
        })

        if (currentBudget && currentBudget.categories.length > 0) {
          const category = currentBudget.categories[0]
          if (category) {
            await ctx.prisma.budgetCategory.update({
              where: { id: category.id },
              data: {
                spentAmount: {
                  increment: input.amount,
                },
              },
            })
          }
        }
      }

      return transaction
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive().optional(),
        description: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        type: z.nativeEnum(TransactionType).optional(),
        date: z.date().optional(),
        accountName: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const updateData: {
        amount?: number
        description?: string
        category?: string
        type?: TransactionType
        date?: Date
        accountName?: string
        tags?: string[]
      } = {}
      if (data.amount !== undefined) updateData.amount = data.amount
      if (data.description !== undefined)
        updateData.description = data.description
      if (data.category !== undefined) updateData.category = data.category
      if (data.type !== undefined) updateData.type = data.type
      if (data.date !== undefined) updateData.date = data.date
      if (data.accountName !== undefined)
        updateData.accountName = data.accountName
      if (data.tags !== undefined) updateData.tags = data.tags

      return ctx.prisma.transaction.update({
        where: { id, userId: ctx.session.user.id },
        data: updateData,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the transaction to update budget if needed
      const transaction = await ctx.prisma.transaction.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      })

      if (transaction && transaction.type === TransactionType.EXPENSE) {
        // Update budget category spent amount
        const currentBudget = await ctx.prisma.budget.findFirst({
          where: {
            userId: ctx.session.user.id,
            startDate: { lte: transaction.date },
            endDate: { gte: transaction.date },
          },
          include: {
            categories: {
              where: {
                name: transaction.category,
              },
            },
          },
        })

        if (currentBudget && currentBudget.categories.length > 0) {
          const category = currentBudget.categories[0]
          if (category) {
            await ctx.prisma.budgetCategory.update({
              where: { id: category.id },
              data: {
                spentAmount: {
                  decrement: parseFloat(transaction.amount.toString()),
                },
              },
            })
          }
        }
      }

      return ctx.prisma.transaction.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      })
    }),

  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const transactions = await ctx.prisma.transaction.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    })

    return transactions.map(t => t.category)
  }),

  getSpendingByCategory: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: {
        userId: string
        type: TransactionType
        date?: {
          gte?: Date
          lte?: Date
        }
      } = {
        userId: ctx.session.user.id,
        type: TransactionType.EXPENSE,
      }

      if (input.startDate || input.endDate) {
        where.date = {}
        if (input.startDate) where.date.gte = input.startDate
        if (input.endDate) where.date.lte = input.endDate
      }

      const transactions = await ctx.prisma.transaction.findMany({
        where,
      })

      const categorySpending = transactions.reduce(
        (acc: Record<string, number>, transaction: Transaction) => {
          const category = transaction.category
          const amount = parseFloat(transaction.amount.toString())

          if (!acc[category]) {
            acc[category] = 0
          }
          acc[category] += amount
          return acc
        },
        {}
      )

      return Object.entries(categorySpending).map(([category, amount]) => ({
        category,
        amount,
      }))
    }),

  importFromCSV: protectedProcedure
    .input(
      z.object({
        transactions: z.array(
          z.object({
            amount: z.number(),
            description: z.string(),
            category: z.string(),
            type: z.nativeEnum(TransactionType),
            date: z.date(),
            accountName: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createManyData = input.transactions.map(t => ({
        ...t,
        userId: ctx.session.user.id,
        tags: [],
        accountName: t.accountName || null,
      }))

      const results = await ctx.prisma.transaction.createMany({
        data: createManyData,
      })

      return results
    }),
})
