/**
 * Counts how many times a recurring task should occur between its start date
 * and the goal's target date (or today if no goal is linked).
 * Used to calculate completion percentage on Progress and Explore pages.
 */
export function countOccurrences(task: any): number {
  if (!task.isRecurring || !task.recurringDays?.length || !task.startDate) return 1

  const start = new Date(task.startDate)
  const end = task.goal?.targetDate ? new Date(task.goal.targetDate) : new Date()
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    const day = (cur.getDay() + 6) % 7 // convert to Mon=0 ... Sun=6
    if (task.recurringDays.includes(day)) count++
    cur.setDate(cur.getDate() + 1)
  }

  return count || 1 // always return at least 1 to avoid division by zero
}
