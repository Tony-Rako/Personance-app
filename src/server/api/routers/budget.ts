import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'

export const budgetRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.budget.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        categories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }),

  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date()
    return ctx.prisma.budget.findFirst({
      where: {
        userId: ctx.session.user.id,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        categories: true,
      },
    })
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        totalAmount: z.number().positive(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.budget.create({
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
        name: z.string().min(1).optional(),
        totalAmount: z.number().positive().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const updateData: {
        name?: string
        totalAmount?: number
        startDate?: Date
        endDate?: Date
      } = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.totalAmount !== undefined)
        updateData.totalAmount = data.totalAmount
      if (data.startDate !== undefined) updateData.startDate = data.startDate
      if (data.endDate !== undefined) updateData.endDate = data.endDate

      return ctx.prisma.budget.update({
        where: { id, userId: ctx.session.user.id },
        data: updateData,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.budget.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      })
    }),
})

export const budgetCategoryRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ budgetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.budgetCategory.findMany({
        where: {
          userId: ctx.session.user.id,
          budgetId: input.budgetId,
        },
        orderBy: {
          name: 'asc',
        },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        budgetId: z.string(),
        name: z.string().min(1),
        allocatedAmount: z.number().positive(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.budgetCategory.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          color: input.color || '#3B82F6',
        },
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        allocatedAmount: z.number().positive().optional(),
        spentAmount: z.number().min(0).optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const updateData: {
        name?: string
        allocatedAmount?: number
        spentAmount?: number
        color?: string
      } = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.allocatedAmount !== undefined)
        updateData.allocatedAmount = data.allocatedAmount
      if (data.spentAmount !== undefined)
        updateData.spentAmount = data.spentAmount
      if (data.color !== undefined) updateData.color = data.color

      return ctx.prisma.budgetCategory.update({
        where: { id, userId: ctx.session.user.id },
        data: updateData,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.budgetCategory.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      })
    }),

  updateSpentAmount: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        spentAmount: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.budgetCategory.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: { spentAmount: input.spentAmount },
      })
    }),
})
