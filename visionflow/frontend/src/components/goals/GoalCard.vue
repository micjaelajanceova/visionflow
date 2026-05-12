<template>
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
    <div class="h-1.5 w-full" :class="categoryColor" />

    <div class="p-5 flex flex-col flex-1">
      <div class="flex flex-wrap gap-1.5 mb-3">
        <span class="badge" :class="categoryBadge">{{ goal.category }}</span>
        <span v-if="goal.isDone" class="badge bg-emerald-100 text-emerald-700 flex items-center gap-1">
          <span v-html="icon('checkCircle', 'w-3 h-3')" />Done
        </span>
      </div>

      <h3 class="font-semibold text-slate-900 text-base mb-1 leading-snug">{{ goal.title }}</h3>
      <p v-if="goal.description" class="text-sm text-slate-500 line-clamp-2 mb-3">{{ goal.description }}</p>

      <div class="mt-auto">
        <p class="text-xs text-slate-400 mb-3 flex items-center gap-1">
          <span class="text-slate-400" v-html="icon('calendar', 'w-3.5 h-3.5')" />
          {{ formatDate(goal.targetDate) }}
        </p>
        <div class="flex gap-2">
          <router-link :to="`/goals/${goal._id}`" class="btn btn-primary flex-1 text-xs py-1.5">View</router-link>
          <button @click="$emit('delete', goal._id)" class="btn btn-danger text-xs py-1.5 px-3" title="Delete">
            <span v-html="icon('trash', 'w-3.5 h-3.5')" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Goal } from '../../types/Goal'
import { icon } from '../../utils/icons'

const props = defineProps<{ goal: Goal }>()
defineEmits<{ edit: [goal: Goal]; delete: [id: string] }>()

const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const categoryColor = computed(() => ({
  Health: 'bg-emerald-400', Career: 'bg-indigo-400', Finance: 'bg-yellow-400',
  Education: 'bg-purple-400', Personal: 'bg-pink-400', Other: 'bg-slate-300',
}[props.goal.category] || 'bg-slate-300'))

const categoryBadge = computed(() => ({
  Health: 'bg-emerald-100 text-emerald-700', Career: 'bg-indigo-100 text-indigo-700',
  Finance: 'bg-yellow-100 text-yellow-700', Education: 'bg-purple-100 text-purple-700',
  Personal: 'bg-pink-100 text-pink-700', Other: 'bg-slate-100 text-slate-600',
}[props.goal.category] || 'bg-slate-100 text-slate-600'))
</script>
