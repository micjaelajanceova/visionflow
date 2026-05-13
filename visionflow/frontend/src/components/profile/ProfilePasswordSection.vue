<template>
  <div class="card border-indigo-200">
    <h2 class="text-base font-semibold text-slate-800 mb-4">Change Password</h2>
    <form @submit.prevent="save" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Current password</label>
        <input v-model="currentPassword" type="password" class="input" placeholder="••••••••" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">New password</label>
        <input v-model="newPassword" type="password" class="input" placeholder="Min. 6 characters" required minlength="6" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Confirm new password</label>
        <input v-model="confirmPassword" type="password" class="input" placeholder="••••••••" required />
      </div>
      <p v-if="error"   class="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{{ error }}</p>
      <p v-if="success" class="text-emerald-600 text-sm bg-emerald-50 rounded-xl px-4 py-2">{{ success }}</p>
      <button type="submit" class="btn-primary btn text-sm" :disabled="loading">
        {{ loading ? 'Updating…' : 'Update password' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const save = async () => {
  error.value = ''; success.value = ''
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'New passwords do not match.'; return
  }
  loading.value = true
  try {
    await auth.updatePassword(currentPassword.value, newPassword.value)
    success.value = 'Password updated successfully!'
    currentPassword.value = ''; newPassword.value = ''; confirmPassword.value = ''
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update password.'
  } finally {
    loading.value = false
  }
}
</script>
