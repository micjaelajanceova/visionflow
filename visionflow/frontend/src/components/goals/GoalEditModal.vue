<template>
  <!-- Overlay backdrop — clicking outside closes the modal -->
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-slate-900">Edit Goal</h2>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 text-2xl bg-transparent border-0 cursor-pointer">×</button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input v-model="form.title" required class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea v-model="form.description" rows="2" class="input resize-none" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select v-model="form.category" class="input">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Target date *</label>
          <input v-model="form.targetDate" type="date" required class="input" />
        </div>

        <!-- Image upload with preview -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Picture</label>
          <div
            class="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:border-indigo-400 transition-all"
            @click="picInput?.click()"
          >
            <img v-if="form.imagePreview" :src="form.imagePreview" class="max-h-36 mx-auto rounded-lg object-cover mb-2" />
            <p class="text-xs text-slate-400">{{ form.imagePreview ? 'Click to replace' : 'Click to add a picture' }}</p>
          </div>
          <input ref="picInput" type="file" accept="image/*" class="hidden" @change="handlePic" />
          <button
            v-if="form.imagePreview"
            type="button"
            @click="form.imagePreview = ''; form.imageData = null"
            class="btn btn-secondary text-xs mt-2 text-red-500"
          >Remove picture</button>
        </div>

        <div class="flex gap-3 pt-1">
          <button type="submit" class="btn btn-primary flex-1">Save Changes</button>
          <button type="button" @click="$emit('close')" class="btn btn-secondary px-6">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useGoalStore } from '../../stores/goalStore'
import type { Goal } from '../../types/Goal'

const props = defineProps<{
  goal: Goal
  categories: string[]
}>()

const emit = defineEmits<{
  close: []
  saved: [goal: Goal]
}>()

const goalStore = useGoalStore()
const picInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  title: '',
  description: '',
  category: '',
  targetDate: '',
  isPublic: false,
  imagePreview: '',
  imageData: null as string | null,
})

// Pre-fill the form with the goal's current values when the modal opens
onMounted(() => {
  form.title = props.goal.title
  form.description = props.goal.description || ''
  form.category = props.goal.category
  form.targetDate = new Date(props.goal.targetDate).toISOString().split('T')[0]
  form.isPublic = props.goal.isPublic
  form.imagePreview = props.goal.imageData || ''
  form.imageData = props.goal.imageData || null
})

// Convert selected file to base64 for preview and storage
const handlePic = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = ev.target?.result as string
    form.imagePreview = result
    form.imageData = result
  }
  reader.readAsDataURL(file)
}

const submit = async () => {
  const updated = await goalStore.updateGoal(props.goal._id, {
    title: form.title,
    description: form.description,
    category: form.category as any,
    targetDate: form.targetDate as any,
    isPublic: form.isPublic,
    imageData: form.imageData,
  })
  emit('saved', updated)
}
</script>
