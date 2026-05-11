import { useAuthStore } from '../stores/authStore'
import type { Task, TaskUser } from '../types/Task'

export interface SharedPerson {
  avatarUrl?: string
  username: string
}

export function useTaskSharing() {
  const auth = useAuthStore()

  function getSharedWith(task: Task): SharedPerson[] {
    const currentUserId = auth.user?.id
    const owner = task.user
    const ownerId = typeof owner === 'string' ? owner : (owner as TaskUser)._id

    if (ownerId === currentUserId) {
      return task.participants
        .filter(p => p.accepted)
        .map(p => {
          const u = p.userId
          if (typeof u === 'string') return { username: p.email }
          return { avatarUrl: (u as TaskUser).avatarUrl, username: (u as TaskUser).username }
        })
    } else {
      if (typeof owner === 'string') return []
      const o = owner as TaskUser
      return [{ avatarUrl: o.avatarUrl, username: o.username }]
    }
  }

  function isShared(task: Task): boolean {
    const currentUserId = auth.user?.id
    const owner = task.user
    const ownerId = typeof owner === 'string' ? owner : (owner as TaskUser)._id
    if (ownerId !== currentUserId) return true
    return task.participants?.some(p => p.accepted) ?? false
  }

  return { getSharedWith, isShared }
}
