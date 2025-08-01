/**
 * Utility functions for managing net worth snapshots
 */

export const shouldCreateSnapshot = (): boolean => {
  const lastSnapshot = localStorage.getItem('lastSnapshotDate')
  const today = new Date().toDateString()

  return lastSnapshot !== today
}

export const markSnapshotCreated = (): void => {
  const today = new Date().toDateString()
  localStorage.setItem('lastSnapshotDate', today)
}

export const getSnapshotFrequency = (): 'daily' | 'weekly' | 'manual' => {
  return (
    (localStorage.getItem('snapshotFrequency') as
      | 'daily'
      | 'weekly'
      | 'manual') || 'daily'
  )
}

export const setSnapshotFrequency = (
  frequency: 'daily' | 'weekly' | 'manual'
): void => {
  localStorage.setItem('snapshotFrequency', frequency)
}

export const shouldCreateWeeklySnapshot = (): boolean => {
  const lastSnapshot = localStorage.getItem('lastWeeklySnapshot')
  const today = new Date()
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  if (!lastSnapshot) return true

  const lastDate = new Date(lastSnapshot)
  return lastDate < oneWeekAgo
}

export const markWeeklySnapshotCreated = (): void => {
  const today = new Date().toISOString()
  localStorage.setItem('lastWeeklySnapshot', today)
}
