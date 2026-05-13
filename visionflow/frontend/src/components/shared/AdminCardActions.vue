<template>
  <div class="flex gap-1 mt-2">
    <!-- Delete photo button -->
    <button
      v-if="showDeletePhoto"
      @click.stop="$emit('delete-photo')"
      class="text-xs bg-red-500/80 hover:bg-red-600 text-white rounded px-2 py-0.5 border-0 cursor-pointer"
    >Delete photo</button>
    <!-- Toggle block/unblock user -->
    <button
      @click.stop="$emit('toggle-block')"
      class="text-xs bg-slate-700/80 hover:bg-slate-900 text-white rounded px-2 py-0.5 border-0 cursor-pointer"
    >{{ isBlocked ? 'Unblock user' : 'Block user' }}</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showDeletePhoto?: boolean
  isBlocked: boolean
}>()

defineEmits<{
  'delete-photo': []
  'toggle-block': []
}>()
</script>
