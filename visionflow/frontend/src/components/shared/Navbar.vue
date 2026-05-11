<template>
  <nav class="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <router-link to="/dashboard" class="flex items-center gap-2.5 font-bold text-xl text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" class="w-7 h-7">
            <rect width="36" height="36" rx="8" fill="#2563eb"/>
            <path d="M8 11 L18 27 L28 11" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="18" cy="27" r="2.5" fill="#93c5fd"/>
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
