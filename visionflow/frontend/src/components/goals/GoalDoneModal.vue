<template>
  <!-- Overlay backdrop — clicking outside closes the modal -->
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span class="text-indigo-500" v-html="icon('trophy', 'w-5 h-5')" />Goal Completed!
        </h2>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 text-2xl bg-transparent border-0 cursor-pointer">×</button>
      </div>

      <p class="text-sm text-slate-500 mb-4">Congratulations! You can share your achievement on the Explore page.</p>

      <!-- Show the goal's existing image as the completion photo -->
      <div v-if="goal.imageData" class="mb-4 rounded-xl overflow-hidden border border-slate-100">
        <img :src="goal.imageData" class="w-full object-cover" style="max-height:200px;" />
      </div>

      <label class="flex items-center gap-3 cursor-pointer mb-4">
        <input v-model="sharePublic" type="checkbox" class="w-4 h-4 accent-indigo-600" />
        <span class="text-sm text-slate-700">Share on Explore page</span>
      </label>

      <div class="flex gap-3">
        <button @click="submit" class="btn btn-success flex-1">Mark as Done</button>
        <button @click="$emit('close')" class="btn btn-secondary px-6">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGoalStore } from '../../stores/goalStore'
import type { Goal } from '../../types/Goal'
import { icon } from '../../utils/icons'

const props = defineProps<{ goal: Goal }>()

const emit = defineEmits<{
  close: []
  done: [goal: Goal]
}>()

const goalStore = useGoalStore()
const sharePublic = ref(false)

// Marks the goal as done using the existing goal image as the completion photo
const submit = async () => {
  const updated = await goalStore.markDone(
    props.goal._id,
    props.goal.imageData || undefined,
    sharePublic.value
  )
  emit('done', updated)
}
</script>
