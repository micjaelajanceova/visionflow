<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 px-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-16 h-16">
            <defs>
              <linearGradient id="vf-reg-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#6366f1"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#vf-reg-bg)"/>
            <circle cx="24" cy="24" r="15" fill="none" stroke="white" stroke-width="2.2" opacity="0.4"/>
            <circle cx="24" cy="24" r="9.5" fill="none" stroke="white" stroke-width="2.2" opacity="0.7"/>
            <circle cx="24" cy="24" r="4.5" fill="none" stroke="white" stroke-width="2.2"/>
            <circle cx="24" cy="24" r="2" fill="white"/>
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
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
          <input v-model="confirmPassword" type="password" placeholder="Repeat your password" required class="input"
            :class="confirmPassword && password !== confirmPassword ? 'border-red-400 focus:ring-red-400' : ''" />
          <p v-if="confirmPassword && password !== confirmPassword" class="text-red-500 text-xs mt-1">Passwords do not match</p>
        </div>

        <p v-if="error" class="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn-success btn w-full text-base py-3 mt-2">
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="text-center text-sm text-slate-500 mt-6">
        Already have an account?
        <router-link to="/login" class="text-indigo-600 font-medium hover:underline">Sign in</router-link>
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
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
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
