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
        <h1 class="text-3xl font-bold text-slate-900">Get started</h1>
        <p class="text-slate-500 mt-1">Create your VisionFlow account</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input v-model="username" placeholder="johndoe" required class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input v-model="email" type="email" placeholder="you@example.com" required class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input v-model="password" type="password" placeholder="Min. 6 characters" required minlength="6" class="input" />
        </div>

        <p v-if="error" class="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn-success btn w-full text-base py-3 mt-2">
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="text-center text-sm text-slate-500 mt-6">
        Already have an account?
        <router-link to="/login" class="text-blue-600 font-medium hover:underline">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.register(username.value, email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
