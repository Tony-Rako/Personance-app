import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import { z } from 'zod'

export const netWorthRouter = createTRPCRouter({
  // Get current net worth snapshot
  getCurrentNetWorth: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Get current assets and liabilities
    const [assets, liabilities] = await Promise.all([
      ctx.prisma.asset.findMany({
        where: { userId },
      }),
      ctx.prisma.liability.findMany({
        where: { userId },
      }),
    ])

    const totalAssets = assets.reduce(
      (sum, asset) => sum + Number(asset.value),
      0
    )
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + Number(liability.balance),
      0
    )
    const netWorth = totalAssets - totalLiabilities

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      assetCount: assets.length,
      liabilityCount: liabilities.length,
    }
  }),

  // Get historical net worth data
  getNetWorthHistory: protectedProcedure
    .input(
      z.object({
        period: z.enum(['6M', '1Y', 'ALL']).default('6M'),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Calculate date range based on period
      const now = new Date()
      let startDate: Date

      switch (input.period) {
        case '6M':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 6,
            now.getDate()
          )
          break
        case '1Y':
          startDate = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate()
          )
          break
        case 'ALL':
          startDate = new Date(2020, 0, 1) // Far back enough to get all data
          break
      }

      const snapshots = await ctx.prisma.netWorthSnapshot.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      })

      // If no historical data, create current snapshot
      if (snapshots.length === 0) {
        const currentNetWorth = await ctx.prisma.asset
          .findMany({
            where: { userId },
          })
          .then(async assets => {
            const liabilities = await ctx.prisma.liability.findMany({
              where: { userId },
            })

            const totalAssets = assets.reduce(
              (sum, asset) => sum + Number(asset.value),
              0
            )
            const totalLiabilities = liabilities.reduce(
              (sum, liability) => sum + Number(liability.balance),
              0
            )

            return {
              totalAssets,
              totalLiabilities,
              netWorth: totalAssets - totalLiabilities,
            }
          })

        // Return current data as single point
        return [
          {
            date: now,
            totalAssets: currentNetWorth.totalAssets,
            totalLiabilities: currentNetWorth.totalLiabilities,
            netWorth: currentNetWorth.netWorth,
          },
        ]
      }

      return snapshots.map(snapshot => ({
        date: snapshot.date,
        totalAssets: Number(snapshot.totalAssets),
        totalLiabilities: Number(snapshot.totalLiabilities),
        netWorth: Number(snapshot.netWorth),
      }))
    }),

  // Create a net worth snapshot
  createSnapshot: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Get current assets and liabilities
    const [assets, liabilities] = await Promise.all([
      ctx.prisma.asset.findMany({
        where: { userId },
      }),
      ctx.prisma.liability.findMany({
        where: { userId },
      }),
    ])

    const totalAssets = assets.reduce(
      (sum, asset) => sum + Number(asset.value),
      0
    )
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + Number(liability.balance),
      0
    )
    const netWorth = totalAssets - totalLiabilities

    // Use upsert to atomically create or update snapshot for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return await ctx.prisma.netWorthSnapshot.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        totalAssets,
        totalLiabilities,
        netWorth,
      },
      create: {
        userId,
        date: today,
        totalAssets,
        totalLiabilities,
        netWorth,
      },
    })
  }),

  // Get net worth performance metrics
  getPerformanceMetrics: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Get snapshots from last year for comparison
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const [currentNetWorth, yearAgoSnapshot, allSnapshots] = await Promise.all([
      // Get current net worth
      ctx.prisma.asset
        .findMany({
          where: { userId },
        })
        .then(async assets => {
          const liabilities = await ctx.prisma.liability.findMany({
            where: { userId },
          })

          const totalAssets = assets.reduce(
            (sum, asset) => sum + Number(asset.value),
            0
          )
          const totalLiabilities = liabilities.reduce(
            (sum, liability) => sum + Number(liability.balance),
            0
          )

          return totalAssets - totalLiabilities
        }),

      // Get snapshot from one year ago (closest available)
      ctx.prisma.netWorthSnapshot.findFirst({
        where: {
          userId,
          date: {
            lte: oneYearAgo,
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),

      // Get all snapshots for trend analysis
      ctx.prisma.netWorthSnapshot.findMany({
        where: { userId },
        orderBy: {
          date: 'asc',
        },
      }),
    ])

    let yearlyGrowth = 0
    let yearlyGrowthAmount = 0

    if (yearAgoSnapshot) {
      const previousNetWorth = Number(yearAgoSnapshot.netWorth)
      if (previousNetWorth > 0) {
        yearlyGrowth =
          ((currentNetWorth - previousNetWorth) / previousNetWorth) * 100
        yearlyGrowthAmount = currentNetWorth - previousNetWorth
      }
    }

    // Calculate monthly growth trend
    let monthlyTrend = 'stable'
    if (allSnapshots.length >= 2) {
      const recent = allSnapshots.slice(-2)
      const growth =
        Number(recent[1]?.netWorth ?? 0) - Number(recent[0]?.netWorth ?? 0)
      if (growth > 0) monthlyTrend = 'up'
      else if (growth < 0) monthlyTrend = 'down'
    }

    return {
      currentNetWorth,
      yearlyGrowth,
      yearlyGrowthAmount,
      monthlyTrend,
      snapshotCount: allSnapshots.length,
    }
  }),

  // Get wealth insights based on real data
  getWealthInsights: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const [assets, liabilities, expenses] = await Promise.all([
      ctx.prisma.asset.findMany({ where: { userId } }),
      ctx.prisma.liability.findMany({ where: { userId } }),
      ctx.prisma.expense.findMany({ where: { userId } }),
    ])

    const insights = []

    // Calculate portfolio allocation
    const totalAssets = assets.reduce(
      (sum, asset) => sum + Number(asset.value),
      0
    )
    const realEstateValue = assets
      .filter(asset => asset.type === 'REAL_ESTATE')
      .reduce((sum, asset) => sum + Number(asset.value), 0)

    const realEstatePercentage =
      totalAssets > 0 ? (realEstateValue / totalAssets) * 100 : 0

    // Portfolio diversification insight
    if (realEstatePercentage > 70) {
      insights.push({
        type: 'warning',
        title: 'High Real Estate Concentration',
        description: `Real estate makes up ${realEstatePercentage.toFixed(1)}% of your assets. Consider diversifying into other investment types.`,
      })
    } else if (realEstatePercentage < 30 && realEstateValue > 0) {
      insights.push({
        type: 'positive',
        title: 'Well-Diversified Portfolio',
        description: `Good diversification with ${realEstatePercentage.toFixed(1)}% in real estate and other investments.`,
      })
    }

    // Emergency fund analysis
    const cashAssets = assets
      .filter(asset => asset.type === 'CASH_EQUIVALENTS')
      .reduce((sum, asset) => sum + Number(asset.value), 0)

    const monthlyExpenses = expenses.reduce((sum, expense) => {
      const amount = Number(expense.amount)
      switch (expense.frequency) {
        case 'yearly':
          return sum + amount / 12
        case 'weekly':
          return sum + amount * 4.33
        case 'bi-weekly':
          return sum + amount * 2.17
        default:
          return sum + amount
      }
    }, 0)

    if (monthlyExpenses > 0) {
      const emergencyFundMonths = cashAssets / monthlyExpenses
      if (emergencyFundMonths < 3) {
        insights.push({
          type: 'warning',
          title: 'Emergency Fund Below Target',
          description: `You have ${emergencyFundMonths.toFixed(1)} months of expenses saved. Aim for 3-6 months.`,
        })
      } else if (emergencyFundMonths >= 6) {
        insights.push({
          type: 'positive',
          title: 'Strong Emergency Fund',
          description: `Excellent! You have ${emergencyFundMonths.toFixed(1)} months of expenses saved.`,
        })
      }
    }

    // High-interest debt warning
    const highInterestDebt = liabilities.filter(
      liability => liability.interestRate && Number(liability.interestRate) > 15
    )

    if (highInterestDebt.length > 0) {
      const totalHighInterestDebt = highInterestDebt.reduce(
        (sum, debt) => sum + Number(debt.balance),
        0
      )
      insights.push({
        type: 'warning',
        title: 'High-Interest Debt Detected',
        description: `You have $${totalHighInterestDebt.toLocaleString()} in high-interest debt. Consider prioritizing payoff.`,
      })
    }

    // Net worth growth potential
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + Number(liability.balance),
      0
    )
    const netWorth = totalAssets - totalLiabilities

    if (netWorth > 0 && insights.length === 0) {
      insights.push({
        type: 'positive',
        title: 'Strong Financial Foundation',
        description: `Your net worth of $${netWorth.toLocaleString()} shows excellent financial progress. Keep it up!`,
      })
    }

    return insights
  }),
})
