import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'

export const expenseRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.expense.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }),

  create: protectedProcedure
    .input(
      z.object({
        category: z.string().min(1),
        amount: z.number().positive(),
        frequency: z.enum(['monthly', 'yearly', 'weekly', 'bi-weekly']).default('monthly'),
        isRecurring: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.expense.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        category: z.string().min(1).optional(),
        amount: z.number().positive().optional(),
        frequency: z.enum(['monthly', 'yearly', 'weekly', 'bi-weekly']).optional(),
        isRecurring: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const updateData: any = {}
      if (data.category !== undefined) updateData.category = data.category
      if (data.amount !== undefined) updateData.amount = data.amount
      if (data.frequency !== undefined) updateData.frequency = data.frequency
      if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring
      
      return ctx.prisma.expense.update({
        where: { id, userId: ctx.session.user.id },
        data: updateData,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.expense.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      })
    }),

  getTotalMonthly: protectedProcedure.query(async ({ ctx }) => {
    const expenses = await ctx.prisma.expense.findMany({
      where: {
        userId: ctx.session.user.id,
        isRecurring: true,
      },
    })

    return expenses.reduce((total, expense) => {
      const amount = parseFloat(expense.amount.toString())
      switch (expense.frequency) {
        case 'yearly':
          return total + amount / 12
        case 'weekly':
          return total + amount * 4.33
        case 'bi-weekly':
          return total + amount * 2.17
        default:
          return total + amount
      }
    }, 0)
  }),

  getByCategory: protectedProcedure.query(async ({ ctx }) => {
    const expenses = await ctx.prisma.expense.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })

    const categories = expenses.reduce((acc, expense) => {
      const category = expense.category
      const amount = parseFloat(expense.amount.toString())
      
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
    }))
  }),
})