/**
 * Shared date formatting utilities used across the app.
 * Centralised here so all views display dates consistently.
 */

/** Short format: "12 Jan 2025" — used in lists, cards, feeds */
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** Long format: "12 January 2025" — used in goal detail headings */
export const formatDateLong = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/** Returns how many days ago a date was (positive = past, negative = future) */
export const daysOverdue = (dateStr: string): number =>
  Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
