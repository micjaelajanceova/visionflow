<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 px-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-16 h-16">
            <rect width="48" height="48" rx="12" fill="#2563eb"/>
            <path d="M10 14 L24 36 L38 14" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="24" cy="36" r="3.5" fill="#93c5fd"/>
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
        <router-link to="/register" class="text-blue-600 font-medium hover:underline">Create one</router-link>
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
