<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-0 py-8">
    <div class="mb-8">
      <h1 class="page-title">
        <span class="text-indigo-500 flex-shrink-0" v-html="personIcon" />
        My Profile
      </h1>
      <p class="text-slate-500 mt-1">Update your avatar, username, and password.</p>
    </div>

    <!-- Avatar -->
    <div class="card mb-5">
      <h2 class="text-base font-semibold text-slate-800 mb-4">Profile Picture</h2>
      <div class="flex items-center gap-6">
        <div
          class="w-24 h-24 rounded-full flex-shrink-0 overflow-hidden bg-indigo-100 flex items-center justify-center cursor-pointer ring-2 ring-indigo-200 hover:ring-indigo-400 transition-all"
          @click="triggerFileInput"
          title="Click to change picture"
        >
          <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" alt="avatar" />
          <span v-else class="text-3xl font-bold text-indigo-500 select-none">
            {{ auth.user?.username?.[0]?.toUpperCase() }}
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <button class="btn-primary btn text-sm" @click="triggerFileInput">Change picture</button>
          <button
            v-if="auth.user?.avatarUrl"
            class="btn-secondary btn text-sm text-red-500 hover:text-red-600"
            @click="removeAvatar"
            :disabled="avatarLoading"
          >
            Remove picture
          </button>
          <p class="text-xs text-slate-400">JPG, PNG or GIF · max 5 MB</p>
        </div>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
      </div>

      <div v-if="avatarChanged" class="mt-4 flex items-center gap-3">
        <button class="btn-primary btn text-sm" @click="saveAvatar" :disabled="avatarLoading">
          {{ avatarLoading ? 'Saving…' : 'Save picture' }}
        </button>
        <button class="btn-secondary btn text-sm" @click="cancelAvatar">Cancel</button>
      </div>
      <p v-if="avatarError" class="text-red-500 text-sm mt-3 bg-red-50 rounded-xl px-4 py-2">{{ avatarError }}</p>
      <p v-if="avatarSuccess" class="text-emerald-600 text-sm mt-3 bg-emerald-50 rounded-xl px-4 py-2">{{ avatarSuccess }}</p>
    </div>

    <!-- Username -->
    <div class="card mb-5">
      <h2 class="text-base font-semibold text-slate-800 mb-4">Username</h2>
      <form @submit.prevent="saveUsername" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input v-model="username" class="input" placeholder="Your username" required minlength="2" />
        </div>
        <p v-if="usernameError" class="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{{ usernameError }}</p>
        <p v-if="usernameSuccess" class="text-emerald-600 text-sm bg-emerald-50 rounded-xl px-4 py-2">{{ usernameSuccess }}</p>
        <button type="submit" class="btn-primary btn text-sm" :disabled="usernameLoading">
          {{ usernameLoading ? 'Saving…' : 'Save username' }}
        </button>
      </form>
    </div>

    <!-- Password -->
    <div class="card">
      <h2 class="text-base font-semibold text-slate-800 mb-4">Change Password</h2>
      <form @submit.prevent="savePassword" class="space-y-4">
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
        <p v-if="passwordError" class="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{{ passwordError }}</p>
        <p v-if="passwordSuccess" class="text-emerald-600 text-sm bg-emerald-50 rounded-xl px-4 py-2">{{ passwordSuccess }}</p>
        <button type="submit" class="btn-primary btn text-sm" :disabled="passwordLoading">
          {{ passwordLoading ? 'Updating…' : 'Update password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

// --- Avatar ---
const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(auth.user?.avatarUrl ?? null)
const avatarChanged = ref(false)
const avatarLoading = ref(false)
const avatarError = ref('')
const avatarSuccess = ref('')

function triggerFileInput() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  avatarError.value = ''
  avatarSuccess.value = ''
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = 'Image must be smaller than 5 MB.'
    return
  }
  avatarPreview.value = await resizeImage(file)
  avatarChanged.value = true
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const size = 200
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

function cancelAvatar() {
  avatarPreview.value = auth.user?.avatarUrl ?? null
  avatarChanged.value = false
  avatarError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function saveAvatar() {
  avatarLoading.value = true
  avatarError.value = ''
  avatarSuccess.value = ''
  try {
    await auth.updateProfile({ avatarUrl: avatarPreview.value })
    avatarChanged.value = false
    avatarSuccess.value = 'Profile picture updated!'
  } catch (err: any) {
    avatarError.value = err.response?.data?.message || 'Failed to save picture.'
  } finally {
    avatarLoading.value = false
  }
}

async function removeAvatar() {
  avatarLoading.value = true
  avatarError.value = ''
  avatarSuccess.value = ''
  try {
    await auth.updateProfile({ avatarUrl: null })
    avatarPreview.value = null
    avatarChanged.value = false
    avatarSuccess.value = 'Profile picture removed.'
  } catch (err: any) {
    avatarError.value = err.response?.data?.message || 'Failed to remove picture.'
  } finally {
    avatarLoading.value = false
  }
}

// --- Username ---
const username = ref(auth.user?.username ?? '')
const usernameLoading = ref(false)
const usernameError = ref('')
const usernameSuccess = ref('')

async function saveUsername() {
  usernameLoading.value = true
  usernameError.value = ''
  usernameSuccess.value = ''
  try {
    await auth.updateProfile({ username: username.value })
    usernameSuccess.value = 'Username updated!'
  } catch (err: any) {
    usernameError.value = err.response?.data?.message || 'Failed to update username.'
  } finally {
    usernameLoading.value = false
  }
}

// --- Password ---
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

async function savePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'New passwords do not match.'
    return
  }
  passwordLoading.value = true
  try {
    await auth.updatePassword(currentPassword.value, newPassword.value)
    passwordSuccess.value = 'Password updated successfully!'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err: any) {
    passwordError.value = err.response?.data?.message || 'Failed to update password.'
  } finally {
    passwordLoading.value = false
  }
}

const personIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>`
</script>
