<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <span class="text-indigo-500 flex-shrink-0" v-html="icon('board', 'w-7 h-7')" />
          Vision Board
        </h1>
        <p class="text-slate-500 text-sm mt-1">Your dreams, visualized</p>
      </div>
      <button @click="showAddPicture = true" class="btn btn-primary">+ Add Picture</button>
    </div>

    <div v-if="goalStore.loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
    </div>

    <div v-else-if="goalStore.goals.length === 0" class="text-center py-24">
      <div class="flex justify-center mb-4">
        <span class="text-indigo-200" v-html="icon('board', 'w-20 h-20')" />
      </div>
      <h3 class="text-xl font-semibold text-slate-700 mb-2">No goals yet</h3>
      <p class="text-slate-400 mb-6">Create goals first, then add images to them</p>
      <router-link to="/goals" class="btn btn-primary">Go to Goals</router-link>
    </div>

    <div v-else-if="goalsWithImages.length === 0" class="text-center py-24">
      <div class="flex justify-center mb-4">
        <span class="text-indigo-200" v-html="icon('board', 'w-20 h-20')" />
      </div>
      <h3 class="text-xl font-semibold text-slate-700 mb-2">No pictures yet</h3>
      <p class="text-slate-400 mb-6">Click "+ Add Picture" to add images to your goals</p>
    </div>

    <!-- Vision board: pinboard layout -->
    <div v-else>
      <p class="text-xs text-slate-400 mb-8">{{ goalsWithImages.length }} image{{ goalsWithImages.length !== 1 ? 's' : '' }} on your board</p>

      <div class="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        <div
          v-for="(goal, index) in goalsWithImages"
          :key="goal._id"
          class="break-inside-avoid mb-4 group relative cursor-pointer pt-6"
          :style="{ transform: `rotate(${rotations[index % rotations.length]}deg)`, transition: 'transform 0.2s ease' }"
          @mouseenter="(e) => ((e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) scale(1.04)')"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.transform = `rotate(${rotations[index % rotations.length]}deg)`)"
          @click="router.push(`/goals/${goal._id}`)"
        >
          <!-- Pin -->
          <div class="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 w-5 h-5 rounded-full shadow-md border-2 border-white" :class="pinColors[index % pinColors.length]" />
          <!-- Delete button -->
          <button
            @click.stop="removeImage(goal._id)"
            class="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 border-0 cursor-pointer"
            title="Remove from board"
          >✕</button>
          <!-- Photo card -->
          <div class="bg-white rounded-sm overflow-hidden" style="box-shadow: 2px 4px 16px rgba(0,0,0,0.18);">
            <img
              :src="goal.imageData"
              :alt="goal.title"
              class="w-full object-cover block"
              :class="imgHeights[index % imgHeights.length]"
              style="max-width:100%;"
            />
            <div class="px-3 py-2 bg-white">
              <p class="text-xs font-semibold text-slate-700 truncate">{{ goal.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Picture Modal -->
    <div v-if="showAddPicture" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeAddPicture">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-slate-900">Add Picture to Goal</h2>
          <button @click="closeAddPicture" class="text-slate-400 hover:text-slate-600 text-2xl bg-transparent border-0 cursor-pointer">×</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Select goal *</label>
            <select v-model="picGoalId" class="input">
              <option value="" disabled>Choose a goal…</option>
              <option v-for="g in goalStore.goals" :key="g._id" :value="g._id">
                {{ g.title }}{{ g.imageData ? ' (has image)' : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Picture *</label>
            <div
              class="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition-all"
              @click="picInput?.click()"
              @dragover.prevent
              @drop.prevent="handlePicDrop"
            >
              <div v-if="picPreview">
                <img :src="picPreview" class="max-h-48 mx-auto rounded-lg object-cover" />
              </div>
              <div v-else class="py-4">
                <div class="flex justify-center mb-2">
                  <span class="text-slate-300" v-html="icon('camera', 'w-10 h-10')" />
                </div>
                <p class="text-sm text-slate-500">Click or drag & drop</p>
                <p class="text-xs text-slate-400 mt-1">JPG, PNG, WEBP</p>
              </div>
            </div>
            <input ref="picInput" type="file" accept="image/*" capture="environment" class="hidden" @change="handlePicUpload" />
          </div>

          <div class="flex gap-3 pt-1">
            <button @click="savePicture" :disabled="!picGoalId || !picData || saving" class="btn btn-primary flex-1 disabled:opacity-50">
              {{ saving ? 'Saving…' : 'Save to Board' }}
            </button>
            <button @click="closeAddPicture" class="btn btn-secondary px-6">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGoalStore } from '../stores/goalStore'
import { icon } from '../utils/icons'

const goalStore = useGoalStore()
const router = useRouter()

onMounted(() => goalStore.fetchGoals())

const goalsWithImages = computed(() => goalStore.goals.filter(g => g.imageData))

const rotations = [-2.5, 1.8, -1.2, 2.1, -0.8, 1.5, -2.0, 0.9, -1.6, 2.3]
const pinColors = ['bg-red-400', 'bg-indigo-400', 'bg-emerald-400', 'bg-indigo-400', 'bg-orange-400', 'bg-pink-400']
const imgHeights = ['h-36', 'h-52', 'h-44', 'h-32', 'h-60', 'h-40', 'h-48', 'h-36', 'h-56', 'h-44']

const showAddPicture = ref(false)
const picGoalId = ref('')
const picPreview = ref('')
const picData = ref('')
const picInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)

const closeAddPicture = () => {
  showAddPicture.value = false
  picGoalId.value = ''
  picPreview.value = ''
  picData.value = ''
}

const loadFile = (file: File) => {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => {
    picData.value = e.target?.result as string
    picPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handlePicUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadFile(file)
}

const handlePicDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file) loadFile(file)
}

const savePicture = async () => {
  if (!picGoalId.value || !picData.value) return
  saving.value = true
  try {
    await goalStore.updateGoal(picGoalId.value, { imageData: picData.value })
    closeAddPicture()
  } finally {
    saving.value = false
  }
}

const removeImage = async (goalId: string) => {
  if (confirm('Remove this picture from the board?')) {
    await goalStore.updateGoal(goalId, { imageData: null } as any)
  }
}
</script>