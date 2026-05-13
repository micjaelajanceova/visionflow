<template>
  <div class="card mb-5 border-indigo-200">
    <h2 class="text-base font-semibold text-slate-800 mb-4">Username</h2>
    <form @submit.prevent="save" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
        <input v-model="username" class="input" placeholder="Your username" required minlength="2" />
      </div>
      <p v-if="error"   class="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{{ error }}</p>
      <p v-if="success" class="text-emerald-600 text-sm bg-emerald-50 rounded-xl px-4 py-2">{{ success }}</p>
      <button type="submit" class="btn-primary btn text-sm" :disabled="loading">
        {{ loading ? 'Saving…' : 'Save username' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()
const username = ref(auth.user?.username ?? '')
const loading = ref(false)
const error = ref('')
const success = ref('')

// Submit username update request, handle success and error states
const save = async () => {
  loading.value = true; error.value = ''; success.value = ''
  try {
    await auth.updateProfile({ username: username.value })
    success.value = 'Username updated!'
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update username.'
  } finally {
    loading.value = false
  }
}
</script>
