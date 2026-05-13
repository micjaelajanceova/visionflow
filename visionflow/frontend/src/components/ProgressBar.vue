<template>
  <div>
    <div class="flex justify-between text-xs mb-0.5">
      <span v-if="label" class="text-slate-600 truncate mr-2">{{ label }}</span>
      <span class="font-semibold text-slate-700 flex-shrink-0 ml-auto">{{ percentage }}%</span>
    </div>
    <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="colorClass ?? 'bg-indigo-500'"
        :style="{ width: percentage + '%' }"
      />
    </div>
    <p v-if="subtext" class="text-xs text-slate-400 mt-0.5">{{ subtext }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * Reusable progress bar.
 * - label: text shown on the left
 * - percentage: 0–100
 * - colorClass: Tailwind bg class (e.g. 'bg-indigo-500') — defaults to indigo
 * - subtext: optional small text shown below the bar (e.g. "2/5 days done")
 */
defineProps<{
  label: string
  percentage: number
  colorClass?: string
  subtext?: string
}>()
</script>
