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
          <p class="text-slate-500 mt-0.5">{{ profile.posts.length }} public post{{ profile.posts.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="profile.posts.length === 0" class="text-center py-16 text-slate-400">
        No public posts yet.
      </div>

      <!-- Posts grid -->
      <div v-else class="columns-2 sm:columns-3 gap-4">
        <div
          v-for="post in profile.posts"
          :key="post.taskId + post.date"
          class="break-inside-avoid mb-4 rounded-xl overflow-hidden relative group"
        >
          <img
            :src="post.photoData"
            class="w-full object-cover block group-hover:scale-105 transition-transform duration-300"
            style="max-height:400px;"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-3">
            <p class="text-sm font-semibold text-white leading-snug drop-shadow">{{ post.taskTitle }}</p>
            <p v-if="post.goal?.title" class="text-xs text-white/60 mt-0.5 truncate">{{ post.goal.title }}</p>
            <p class="text-xs text-white/50 mt-1">{{ formatDate(post.date) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import client from '../api/client'

const route = useRoute()
const loading = ref(true)

interface Post {
  taskId: string
  taskTitle: string
  goal?: { title: string; category: string }
  date: string
  photoData: string
}

interface Profile {
  user: { id: string; username: string; avatarUrl?: string }
  posts: Post[]
}

const profile = ref<Profile | null>(null)

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
</script>
