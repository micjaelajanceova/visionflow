<template>
  <!--
    Displays a user avatar: shows the photo if available,
    otherwise falls back to the first letter of the username.
    Size is controlled via the `size` prop.
  -->
  <div class="rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden ring-2 ring-indigo-200 flex-shrink-0" :class="sizeClass">
    <img v-if="user?.avatarUrl" :src="user.avatarUrl" class="w-full h-full object-cover" alt="avatar" />
    <span v-else class="font-bold text-indigo-500 select-none" :class="textClass">
      {{ user?.username?.[0]?.toUpperCase() || '?' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  user: { username?: string; avatarUrl?: string } | null | undefined
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>()

// Map size prop to Tailwind dimension + text classes
const sizeClass = computed(() => ({
  xs:  'w-6 h-6',
  sm:  'w-8 h-8',
  md:  'w-10 h-10',
  lg:  'w-14 h-14',
  xl:  'w-20 h-20',
}[props.size ?? 'md']))

const textClass = computed(() => ({
  xs:  'text-xs',
  sm:  'text-xs',
  md:  'text-sm',
  lg:  'text-xl',
  xl:  'text-3xl',
}[props.size ?? 'md']))
</script>
