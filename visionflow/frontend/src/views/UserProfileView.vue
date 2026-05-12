<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
    </div>

    <div v-else-if="!profile" class="text-center py-20 text-slate-400">User not found.</div>

    <div v-else>
      <!-- Header -->
      <div class="flex items-center gap-5 mb-8">
        <div class="w-20 h-20 rounded-full flex-shrink-0 overflow-hidden bg-indigo-100 flex items-center justify-center ring-2 ring-indigo-200">
          <img v-if="profile.user.avatarUrl" :src="profile.user.avatarUrl" class="w-full h-full object-cover" alt="avatar" />
          <span v-else class="text-3xl font-bold text-indigo-500 select-none">
            {{ profile.user.username[0]?.toUpperCase() }}
          </span>
        </div>
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
          class="break-inside-avoid mb-4 group cursor-pointer rounded-xl overflow-hidden relative"
        >
          <div v-if="goal.donePhoto || goal.imageData" class="relative overflow-hidden">
            <img
              :src="(goal.donePhoto || goal.imageData)!"
              class="w-full object-cover block group-hover:scale-105 transition-transform duration-300"
              style="max-height:500px;max-width:100%;"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-500/90 px-2 py-0.5 rounded-full mb-1">
                ✓ Done
              </span>
              <p class="text-sm font-semibold text-white leading-snug drop-shadow">{{ goal.title }}</p>
              <p class="text-xs text-white/60 mt-1">{{ goal.doneAt ? formatDate(goal.doneAt) : '' }}</p>
            </div>
          </div>

          <div v-else class="relative flex items-end h-44" :class="catGradient(goal.category)">
            <div class="absolute inset-0 flex items-center justify-center opacity-30">
              <span class="text-white text-5xl">{{ catEmoji(goal.category) }}</span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div class="relative p-3 w-full">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-500/90 px-2 py-0.5 rounded-full mb-1">
                ✓ Done
              </span>
              <p class="text-sm font-semibold text-white leading-snug">{{ goal.title }}</p>
              <p class="text-xs text-white/60 mt-1">{{ goal.doneAt ? formatDate(goal.doneAt) : '' }}</p>
            </div>
          </div>
        </div>

        <!-- Task completion photos -->
        <div
          v-for="post in profile.posts"
          :key="'post-' + post.taskId + post.date"
          class="break-inside-avoid mb-4 group cursor-pointer rounded-xl overflow-hidden relative"
        >
          <div class="relative overflow-hidden">
            <img
              :src="post.photoData"
              class="w-full object-cover block group-hover:scale-105 transition-transform duration-300"
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
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '../api/client'
import { icon } from '../utils/icons'

const route = useRoute()
const loading = ref(true)

interface Post {
  taskId: string
  taskTitle: string
  goal?: { title: string; category: string }
  date: string
  photoData: string
  completedCount: number
  progressPercent: number
}

interface GoalItem {
  _id: string
  title: string
  category: string
  imageData?: string
  donePhoto?: string
  doneAt?: string
}

interface Profile {
  user: { id: string; username: string; avatarUrl?: string }
  posts: Post[]
  goals: GoalItem[]
}

const profile = ref<Profile | null>(null)
const allItems = computed(() => [...(profile.value?.goals ?? []), ...(profile.value?.posts ?? [])])

onMounted(async () => {
  try {
    const { data } = await client.get(`/users/${route.params.id}/public`)
    profile.value = data
  } catch {
    profile.value = null
  } finally {
    loading.value = false
  }
})

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

const catGradient = (cat: string) => ({
  Health: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
  Career: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
  Finance: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
  Education: 'bg-gradient-to-br from-purple-400 to-purple-600',
  Personal: 'bg-gradient-to-br from-pink-400 to-pink-600',
  Other: 'bg-gradient-to-br from-slate-400 to-slate-600',
}[cat] || 'bg-gradient-to-br from-slate-400 to-slate-600')

const catEmoji = (cat: string) => ({ Health: '💪', Career: '💼', Finance: '💰', Education: '📚', Personal: '✨', Other: '🎯' }[cat] || '🎯')
</script>
