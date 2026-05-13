import { useAuthStore } from '../stores/authStore'

/**
 * Composable for current-user identity checks.
 * Wraps the string/ObjectId comparison in one place so views
 * don't repeat the String() casting pattern themselves.
 */
export function useCurrentUser() {
  const authStore = useAuthStore()

  /**
   * Returns true if the given id (string or Mongoose ObjectId) belongs
   * to the currently logged-in user. Safe against type mismatches.
   */
  const isMyId = (id: unknown): boolean =>
    !!authStore.user?.id && String(id) === String(authStore.user.id)

  return { authStore, isMyId }
}
