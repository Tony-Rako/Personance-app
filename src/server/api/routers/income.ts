import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'

export const incomeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.income.findMany({
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
        source: z.string().min(1),
        amount: z.number().positive(),
        frequency: z.enum(['monthly', 'yearly', 'weekly', 'bi-weekly']).default('monthly'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.income.create({
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
        source: z.string().min(1).optional(),
        amount: z.number().positive().optional(),
        frequency: z.enum(['monthly', 'yearly', 'weekly', 'bi-weekly']).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const updateData: any = {}
      if (data.source !== undefined) updateData.source = data.source
      if (data.amount !== undefined) updateData.amount = data.amount
      if (data.frequency !== undefined) updateData.frequency = data.frequency
      if (data.isActive !== undefined) updateData.isActive = data.isActive
      
      return ctx.prisma.income.update({
        where: { id, userId: ctx.session.user.id },
        data: updateData,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.income.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      })
    }),

  getTotalMonthly: protectedProcedure.query(async ({ ctx }) => {
    const incomes = await ctx.prisma.income.findMany({
      where: {
        userId: ctx.session.user.id,
        isActive: true,
      },
    })

    return incomes.reduce((total, income) => {
      const amount = parseFloat(income.amount.toString())
      switch (income.frequency) {
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
})