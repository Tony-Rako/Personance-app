import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/trpc'
import { TRPCError } from '@trpc/server'

// Helper function to remove undefined values from object
function removeUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const result: Partial<T> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key as keyof T] = value
    }
  }
  return result
}

const userProfileSchema = z.object({
  age: z.number().min(18).max(100).nullable().optional(),
  occupation: z.string().nullable().optional(),
  householdSize: z.number().min(1).max(20).nullable().optional(),
  numberOfDependents: z.number().min(0).max(10).nullable().optional(),
  annualIncomeRange: z
    .enum([
      'UNDER_25K',
      'RANGE_25K_50K',
      'RANGE_50K_75K',
      'RANGE_75K_100K',
      'RANGE_100K_150K',
      'RANGE_150K_250K',
      'OVER_250K',
    ])
    .nullable()
    .optional(),
  financialExperience: z
    .enum(['BEGINNER', 'SOME_EXPERIENCE', 'EXPERIENCED', 'VERY_EXPERIENCED'])
    .nullable()
    .optional(),
  riskTolerance: z
    .enum([
      'VERY_CONSERVATIVE',
      'CONSERVATIVE',
      'MODERATE',
      'AGGRESSIVE',
      'VERY_AGGRESSIVE',
    ])
    .nullable()
    .optional(),
  investmentTimeHorizon: z
    .enum(['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'])
    .nullable()
    .optional(),
  primaryFinancialGoals: z.array(z.string()).optional(),
  financialConcerns: z.array(z.string()).optional(),
  preferredCurrency: z.string().default('USD'),
  notificationsEnabled: z.boolean().default(true),
})

const onboardingAssetSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    'REAL_ESTATE',
    'INVESTMENTS',
    'CASH_EQUIVALENTS',
    'STOCKS_FUNDS_CDS',
    'BUSINESS',
    'PERSONAL_PROPERTY',
  ]),
  value: z.number().min(0),
})

const onboardingLiabilitySchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  balance: z.number().min(0),
  interestRate: z.number().min(0).max(100).nullable().optional(),
})

const onboardingExpenseSchema = z.object({
  category: z.string().min(1),
  amount: z.number().min(0),
})

const completeOnboardingSchema = z.object({
  profile: userProfileSchema,
  assets: z.array(onboardingAssetSchema).optional(),
  liabilities: z.array(onboardingLiabilitySchema).optional(),
  monthlyExpenses: z.array(onboardingExpenseSchema).optional(),
})

export const onboardingRouter = createTRPCRouter({
  getOnboardingStatus: publicProcedure.query(async ({ ctx }) => {
    // If no session, user needs to authenticate first
    if (!ctx.session || !ctx.session.user) {
      return {
        completed: false,
        currentStep: 0,
        hasProfile: false,
        needsAuth: true,
      }
    }
    const user = await ctx.prisma.user.findUnique({
      where: { id: (ctx.session.user as { id: string }).id },
      select: {
        onboardingCompleted: true,
        onboardingStep: true,
        userProfile: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    return {
      completed: user.onboardingCompleted,
      currentStep: user.onboardingStep,
      hasProfile: !!user.userProfile,
      needsAuth: false,
    }
  }),

  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    })

    return profile
  }),

  updateOnboardingStep: protectedProcedure
    .input(z.object({ step: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { onboardingStep: input.step },
      })

      return { success: true }
    }),

  saveUserProfile: protectedProcedure
    .input(userProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // Remove undefined values for Prisma compatibility
      const cleanedInput = removeUndefined(input)

      const profile = await ctx.prisma.userProfile.upsert({
        where: { userId: ctx.session.user.id },
        create: {
          userId: ctx.session.user.id,
          ...cleanedInput,
        },
        update: cleanedInput,
      })

      return profile
    }),

  completeOnboarding: protectedProcedure
    .input(completeOnboardingSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      try {
        // Start a transaction to ensure all data is saved atomically
        const result = await ctx.prisma.$transaction(async tx => {
          // 1. Save or update user profile
          // Remove undefined values for Prisma compatibility
          const cleanedProfile = removeUndefined(input.profile)

          const profile = await tx.userProfile.upsert({
            where: { userId },
            create: {
              userId,
              ...cleanedProfile,
            },
            update: cleanedProfile,
          })

          // 2. Create assets if provided
          if (input.assets && input.assets.length > 0) {
            await tx.asset.createMany({
              data: input.assets.map(asset => ({
                ...asset,
                userId,
              })),
            })
          }

          // 3. Create liabilities if provided
          if (input.liabilities && input.liabilities.length > 0) {
            await tx.liability.createMany({
              data: input.liabilities.map(liability => ({
                ...removeUndefined(liability),
                userId,
              })),
            })
          }

          // 4. Create monthly expenses if provided
          if (input.monthlyExpenses && input.monthlyExpenses.length > 0) {
            await tx.expense.createMany({
              data: input.monthlyExpenses.map(expense => ({
                ...expense,
                userId,
                frequency: 'monthly',
              })),
            })
          }

          // 5. Create default "Escape the Rat Race" goal if no goals exist
          const existingGoals = await tx.financialGoal.count({
            where: { userId },
          })

          if (existingGoals === 0) {
            await tx.financialGoal.create({
              data: {
                userId,
                name: 'Escape the Rat Race',
                type: 'RETIREMENT',
                targetAmount: 1000000, // Default $1M target
                description:
                  'Achieve financial freedom and escape the traditional 9-5 work cycle through smart investing and wealth building.',
              },
            })
          }

          // 6. Mark onboarding as completed
          await tx.user.update({
            where: { id: userId },
            data: {
              onboardingCompleted: true,
              onboardingStep: 0, // Reset step counter
            },
          })

          return { profile, success: true }
        })

        return result
      } catch (error) {
        console.error('Error completing onboarding:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to complete onboarding. Please try again.',
        })
      }
    }),

  resetOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.session.user.id },
      data: {
        onboardingCompleted: false,
        onboardingStep: 0,
      },
    })

    return { success: true }
  }),
})
