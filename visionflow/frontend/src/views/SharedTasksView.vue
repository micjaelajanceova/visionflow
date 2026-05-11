<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-0 py-8">
    <div class="mb-8">
      <h1 class="page-title">
        <span class="text-indigo-500 flex-shrink-0" v-html="shareIcon" />
        Shared Tasks
      </h1>
      <p class="text-slate-500 mt-1">Tasks others have shared with you.</p>
    </div>

    <!-- Pending invites -->
    <div class="mb-8">
      <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Pending Invites</h2>

      <div v-if="loading" class="text-slate-400 text-sm">Loading…</div>

      <div v-else-if="taskStore.pendingInvites.length === 0" class="card text-center text-slate-400 text-sm py-8">
        No pending invites
      </div>

      <div v-else class="space-y-3">
        <div v-for="task in taskStore.pendingInvites" :key="task._id" class="card flex items-start gap-4">
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-slate-800">{{ task.title }}</p>
            <p v-if="task.description" class="text-sm text-slate-500 mt-0.5">{{ task.description }}</p>
            <p class="text-xs text-slate-400 mt-1">
              From <span class="font-medium text-slate-600">{{ (task as any).user?.username || 'someone' }}</span>
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

    <!-- Accepted shared tasks -->
    <div>
      <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Shared With Me</h2>

      <div v-if="sharedTasks.length === 0" class="card text-center text-slate-400 text-sm py-8">
        No accepted shared tasks yet
      </div>

      <div v-else class="space-y-3">
        <div v-for="task in sharedTasks" :key="task._id" class="card flex items-center gap-3">
          <div class="w-2 h-2 rounded-full flex-shrink-0" :class="task.completed ? 'bg-emerald-400' : 'bg-indigo-400'" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-800" :class="task.completed ? 'line-through text-slate-400' : ''">
              {{ task.title }}
            </p>
            <p v-if="task.dueDate" class="text-xs text-slate-400">{{ formatDate(task.dueDate) }}</p>
          </div>
          <span class="text-xs text-slate-400 bg-indigo-50 text-indigo-500 rounded-full px-2 py-0.5">shared</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'

const taskStore = useTaskStore()
const auth = useAuthStore()
const loading = ref(true)
const responding = ref<string | null>(null)

onMounted(async () => {
  await taskStore.fetchPendingInvites()
  loading.value = false
})

const sharedTasks = computed(() =>
  taskStore.tasks.filter(t =>
    t.participants?.some(p => p.userId === auth.user?.id && p.accepted)
  )
)

const respond = async (taskId: string, accept: boolean) => {
  responding.value = taskId
  try {
    await taskStore.respondToInvite(taskId, accept)
  } finally {
    responding.value = null
  }
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

const shareIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>`
</script>
