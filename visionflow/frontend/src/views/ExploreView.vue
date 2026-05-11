<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <div class="mb-6">
      <h1 class="page-title">
        <span class="text-indigo-500 flex-shrink-0" v-html="icon('explore', 'w-7 h-7')" />
        Explore
      </h1>
      <p class="text-slate-500 mt-1">Goals and progress shared by the community</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
    </div>

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

      <div class="columns-2 sm:columns-3 lg:columns-4 gap-4">
        <!-- Goal completion items -->
        <div
          v-for="goal in doneGoals"
          :key="'goal-' + goal._id"
          class="break-inside-avoid mb-4 group cursor-pointer rounded-xl overflow-hidden relative"
        >
          <!-- With image: text overlay -->
          <div v-if="goal.donePhoto || goal.imageData" class="relative overflow-hidden">
            <img
              :src="(goal.donePhoto || goal.imageData)!"
              class="w-full object-cover block group-hover:scale-105 transition-transform duration-300"
              style="max-height:500px;max-width:100%;"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-500/90 px-2 py-0.5 rounded-full mb-1">
                <span v-html="icon('checkCircle', 'w-3 h-3')" />Done
              </span>
              <p class="text-sm font-semibold text-white leading-snug drop-shadow">{{ goal.title }}</p>
              <div class="flex items-center justify-between mt-1.5">
                <router-link :to="`/users/${(goal.user as any)?._id}`" @click.stop class="text-xs text-white/75 font-medium hover:text-white transition-colors">{{ (goal.user as any)?.username || '' }}</router-link>
                <span class="text-xs text-white/60">{{ goal.doneAt ? formatDate(goal.doneAt) : '' }}</span>
              </div>
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
                <router-link :to="`/users/${(goal.user as any)?._id}`" @click.stop class="text-xs text-white/75 hover:text-white transition-colors">{{ (goal.user as any)?.username || '' }}</router-link>
                <span class="text-xs text-white/60">{{ goal.doneAt ? formatDate(goal.doneAt) : '' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Public task progress photos -->
        <div
          v-for="photo in taskPhotos"
          :key="'task-' + photo.taskId + photo.date"
          class="break-inside-avoid mb-4 group cursor-pointer rounded-xl overflow-hidden relative"
        >
          <div class="relative overflow-hidden">
            <img
              :src="photo.photoData"
              class="w-full object-cover block group-hover:scale-105 transition-transform duration-300"
              style="max-height:500px;max-width:100%;"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <span class="inline-block text-xs font-semibold text-white bg-indigo-500/90 px-2 py-0.5 rounded-full mb-1">
                📈 {{ photo.progressPercent }}%
              </span>
              <p class="text-sm font-semibold text-white leading-snug drop-shadow">{{ photo.taskTitle }}</p>
              <p v-if="photo.goalTitle" class="text-xs text-white/60 mt-0.5 truncate">{{ photo.goalTitle }}</p>
              <div class="flex items-center justify-between mt-1.5">
                <router-link :to="`/users/${photo.userId}`" @click.stop class="text-xs text-white/75 font-medium hover:text-white transition-colors">{{ photo.username }}</router-link>
                <span class="text-xs text-white/60">{{ formatDate(photo.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import client from '../api/client'
import type { Goal } from '../types/Goal'
import { icon } from '../utils/icons'

const loading = ref(false)
const doneGoals = ref<Goal[]>([])

interface TaskPhoto {
  taskId: string; taskTitle: string; goalTitle?: string
  userId: string; username: string; date: string; photoData: string; progressPercent: number
}
const taskPhotos = ref<TaskPhoto[]>([])

const allItems = computed(() => [...doneGoals.value, ...taskPhotos.value])

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const catGradient = (cat: string) => ({
  Health: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
  Career: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
  Finance: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
  Education: 'bg-gradient-to-br from-purple-400 to-purple-600',
  Personal: 'bg-gradient-to-br from-pink-400 to-pink-600',
  Other: 'bg-gradient-to-br from-slate-400 to-slate-600',
}[cat] || 'bg-gradient-to-br from-slate-400 to-slate-600')

const catIcon = (cat: string) => ({ Health: 'checkCircle', Career: 'progress', Finance: 'bolt', Education: 'clipboard', Personal: 'hand', Other: 'goals' }[cat] || 'goals') as Parameters<typeof icon>[0]

onMounted(async () => {
  loading.value = true
  try {
    const [goalsRes, photosRes] = await Promise.all([
      client.get('/goals/public-done'),
      client.get('/tasks/public-photos'),
    ])
    doneGoals.value = goalsRes.data
    taskPhotos.value = (photosRes.data as any[]).map(p => ({
      taskId: p.taskId,
      taskTitle: p.taskTitle,
      goalTitle: p.goal?.title,
      userId: p.user?._id || '',
      username: p.user?.username || '',
      date: p.date,
      photoData: p.photoData,
      progressPercent: p.progressPercent,
    }))
  } finally {
    loading.value = false
  }
})
</script>
