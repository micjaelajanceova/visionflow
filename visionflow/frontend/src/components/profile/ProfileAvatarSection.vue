<template>
  <div class="card mb-5 border-indigo-200">
    <h2 class="text-base font-semibold text-slate-800 mb-4">Profile Picture</h2>
    <div class="flex items-center gap-6">
      <!-- Avatar preview — click to open file picker -->
      <div
        class="w-24 h-24 rounded-full flex-shrink-0 overflow-hidden bg-indigo-100 flex items-center justify-center cursor-pointer ring-2 ring-indigo-200 hover:ring-indigo-400 transition-all"
        @click="fileInput?.click()"
        title="Click to change picture"
      >
        <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" alt="avatar" />
        <span v-else class="text-3xl font-bold text-indigo-500 select-none">
          {{ auth.user?.username?.[0]?.toUpperCase() }}
        </span>
      </div>

      <div class="flex flex-col gap-2">
        <button class="btn-primary btn text-sm" @click="fileInput?.click()">Change picture</button>
        <button
          v-if="auth.user?.avatarUrl"
          class="btn-secondary btn text-sm text-red-500 hover:text-red-600"
          @click="removeAvatar"
          :disabled="loading"
        >Remove picture</button>
        <p class="text-xs text-slate-400">JPG, PNG or GIF · max 5 MB</p>
      </div>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
    </div>

    <div v-if="changed" class="mt-4 flex items-center gap-3">
      <button class="btn-primary btn text-sm" @click="save" :disabled="loading">
        {{ loading ? 'Saving…' : 'Save picture' }}
      </button>
      <button class="btn-secondary btn text-sm" @click="cancel">Cancel</button>
    </div>
    <p v-if="error"   class="text-red-500 text-sm mt-3 bg-red-50 rounded-xl px-4 py-2">{{ error }}</p>
    <p v-if="success" class="text-emerald-600 text-sm mt-3 bg-emerald-50 rounded-xl px-4 py-2">{{ success }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()
const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(auth.user?.avatarUrl ?? null)
const changed = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

const onFileChange = async (e: Event) => {
  error.value = ''
  success.value = ''
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { error.value = 'Image must be smaller than 5 MB.'; return }
  avatarPreview.value = await resizeImage(file)
  changed.value = true
}

// Crop and resize image to 200×200 square before uploading
const resizeImage = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const size = 200
        const canvas = document.createElement('canvas')
        canvas.width = size; canvas.height = size
        const ctx = canvas.getContext('2d')!
        const min = Math.min(img.width, img.height)
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })

const cancel = () => {
  avatarPreview.value = auth.user?.avatarUrl ?? null
  changed.value = false
  error.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const save = async () => {
  loading.value = true; error.value = ''; success.value = ''
  try {
    await auth.updateProfile({ avatarUrl: avatarPreview.value })
    changed.value = false
    success.value = 'Profile picture updated!'
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save picture.'
  } finally {
    loading.value = false
  }
}

const removeAvatar = async () => {
  loading.value = true; error.value = ''; success.value = ''
  try {
    await auth.updateProfile({ avatarUrl: null })
    avatarPreview.value = null
    changed.value = false
    success.value = 'Profile picture removed.'
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to remove picture.'
  } finally {
    loading.value = false
  }
}
</script>
