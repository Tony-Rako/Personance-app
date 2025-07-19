import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import { AssetType, type Asset } from '@prisma/client'

export const assetRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.asset.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        type: 'asc',
      },
    })
  }),

  getByType: protectedProcedure.query(async ({ ctx }) => {
    const assets = await ctx.prisma.asset.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })

    const assetsByType = assets.reduce(
      (acc, asset) => {
        const type = asset.type
        const value = parseFloat(asset.value.toString())

        if (!acc[type]) {
          acc[type] = { totalValue: 0, count: 0, assets: [] }
        }
        acc[type].totalValue += value
        acc[type].count += 1
        acc[type].assets.push(asset)
        return acc
      },
      {} as Record<
        AssetType,
        { totalValue: number; count: number; assets: Asset[] }
      >
    )

    return assetsByType
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.nativeEnum(AssetType),
        value: z.number().positive(),
        costBasis: z.number().positive().optional(),
        growth: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data: {
        name: string
        type: AssetType
        value: number
        userId: string
        costBasis?: number
        growth?: number
      } = {
        name: input.name,
        type: input.type,
        value: input.value,
        userId: ctx.session.user.id,
      }
      if (input.costBasis !== undefined) data.costBasis = input.costBasis
      if (input.growth !== undefined) data.growth = input.growth

      return ctx.prisma.asset.create({
        data,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        type: z.nativeEnum(AssetType).optional(),
        value: z.number().positive().optional(),
        costBasis: z.number().positive().optional(),
        growth: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const updateData: {
        lastUpdated: Date
        name?: string
        type?: AssetType
        value?: number
        costBasis?: number
        growth?: number
      } = { lastUpdated: new Date() }
      if (data.name !== undefined) updateData.name = data.name
      if (data.type !== undefined) updateData.type = data.type
      if (data.value !== undefined) updateData.value = data.value
      if (data.costBasis !== undefined) updateData.costBasis = data.costBasis
      if (data.growth !== undefined) updateData.growth = data.growth

      return ctx.prisma.asset.update({
        where: { id, userId: ctx.session.user.id },
        data: updateData,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.asset.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      })
    }),

  getTotalValue: protectedProcedure.query(async ({ ctx }) => {
    const assets = await ctx.prisma.asset.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })

    return assets.reduce((total, asset) => {
      return total + parseFloat(asset.value.toString())
    }, 0)
  }),

  getPortfolioAllocation: protectedProcedure.query(async ({ ctx }) => {
    const assets = await ctx.prisma.asset.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })

    const totalValue = assets.reduce(
      (sum, asset) => sum + parseFloat(asset.value.toString()),
      0
    )

    const allocation = Object.values(AssetType)
      .map(type => {
        const typeAssets = assets.filter(asset => asset.type === type)
        const typeValue = typeAssets.reduce(
          (sum, asset) => sum + parseFloat(asset.value.toString()),
          0
        )

        return {
          type,
          value: typeValue,
          percentage: totalValue > 0 ? (typeValue / totalValue) * 100 : 0,
          count: typeAssets.length,
        }
      })
      .filter(item => item.value > 0)

    return { allocation, totalValue }
  }),
})
