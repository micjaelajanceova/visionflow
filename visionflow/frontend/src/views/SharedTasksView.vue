<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <div class="mb-8">
      <h1 class="page-title">
        <span class="text-indigo-500 flex-shrink-0" v-html="icon('share', 'w-7 h-7')" />
        Shared Tasks
      </h1>
      <p class="text-slate-500 mt-1">Manage your task collaborations - invites, shared with you, and shared by you.</p>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else>
      <!-- Pending invites -->
      <div class="mb-8">
        <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Pending Invites</h2>

        <div v-if="taskStore.pendingInvites.length === 0" class="card text-center text-slate-400 text-sm py-8">
          No pending invites
        </div>

        <div v-else class="space-y-3">
          <div v-for="task in taskStore.pendingInvites" :key="task._id" class="card flex items-start gap-4">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-800">{{ task.title }}</p>
              <p v-if="task.description" class="text-sm text-slate-500 mt-0.5">{{ task.description }}</p>
              <p class="text-xs text-slate-400 mt-1">
                From <span class="font-medium text-slate-600">{{ typeof task.user === 'string' ? 'someone' : task.user.username }}</span>
                <span v-if="task.dueDate"> · {{ formatDate(task.dueDate) }}</span>
              </p>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button
                @click="respond(task._id, true)"
                class="btn btn-success text-xs py-1.5 px-3"
                :disabled="responding === task._id"
              >Accept</button>
              <button
                @click="respond(task._id, false)"
                class="btn btn-secondary text-xs py-1.5 px-3 text-red-500 hover:text-red-600"
                :disabled="responding === task._id"
              >Decline</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Shared with others -->
      <div class="mb-8">
        <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Shared With Others</h2>

        <div v-if="sharedWithOthers.length === 0" class="card text-center text-slate-400 text-sm py-8">
          No tasks shared with others
        </div>

        <div v-else class="space-y-3">
          <div v-for="task in sharedWithOthers" :key="task._id" class="card">
            <p class="font-semibold text-slate-800 mb-3">{{ task.title }}</p>
            <div class="space-y-2">
              <div
                v-for="p in task.acceptedParticipants"
                :key="p.userId"
                class="flex items-center justify-between gap-2"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <UserAvatar :user="{ username: p.username ?? undefined, avatarUrl: p.avatarUrl ?? undefined }" size="xs" />
                  <span class="text-sm text-slate-700 truncate">{{ p.username || p.email }}</span>
                </div>
                <button
                  @click="removeParticipantFromTask(task._id, p.userId)"
                  :disabled="removing === task._id + p.userId"
                  class="btn btn-secondary text-xs py-1 px-3 text-red-500 hover:text-red-600 flex-shrink-0"
                >{{ removing === task._id + p.userId ? '…' : 'Remove' }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Shared with me -->
      <div>
        <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Shared With Me</h2>

        <div v-if="sharedWithMe.length === 0" class="card text-center text-slate-400 text-sm py-8">
          No accepted shared tasks
        </div>

        <div v-else class="space-y-3">
          <div v-for="task in sharedWithMe" :key="task._id" class="card flex items-start gap-4">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-800">{{ task.title }}</p>
              <p v-if="task.description" class="text-sm text-slate-500 mt-0.5">{{ task.description }}</p>
              <p class="text-xs text-slate-400 mt-1">
                From <span class="font-medium text-slate-600">{{ typeof task.user === 'string' ? 'someone' : task.user.username }}</span>
                <span v-if="task.dueDate"> · {{ formatDate(task.dueDate) }}</span>
              </p>
            </div>
            <button
              @click="leaveShared(task._id)"
              :disabled="leaving === task._id"
              class="btn btn-secondary text-xs py-1.5 px-3 text-red-500 hover:text-red-600 flex-shrink-0"
            >{{ leaving === task._id ? '…' : 'Leave' }}</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useCurrentUser } from '../composables/useCurrentUser'
import { formatDate } from '../utils/dateUtils'
import { icon } from '../utils/icons'
import LoadingSpinner from '../components/shared/LoadingSpinner.vue'
import UserAvatar from '../components/shared/UserAvatar.vue'

const taskStore = useTaskStore()
const { isMyId } = useCurrentUser()
const loading = ref(true)
const responding = ref<string | null>(null)
const leaving = ref<string | null>(null)
const removing = ref<string | null>(null)

onMounted(async () => {
  await Promise.all([taskStore.fetchPendingInvites(), taskStore.fetchTasks()])
  loading.value = false
})

// Tasks I own that have at least one accepted participant
const sharedWithOthers = computed(() =>
  taskStore.tasks
    .filter(t => {
      const ownerId = typeof t.user === 'string' ? t.user : (t.user as any)?._id
      return isMyId(ownerId) && (t.participants ?? []).some((p: any) => p.accepted)
    })
    .map(t => ({
      ...t,
      acceptedParticipants: (t.participants ?? [])
        .filter((p: any) => p.accepted)
        .map((p: any) => ({
          userId: typeof p.userId === 'string' ? p.userId : p.userId?._id,
          username: p.userId?.username ?? null,
          avatarUrl: p.userId?.avatarUrl ?? null,
          email: p.email,
        })),
    }))
)

// Tasks owned by someone else that I have accepted
const sharedWithMe = computed(() =>
  taskStore.tasks.filter(t => {
    const ownerId = typeof t.user === 'string' ? t.user : (t.user as any)?._id
    if (isMyId(ownerId)) return false
    return (t.participants ?? []).some((p: any) => {
      const pId = typeof p.userId === 'string' ? p.userId : p.userId?._id
      return isMyId(pId) && p.accepted
    })
  })
)

const removeParticipantFromTask = async (taskId: string, userId: string) => {
  removing.value = taskId + userId
  try {
    await taskStore.removeParticipant(taskId, userId)
  } finally {
    removing.value = null
  }
}

const leaveShared = async (taskId: string) => {
  leaving.value = taskId
  try {
    await taskStore.leaveTask(taskId)
  } finally {
    leaving.value = null
  }
}

const respond = async (taskId: string, accept: boolean) => {
  responding.value = taskId
  try {
    await taskStore.respondToInvite(taskId, accept)
  } finally {
    responding.value = null
  }
}
</script>
