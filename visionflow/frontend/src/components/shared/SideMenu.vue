<template>
  <!-- Mobile overlay -->
  <div v-if="menuOpen" class="fixed inset-0 bg-black/40 z-30 md:hidden" @click="menuOpen = false" />

  <!-- Mobile toggle -->
  <button
    class="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md rounded-xl p-2.5 border border-slate-100 cursor-pointer"
    @click="menuOpen = !menuOpen"
  >
    <span class="text-indigo-600 text-lg font-bold">{{ menuOpen ? '✕' : '☰' }}</span>
  </button>

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 shadow-sm z-40 flex flex-col transition-transform duration-300"
    :class="menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <!-- Logo -->
    <div class="px-6 py-6 border-b border-slate-100">
      <router-link to="/dashboard" class="flex items-center gap-2.5 font-bold text-xl text-indigo-600" @click="menuOpen = false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" class="w-8 h-8 flex-shrink-0">
          <defs>
            <linearGradient id="vf-side-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#6366f1"/>
              <stop offset="100%" stop-color="#8b5cf6"/>
            </linearGradient>
          </defs>
          <rect width="36" height="36" rx="9" fill="url(#vf-side-bg)"/>
          <circle cx="18" cy="18" r="11" fill="none" stroke="white" stroke-width="1.8" opacity="0.4"/>
          <circle cx="18" cy="18" r="7" fill="none" stroke="white" stroke-width="1.8" opacity="0.7"/>
          <circle cx="18" cy="18" r="3.5" fill="none" stroke="white" stroke-width="1.8"/>
          <circle cx="18" cy="18" r="1.5" fill="white"/>
        </svg>
        <span>VisionFlow</span>
      </router-link>
    </div>

    <!-- Nav links -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <router-link
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        @click="menuOpen = false"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        active-class="text-indigo-600 bg-indigo-50 font-semibold"
      >
        <span class="w-5 h-5 flex-shrink-0 text-indigo-500" v-html="link.icon" />
        <span>{{ link.label }}</span>
      </router-link>

      <router-link
        to="/shared"
        @click="menuOpen = false"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        active-class="text-indigo-600 bg-indigo-50 font-semibold"
      >
        <span class="w-5 h-5 flex-shrink-0 text-indigo-500" v-html="shareNavIcon" />
        <span class="flex-1">Shared Tasks</span>
        <span v-if="pendingCount > 0" class="text-xs font-bold bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
          {{ pendingCount }}
        </span>
      </router-link>
    </nav>

    <!-- User & Logout -->
    <div class="px-3 py-4 border-t border-slate-100">
      <router-link
        v-if="auth.user"
        to="/profile"
        @click="menuOpen = false"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-all group mb-1"
      >
      <!-- Avatar with fallback to first letter of username -->
        <div class="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-indigo-100 flex items-center justify-center ring-1 ring-indigo-200">
          <img v-if="auth.user.avatarUrl" :src="auth.user.avatarUrl" class="w-full h-full object-cover" alt="avatar" />
          <span v-else class="text-sm font-bold text-indigo-500 select-none">
            {{ auth.user.username?.[0]?.toUpperCase() }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-600">{{ auth.user.username }}</div>
          <div class="text-xs text-slate-400">View profile</div>
        </div>
      </router-link>
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer border-0 bg-transparent"
      >
        <span class="w-5 h-5 flex-shrink-0 text-red-400" v-html="iconLogout" />
        <span>Logout</span>
      </button>
    </div>
  </aside>

  <!-- Spacer for desktop -->
  <div class="hidden md:block w-64 flex-shrink-0" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useTaskStore } from '../../stores/taskStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const taskStore = useTaskStore()
const router = useRouter()
const menuOpen = ref(false)

onMounted(async () => {
  if (auth.isAuthenticated) await taskStore.fetchPendingInvites()
})

const pendingCount = computed(() => taskStore.pendingInvites.length)

const svg = (path: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">${path}</svg>`

const navLinks = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: svg('<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />'),
  },
  {
    to: '/goals',
    label: 'Goals',
    icon: svg('<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />'),
  },
  {
    to: '/collage',
    label: 'Vision Board',
    icon: svg('<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />'),
  },
  {
    to: '/calendar',
    label: 'Calendar',
    icon: svg('<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />'),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: svg('<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />'),
  },
  {
    to: '/explore',
    label: 'Explore',
    icon: svg('<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />'),
  },
]

const iconLogout = svg('<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />')
const shareNavIcon = svg('<path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />')

const handleLogout = () => {
  auth.logout()
  menuOpen.value = false
  router.push('/login')
}
</script>
