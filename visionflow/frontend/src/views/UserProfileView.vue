<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <LoadingSpinner v-if="loading" />

    <div v-else-if="!profile" class="text-center py-20 text-slate-400">User not found.</div>

    <div v-else>
      <!-- Header -->
      <div class="flex items-center gap-5 mb-8">
        <UserAvatar :user="profile.user" size="xl" />
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ profile.user.username }}</h1>
          <p class="text-slate-500 mt-0.5">{{ allItems.length }} public post{{ allItems.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="allItems.length === 0" class="text-center py-16 text-slate-400">
        No public posts yet.
      </div>

      <!-- Masonry grid — same as Explore -->
      <div v-else class="columns-2 sm:columns-3 lg:columns-4 gap-4">

        <!-- Completed goals -->
        <div
          v-for="goal in profile.goals"
          :key="'goal-' + goal._id"
          class="break-inside-avoid mb-4 group rounded-xl overflow-hidden relative"
          :class="isOwnProfile ? 'cursor-pointer' : 'cursor-default'"
          @click="handleGoalClick(goal)"
        >
          <div v-if="goal.donePhoto || goal.imageData" class="relative overflow-hidden">
            <img
              :src="(goal.donePhoto || goal.imageData)!"
              class="w-full object-cover block transition-transform duration-300"
              :class="isOwnProfile ? 'group-hover:scale-105' : ''"
              style="max-height:500px;max-width:100%;"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-500/90 px-2 py-0.5 rounded-full mb-1">
                <span v-html="icon('checkCircle', 'w-3 h-3')" />Done
              </span>
              <p class="text-sm font-semibold text-white leading-snug drop-shadow">{{ goal.title }}</p>
              <p class="text-xs text-white/60 mt-1">{{ goal.doneAt ? formatDate(goal.doneAt) : '' }}</p>
              <AdminCardActions
                v-if="isAdmin"
                :show-delete-photo="true"
                :is-blocked="isProfileUserBlocked"
                @delete-photo="adminDeleteGoalPhoto(goal._id)"
                @toggle-block="adminToggleBlock"
              />
            </div>
          </div>

          <div v-else class="relative flex items-end h-44" :class="catGradient(goal.category)">
            <div class="absolute inset-0 flex items-center justify-center opacity-30">
              <span class="text-white text-5xl">{{ catEmoji(goal.category) }}</span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div class="relative p-3 w-full">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-500/90 px-2 py-0.5 rounded-full mb-1">
                <span v-html="icon('checkCircle', 'w-3 h-3')" />Done
              </span>
              <p class="text-sm font-semibold text-white leading-snug">{{ goal.title }}</p>
              <p class="text-xs text-white/60 mt-1">{{ goal.doneAt ? formatDate(goal.doneAt) : '' }}</p>
              <AdminCardActions
                v-if="isAdmin"
                :is-blocked="isProfileUserBlocked"
                @toggle-block="adminToggleBlock"
              />
            </div>
          </div>
        </div>

        <!-- Task completion photos -->
        <div
          v-for="post in profile.posts"
          :key="'post-' + post.taskId + post.date"
          class="break-inside-avoid mb-4 group rounded-xl overflow-hidden relative"
          :class="isOwnProfile && post.goalId ? 'cursor-pointer' : 'cursor-default'"
          @click="handlePostClick(post)"
        >
          <div class="relative overflow-hidden">
            <img
              :src="post.photoData"
              class="w-full object-cover block transition-transform duration-300"
              :class="isOwnProfile && post.goalId ? 'group-hover:scale-105' : ''"
              style="max-height:500px;max-width:100%;"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-500/90 px-2 py-0.5 rounded-full mb-1">
                <span v-html="icon('progress', 'w-3 h-3')" />{{ post.progressPercent }}%
              </span>
              <p class="text-sm font-semibold text-white leading-snug drop-shadow">{{ post.taskTitle }}</p>
              <p v-if="post.goal?.title" class="text-xs text-white/60 mt-0.5 truncate">{{ post.goal.title }}</p>
              <p class="text-xs text-white/50 mt-1">{{ formatDate(post.date) }}</p>
              <AdminCardActions
                v-if="isAdmin"
                :show-delete-photo="true"
                :is-blocked="isProfileUserBlocked"
                @delete-photo="adminDeleteTaskPhoto(post.taskId, post.date)"
                @toggle-block="adminToggleBlock"
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
import { useRoute, useRouter } from 'vue-router'
import client from '../api/client'
import { icon } from '../utils/icons'
import { useAuthStore } from '../stores/authStore'
import { formatDate } from '../utils/dateUtils'
import { useCategoryColors } from '../composables/useCategoryColors'
import LoadingSpinner from '../components/shared/LoadingSpinner.vue'
import UserAvatar from '../components/shared/UserAvatar.vue'
import AdminCardActions from '../components/shared/AdminCardActions.vue'
import type { UserProfile, UserProfilePost, UserProfileGoal } from '../types/UserProfile'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { catGradient, catEmoji } = useCategoryColors()
const loading = ref(true)

const profile = ref<UserProfile | null>(null)
const allItems = computed(() => [...(profile.value?.goals ?? []), ...(profile.value?.posts ?? [])])

const isAdmin = computed(() => !!authStore.user?.isAdmin)
const isProfileUserBlocked = ref(false)

const isOwnProfile = computed(() =>
  !!authStore.user?.id && !!profile.value?.user.id &&
  String(authStore.user.id) === String(profile.value.user.id)
)

const handleGoalClick = (goal: UserProfileGoal) => {
  if (isOwnProfile.value) router.push(`/goals/${goal._id}`)
}

const handlePostClick = (post: UserProfilePost) => {
  if (isOwnProfile.value && post.goalId) router.push(`/goals/${post.goalId}`)
}

const adminDeleteGoalPhoto = async (goalId: string) => {
  if (!confirm('Delete this photo from Explore?')) return
  await client.delete(`/admin/goals/${goalId}/photo`)
  const goal = profile.value?.goals.find(g => g._id === goalId)
  if (goal) { (goal as any).donePhoto = null; (goal as any).imageData = null }
}

const adminDeleteTaskPhoto = async (taskId: string, date: string) => {
  if (!confirm('Delete this photo from Explore?')) return
  await client.delete(`/admin/tasks/${taskId}/photo/${date}`)
  if (profile.value) {
    profile.value.posts = profile.value.posts.filter(p => !(p.taskId === taskId && p.date === date))
  }
}

const adminToggleBlock = async () => {
  const userId = profile.value?.user.id
  const username = profile.value?.user.username
  if (!userId) return
  const shouldBlock = !isProfileUserBlocked.value
  if (!confirm(`${shouldBlock ? 'Block' : 'Unblock'} user ${username}?`)) return
  await client.put(`/admin/users/${userId}/block`, { blocked: shouldBlock })
  isProfileUserBlocked.value = shouldBlock
}

onMounted(async () => {
  try {
    const requests: Promise<any>[] = [client.get(`/users/${route.params.id}/public`)]
    if (authStore.user?.isAdmin) requests.push(client.get('/admin/users'))

    const [profileRes, usersRes] = await Promise.all(requests)
    profile.value = profileRes.data

    if (usersRes) {
      const profileUserId = String(profile.value?.user.id)
      const found = (usersRes.data as any[]).find(u => String(u._id) === profileUserId)
      isProfileUserBlocked.value = found?.isBlocked ?? false
    }
  } catch {
    profile.value = null
  } finally {
    loading.value = false
  }
})
</script>
