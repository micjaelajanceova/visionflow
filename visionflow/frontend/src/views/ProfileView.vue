<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-0 py-8">
    <div class="border border-indigo-200 rounded-xl p-6 bg-white shadow">
      <div class="mb-8">
        <h1 class="page-title">
          <span class="text-indigo-500 flex-shrink-0" v-html="icon('hand', 'w-7 h-7')" />
          My Profile
        </h1>
        <p class="text-slate-500 mt-1">Update your avatar, username, and password.</p>
      </div>

      <!-- Each section is self-contained: manages its own state and API calls -->
      <ProfileAvatarSection />
      <ProfileUsernameSection />
      <ProfilePasswordSection />
    </div>
  </div>
</template>

<script setup lang="ts">
import { icon } from '../utils/icons'
import ProfileAvatarSection from '../components/profile/ProfileAvatarSection.vue'
import ProfileUsernameSection from '../components/profile/ProfileUsernameSection.vue'
import ProfilePasswordSection from '../components/profile/ProfilePasswordSection.vue'
</script>
