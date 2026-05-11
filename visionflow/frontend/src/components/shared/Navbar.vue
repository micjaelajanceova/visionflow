<template>
  <nav class="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <router-link to="/dashboard" class="flex items-center gap-2.5 font-bold text-xl text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" class="w-7 h-7">
            <defs>
              <linearGradient id="vf-nav-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#6366f1"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
            </defs>
            <rect width="36" height="36" rx="9" fill="url(#vf-nav-bg)"/>
            <circle cx="18" cy="18" r="11" fill="none" stroke="white" stroke-width="1.8" opacity="0.4"/>
            <circle cx="18" cy="18" r="7" fill="none" stroke="white" stroke-width="1.8" opacity="0.7"/>
            <circle cx="18" cy="18" r="3.5" fill="none" stroke="white" stroke-width="1.8"/>
            <circle cx="18" cy="18" r="1.5" fill="white"/>
          </svg>
          <span>VisionFlow</span>
        </router-link>

        <!-- Desktop nav -->
        <div v-if="auth.isAuthenticated" class="hidden md:flex items-center gap-1">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            active-class="text-blue-600 bg-blue-50 font-semibold"
          >
            {{ link.label }}
          </router-link>
          <button
            @click="handleLogout"
            class="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer border-0 bg-transparent"
          >
            Logout
          </button>
        </div>

        <!-- Mobile menu button -->
        <button
          v-if="auth.isAuthenticated"
          @click="menuOpen = !menuOpen"
          class="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 border-0 bg-transparent cursor-pointer"
        >
          <span class="text-xl">☰</span>
        </button>

        <div v-if="!auth.isAuthenticated" class="flex items-center gap-2">
          <router-link to="/login" class="btn-secondary btn text-sm">Login</router-link>
          <router-link to="/register" class="btn-primary btn text-sm">Register</router-link>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="menuOpen && auth.isAuthenticated" class="md:hidden pb-3 pt-1 border-t border-slate-100">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          @click="menuOpen = false"
          class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 mb-1"
          active-class="text-blue-600 bg-blue-50"
        >
          {{ link.label }}
        </router-link>
        <button @click="handleLogout" class="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 border-0 bg-transparent cursor-pointer">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/goals', label: 'Goals' },
  { to: '/collage', label: 'Board' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/progress', label: 'Progress' },
  { to: '/journal', label: 'Journal' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/explore', label: 'Explore' },
]

const handleLogout = () => {
  auth.logout()
  menuOpen.value = false
  router.push('/login')
}
</script>
