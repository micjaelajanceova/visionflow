<template>
  <div class="mb-3">
    <div class="flex justify-between text-sm mb-1">
      <span class="text-slate-700 font-medium">{{ label }}</span>
      <span class="text-slate-400">{{ percentage }}%</span>
    </div>
    <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :style="{ width: percentage + '%', backgroundColor: color }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; percentage: number; color: string }>()
</script>
