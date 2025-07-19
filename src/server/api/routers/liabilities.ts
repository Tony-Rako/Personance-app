import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'

export const liabilityRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.liability.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        balance: 'desc',
      },
    })
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        balance: z.number().positive(),
        interestRate: z.number().min(0).max(100).optional(),
        minimumPayment: z.number().positive().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data: any = {
        name: input.name,
        type: input.type,
        balance: input.balance,
        userId: ctx.session.user.id,
      }
      if (input.interestRate !== undefined) data.interestRate = input.interestRate
      if (input.minimumPayment !== undefined) data.minimumPayment = input.minimumPayment
      if (input.dueDate !== undefined) data.dueDate = input.dueDate
      
      return ctx.prisma.liability.create({
        data,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        type: z.string().min(1).optional(),
        balance: z.number().positive().optional(),
        interestRate: z.number().min(0).max(100).optional(),
        minimumPayment: z.number().positive().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.type !== undefined) updateData.type = data.type
      if (data.balance !== undefined) updateData.balance = data.balance
      if (data.interestRate !== undefined) updateData.interestRate = data.interestRate
      if (data.minimumPayment !== undefined) updateData.minimumPayment = data.minimumPayment
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate
      
      return ctx.prisma.liability.update({
        where: { id, userId: ctx.session.user.id },
        data: updateData,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.liability.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      })
    }),

  getTotalBalance: protectedProcedure.query(async ({ ctx }) => {
    const liabilities = await ctx.prisma.liability.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })

    return liabilities.reduce((total: number, liability: any) => {
      return total + parseFloat(liability.balance.toString())
    }, 0)
  }),

  getByType: protectedProcedure.query(async ({ ctx }) => {
    const liabilities = await ctx.prisma.liability.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })

    const liabilitiesByType = liabilities.reduce((acc: Record<string, { totalBalance: number; count: number; liabilities: any[] }>, liability: any) => {
      const type = liability.type
      const balance = parseFloat(liability.balance.toString())
      
      if (!acc[type]) {
        acc[type] = { totalBalance: 0, count: 0, liabilities: [] }
      }
      acc[type].totalBalance += balance
      acc[type].count += 1
      acc[type].liabilities.push(liability)
      return acc
    }, {} as Record<string, { totalBalance: number; count: number; liabilities: any[] }>)

    return liabilitiesByType
  }),

  getPayoffProjection: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const liability = await ctx.prisma.liability.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      })

      if (!liability || !liability.minimumPayment || !liability.interestRate) {
        return null
      }

      const balance = parseFloat(liability.balance.toString())
      const monthlyPayment = parseFloat(liability.minimumPayment.toString())
      const annualRate = parseFloat(liability.interestRate.toString()) / 100
      const monthlyRate = annualRate / 12

      if (monthlyRate === 0) {
        return {
          monthsToPayoff: Math.ceil(balance / monthlyPayment),
          totalInterest: 0,
          totalPayments: balance,
        }
      }

      const monthsToPayoff = Math.ceil(
        -Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate)
      )

      const totalPayments = monthsToPayoff * monthlyPayment
      const totalInterest = totalPayments - balance

      return {
        monthsToPayoff,
        totalInterest,
        totalPayments,
      }
    }),
})