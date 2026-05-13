import { useAuthStore } from '../stores/authStore'
import type { Task, TaskUser } from '../types/Task'

export interface SharedPerson {
  userId?: string
  avatarUrl?: string
  username: string
}

export function useTaskSharing() {
  const auth = useAuthStore()

  // Helper to resolve a user ID from either a string or a TaskUser object
  function resolveId(val: string | TaskUser | unknown): string {
    if (!val) return ''
    if (typeof val === 'string') return val
    return (val as TaskUser)._id ?? String(val)
  }

  // Get the current user's ID from the auth store
  function currentUserId(): string {
    const u = auth.user as any
    return u?.id || u?._id || ''
  }

  // Determine if the task is shared with others and the current user is either the owner or an accepted participant
  function isShared(task: Task): boolean {
    const myId = currentUserId()
    if (!myId) return false
    const ownerId = resolveId(task.user)
    if (ownerId === myId) {
      return task.participants?.some(p => p.accepted) ?? false
    }
    return task.participants?.some(p => resolveId(p.userId) === myId && p.accepted) ?? false
  }

  // Get a list of people the task is shared with, including the owner and accepted participants.
  function getSharedWith(task: Task): SharedPerson[] {
    const people: SharedPerson[] = []
    const seen = new Set<string>()
    const myId = currentUserId()

    const add = (person: SharedPerson, id: string) => {
      if (seen.has(id)) return
      seen.add(id)
      people.push(person)
    }

    // Always show current user first
    if (auth.user && myId) {
      add({ userId: myId, avatarUrl: auth.user.avatarUrl, username: auth.user.username }, myId)
    }

    // Owner
    const ownerId = resolveId(task.user)
    if (typeof task.user !== 'string') {
      const o = task.user as TaskUser
      add({ userId: ownerId, avatarUrl: o.avatarUrl, username: o.username }, ownerId)
    }

    // Accepted participants
    for (const p of (task.participants ?? [])) {
      if (!p.accepted) continue
      const pId = resolveId(p.userId)
      if (typeof p.userId !== 'string') {
        const u = p.userId as TaskUser
        add({ userId: pId, avatarUrl: u.avatarUrl, username: u.username }, pId)
      } else {
        add({ userId: pId, username: p.email }, pId)
      }
    }

    return people
  }

  return { getSharedWith, isShared }
}
