<template>
  <div id="app" class="min-h-screen min-w-full bg-slate-50 flex">
    <SideMenu v-if="auth.isAuthenticated" />
    <main
      class="flex-1 min-w-0 overflow-x-hidden"
      :class="auth.isAuthenticated ? 'pt-14 md:pt-0' : 'min-h-screen'"
    >
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import SideMenu from './components/shared/SideMenu.vue'
import { useAuthStore } from './stores/authStore'

const auth = useAuthStore()
onMounted(async () => {
  if (auth.token) await auth.fetchMe()
})
</script>
