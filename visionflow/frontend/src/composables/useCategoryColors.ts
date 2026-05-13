/**
 * Composable that provides category → colour mappings.
 * Single source of truth — used in GoalCard, ProgressView, ExploreView,
 * UserProfileView and CalendarView instead of repeating the maps everywhere.
 */
export function useCategoryColors() {
  /** Solid dot colour (used beside goal titles in Progress page) */
  const catDot = (cat: string): string => ({
    Health: 'bg-emerald-500', Career: 'bg-indigo-500', Finance: 'bg-yellow-500',
    Education: 'bg-purple-500', Personal: 'bg-pink-500', Other: 'bg-slate-400',
  }[cat] ?? 'bg-slate-400')

  /** Progress bar fill colour */
  const catBar = (cat: string): string => ({
    Health: 'bg-emerald-500', Career: 'bg-indigo-500', Finance: 'bg-yellow-500',
    Education: 'bg-purple-500', Personal: 'bg-pink-500', Other: 'bg-slate-400',
  }[cat] ?? 'bg-indigo-500')

  /** Top-stripe / accent colour on GoalCard */
  const catColor = (cat: string): string => ({
    Health: 'bg-emerald-400', Career: 'bg-indigo-400', Finance: 'bg-yellow-400',
    Education: 'bg-purple-400', Personal: 'bg-pink-400', Other: 'bg-slate-300',
  }[cat] ?? 'bg-slate-300')

  /** Soft badge colour (text + background) */
  const catBadge = (cat: string): string => ({
    Health: 'bg-emerald-100 text-emerald-700', Career: 'bg-indigo-100 text-indigo-700',
    Finance: 'bg-yellow-100 text-yellow-700', Education: 'bg-purple-100 text-purple-700',
    Personal: 'bg-pink-100 text-pink-700', Other: 'bg-slate-100 text-slate-600',
  }[cat] ?? 'bg-slate-100 text-slate-600')

  /** Gradient background for cards without images (Explore, UserProfile) */
  const catGradient = (cat: string): string => ({
    Health: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    Career: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
    Finance: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    Education: 'bg-gradient-to-br from-purple-400 to-purple-600',
    Personal: 'bg-gradient-to-br from-pink-400 to-pink-600',
    Other: 'bg-gradient-to-br from-slate-400 to-slate-600',
  }[cat] ?? 'bg-gradient-to-br from-slate-400 to-slate-600')

  /** Emoji representation of a category */
  const catEmoji = (cat: string): string =>
    ({ Health: '💪', Career: '💼', Finance: '💰', Education: '📚', Personal: '✨', Other: '🎯' }[cat] ?? '🎯')

  /** Icon name for a category (used on Explore gradient cards) */
  const catIcon = (cat: string) =>
    ({ Health: 'checkCircle', Career: 'progress', Finance: 'bolt', Education: 'clipboard', Personal: 'hand', Other: 'goals' }[cat] ?? 'goals') as 'checkCircle' | 'progress' | 'bolt' | 'clipboard' | 'hand' | 'goals'

  return { catDot, catBar, catColor, catBadge, catGradient, catEmoji, catIcon }
}
