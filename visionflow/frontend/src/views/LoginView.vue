<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 px-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-16 h-16">
            <defs>
              <linearGradient id="vf-login-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#6366f1"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#vf-login-bg)"/>
            <circle cx="24" cy="24" r="15" fill="none" stroke="white" stroke-width="2.2" opacity="0.4"/>
            <circle cx="24" cy="24" r="9.5" fill="none" stroke="white" stroke-width="2.2" opacity="0.7"/>
            <circle cx="24" cy="24" r="4.5" fill="none" stroke="white" stroke-width="2.2"/>
            <circle cx="24" cy="24" r="2" fill="white"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-slate-900">VisionFlow</h1>
        <p class="text-slate-500 mt-1">Welcome back! Sign in to continue.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input v-model="email" type="email" placeholder="you@example.com" required class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input v-model="password" type="password" placeholder="••••••••" required class="input" />
        </div>

        <p v-if="error" class="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn-primary btn w-full text-base py-3 mt-2">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="text-center text-sm text-slate-500 mt-6">
        No account yet?
        <router-link to="/register" class="text-indigo-600 font-medium hover:underline">Create one</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Login failed. Check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>
