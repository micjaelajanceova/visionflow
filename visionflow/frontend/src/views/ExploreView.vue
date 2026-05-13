<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <div class="mb-6">
      <h1 class="page-title">
        <span class="text-indigo-500 flex-shrink-0" v-html="icon('explore', 'w-7 h-7')" />
        Explore
      </h1>
      <p class="text-slate-500 mt-1">Goals and progress shared by the community</p>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="allItems.length === 0" class="text-center py-24">
      <div class="flex justify-center mb-4">
        <span class="text-indigo-200" v-html="icon('trophy', 'w-20 h-20')" />
      </div>
      <h3 class="text-xl font-semibold text-slate-700 mb-2">Nothing shared yet</h3>
      <p class="text-slate-400">Complete goals or tasks and share them publicly to appear here!</p>
    </div>

    <!-- Pinterest-style masonry grid -->
    <div v-else>
      <p class="text-xs text-slate-400 mb-6">{{ allItems.length }} item{{ allItems.length !== 1 ? 's' : '' }} shared</p>

      <div class="pt-3 columns-2 sm:columns-3 lg:columns-4 gap-4">
        <!-- Goal completion items -->
        <div
          v-for="goal in doneGoals"
          :key="'goal-' + goal._id"
          class="break-inside-avoid mb-4 group rounded-xl overflow-hidden relative"
          :class="isMyId(goal.user?._id) ? 'cursor-pointer' : 'cursor-default'"
          @click="handleGoalClick(goal)"
        >
          <!-- With image: text overlay -->
          <div v-if="goal.donePhoto || goal.imageData" class="relative overflow-hidden">
            <img
              :src="(goal.donePhoto || goal.imageData)!"
              class="w-full object-cover block transition-transform duration-300"
              :class="isMyId(goal.user?._id) ? 'group-hover:scale-105' : ''"
              style="max-height:500px;max-width:100%;"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-500/90 px-2 py-0.5 rounded-full mb-1">
                <span v-html="icon('checkCircle', 'w-3 h-3')" />Done
              </span>
              <p class="text-sm font-semibold text-white leading-snug drop-shadow">{{ goal.title }}</p>
              <div class="flex items-center justify-between mt-1.5">
                <router-link :to="`/users/${goal.user?._id}`" @click.stop class="text-xs text-white/75 font-medium hover:text-white transition-colors">{{ goal.user?.username || '' }}</router-link>
                <span class="text-xs text-white/60">{{ goal.doneAt ? formatDate(goal.doneAt) : '' }}</span>
              </div>
              <AdminCardActions
                v-if="isAdmin"
                :show-delete-photo="true"
                :is-blocked="isBlocked(goal.user?._id ?? '')"
                @delete-photo="adminDeleteGoalPhoto(goal._id)"
                @toggle-block="adminToggleBlock(goal.user?._id ?? '', goal.user?.username ?? '')"
              />
            </div>
          </div>

          <!-- Without image: gradient card with text overlay -->
          <div v-else class="relative flex items-end h-44" :class="catGradient(goal.category)">
            <div class="absolute inset-0 flex items-center justify-center opacity-30">
              <span class="text-white" v-html="icon(catIcon(goal.category), 'w-16 h-16')" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div class="relative p-3 w-full">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-500/90 px-2 py-0.5 rounded-full mb-1">
                <span v-html="icon('checkCircle', 'w-3 h-3')" />Done
              </span>
              <p class="text-sm font-semibold text-white leading-snug">{{ goal.title }}</p>
              <div class="flex items-center justify-between mt-1">
                <router-link :to="`/users/${goal.user?._id}`" @click.stop class="text-xs text-white/75 hover:text-white transition-colors">{{ goal.user?.username || '' }}</router-link>
                <span class="text-xs text-white/60">{{ goal.doneAt ? formatDate(goal.doneAt) : '' }}</span>
              </div>
              <AdminCardActions
                v-if="isAdmin"
                :is-blocked="isBlocked(goal.user?._id ?? '')"
                @toggle-block="adminToggleBlock(goal.user?._id ?? '', goal.user?.username ?? '')"
              />
            </div>
          </div>
        </div>

        <!-- Public task progress photos -->
        <div
          v-for="photo in taskPhotos"
          :key="'task-' + photo.taskId + photo.date"
          class="break-inside-avoid mb-4 group rounded-xl overflow-hidden relative"
          :class="isMyId(photo.userId) && photo.goalId ? 'cursor-pointer' : 'cursor-default'"
          @click="handlePhotoClick(photo)"
        >
          <div class="relative overflow-hidden">
            <img
              :src="photo.photoData"
              class="w-full object-cover block transition-transform duration-300"
              :class="isMyId(photo.userId) && photo.goalId ? 'group-hover:scale-105' : ''"
              style="max-height:500px;max-width:100%;"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-500/90 px-2 py-0.5 rounded-full mb-1">
                <span v-html="icon('progress', 'w-3 h-3')" />{{ photo.progressPercent }}%
              </span>
              <p class="text-sm font-semibold text-white leading-snug drop-shadow">{{ photo.taskTitle }}</p>
              <p v-if="photo.goalTitle" class="text-xs text-white/60 mt-0.5 truncate">{{ photo.goalTitle }}</p>
              <div class="flex items-center justify-between mt-1.5">
                <router-link :to="`/users/${photo.userId}`" @click.stop class="text-xs text-white/75 font-medium hover:text-white transition-colors">{{ photo.username }}</router-link>
                <span class="text-xs text-white/60">{{ formatDate(photo.date) }}</span>
              </div>
              <AdminCardActions
                v-if="isAdmin"
                :show-delete-photo="true"
                :is-blocked="isBlocked(photo.userId)"
                @delete-photo="adminDeleteTaskPhoto(photo.taskId, photo.date)"
                @toggle-block="adminToggleBlock(photo.userId, photo.username)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '../api/client'
