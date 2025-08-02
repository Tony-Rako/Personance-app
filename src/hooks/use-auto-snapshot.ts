import { useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import {
  shouldCreateSnapshot,
  markSnapshotCreated,
  getSnapshotFrequency,
  shouldCreateWeeklySnapshot,
  markWeeklySnapshotCreated,
} from '@/lib/snapshot-utils'

export const useAutoSnapshot = () => {
  const createSnapshotMutation = trpc.networth.createSnapshot.useMutation()
  const utils = trpc.useUtils()

  useEffect(() => {
    let hasRun = false

    const attemptAutoSnapshot = async () => {
      if (hasRun || createSnapshotMutation.isPending) {
        return // Prevent multiple simultaneous calls
      }

      hasRun = true

      try {
        const frequency = getSnapshotFrequency()

        if (frequency === 'manual') {
          return // Don't auto-create snapshots in manual mode
        }

        let shouldCreate = false

        if (frequency === 'daily' && shouldCreateSnapshot()) {
          shouldCreate = true
        } else if (frequency === 'weekly' && shouldCreateWeeklySnapshot()) {
          shouldCreate = true
        }

        if (shouldCreate) {
          await createSnapshotMutation.mutateAsync()

          // Mark snapshot as created
          if (frequency === 'daily') {
            markSnapshotCreated()
          } else if (frequency === 'weekly') {
            markWeeklySnapshotCreated()
          }

          // Invalidate related queries to refresh the UI
          utils.networth.getNetWorthHistory.invalidate()
          utils.networth.getPerformanceMetrics.invalidate()
        }
      } catch {
        // Silently fail - we don't want to interrupt the user experience
      }
    }

    // Create snapshot on component mount (when user visits wealth page)
    attemptAutoSnapshot()
  }, [createSnapshotMutation, utils])

  return {
    isCreatingSnapshot: createSnapshotMutation.isPending,
    createManualSnapshot: async () => {
      try {
        await createSnapshotMutation.mutateAsync()
        markSnapshotCreated()
        utils.networth.getNetWorthHistory.invalidate()
        utils.networth.getPerformanceMetrics.invalidate()
        return { success: true }
      } catch (error: unknown) {
        return { success: false, error }
      }
    },
  }
}