import type { Goal } from '../types/Goal'
import { icon } from '../utils/icons'
import { useAuthStore } from '../stores/authStore'
import { formatDate } from '../utils/dateUtils'
import { useCategoryColors } from '../composables/useCategoryColors'
import { useCurrentUser } from '../composables/useCurrentUser'
import LoadingSpinner from '../components/shared/LoadingSpinner.vue'
import AdminCardActions from '../components/shared/AdminCardActions.vue'

const router = useRouter()
const authStore = useAuthStore()
const { isMyId } = useCurrentUser()
const { catGradient, catIcon } = useCategoryColors()
const loading = ref(false)
const doneGoals = ref<Goal[]>([])

interface TaskPhoto {
  taskId: string; taskTitle: string; goalTitle?: string; goalId?: string
  userId: string; username: string; date: string; photoData: string; progressPercent: number
}
const taskPhotos = ref<TaskPhoto[]>([])

const isAdmin = computed(() => !!authStore.user?.isAdmin)
const blockedUserIds = ref<Set<string>>(new Set())

const isBlocked = (userId: string) => blockedUserIds.value.has(userId)

const adminDeleteTaskPhoto = async (taskId: string, date: string) => {
  if (!confirm('Delete this photo from Explore?')) return
  await client.delete(`/admin/tasks/${taskId}/photo/${date}`)
  taskPhotos.value = taskPhotos.value.filter(p => !(p.taskId === taskId && p.date === date))
}

const adminDeleteGoalPhoto = async (goalId: string) => {
  if (!confirm('Delete this photo from Explore?')) return
  await client.delete(`/admin/goals/${goalId}/photo`)
  const g = doneGoals.value.find(g => g._id === goalId)
  if (g) { (g as any).donePhoto = null; (g as any).isDonePublic = false }
  doneGoals.value = doneGoals.value.filter(g => g._id !== goalId || g.imageData)
}

const adminToggleBlock = async (userId: string, username: string) => {
  const shouldBlock = !isBlocked(userId)
  if (!confirm(`${shouldBlock ? 'Block' : 'Unblock'} user ${username}?`)) return
  await client.put(`/admin/users/${userId}/block`, { blocked: shouldBlock })
  const next = new Set(blockedUserIds.value)
  shouldBlock ? next.add(userId) : next.delete(userId)
  blockedUserIds.value = next
}

const handleGoalClick = (goal: Goal) => {
  if (isMyId(goal.user?._id)) router.push(`/goals/${goal._id}`)
}

const handlePhotoClick = (photo: TaskPhoto) => {
  if (isMyId(photo.userId) && photo.goalId) router.push(`/goals/${photo.goalId}`)
}

const allItems = computed(() => [...doneGoals.value, ...taskPhotos.value])

onMounted(async () => {
  loading.value = true
  try {
    const requests: Promise<any>[] = [
      client.get('/goals/public-done'),
      client.get('/tasks/public-photos'),
    ]
    if (authStore.user?.isAdmin) requests.push(client.get('/admin/users'))

    const [goalsRes, photosRes, usersRes] = await Promise.all(requests)
    doneGoals.value = goalsRes.data
    taskPhotos.value = (photosRes.data as any[]).map(p => ({
      taskId: p.taskId,
      taskTitle: p.taskTitle,
      goalTitle: p.goal?.title,
      goalId: p.goalId,
      userId: p.user?._id || '',
      username: p.user?.username || '',
      date: p.date,
      photoData: p.photoData,
      progressPercent: p.progressPercent,
    }))
    if (usersRes) {
      blockedUserIds.value = new Set(
        (usersRes.data as any[]).filter(u => u.isBlocked).map(u => String(u._id))
      )
    }
  } finally {
    loading.value = false
  }
})
</script>
