<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 flex items-center gap-3">
        <span class="text-blue-500 flex-shrink-0" v-html="icon('hand', 'w-8 h-8')" />
        Welcome back, <span class="text-blue-600">{{ auth.user?.username }}</span>
      </h1>
      <p class="text-slate-500 mt-1">Here's what's going on with your goals today.</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div class="card text-center">
        <div class="text-3xl font-bold text-blue-600">{{ goalStore.goals.length }}</div>
        <div class="text-sm text-slate-500 mt-1">Active Goals</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-emerald-500">{{ doneGoals }}</div>
        <div class="text-sm text-slate-500 mt-1">Completed Goals</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-blue-500">{{ todayTasks.length }}</div>
        <div class="text-sm text-slate-500 mt-1">Tasks Today</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-orange-500">{{ tasksDoneToday }}</div>
        <div class="text-sm text-slate-500 mt-1">Done Today</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Goals preview -->
      <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span class="text-blue-500" v-html="icon('goals', 'w-5 h-5')" />
            Recent Goals
          </h2>
          <router-link to="/goals" class="text-sm text-blue-600 hover:underline">See all →</router-link>
        </div>
        <div v-if="goalStore.goals.length === 0" class="card text-center py-10">
          <div class="flex justify-center mb-3">
            <span class="text-blue-300" v-html="icon('goals', 'w-14 h-14')" />
          </div>
          <p class="text-slate-500 mb-4">No goals yet — start your journey!</p>
          <router-link to="/goals" class="btn btn-primary">Create your first goal</router-link>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GoalCard
            v-for="goal in goalStore.goals.slice(0, 4)"
            :key="goal._id"
            :goal="goal"
            @edit="() => {}"
            @delete="() => {}"
          />
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Today's tasks -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-slate-900 flex items-center gap-2">
              <span class="text-blue-500" v-html="icon('checkCircle', 'w-5 h-5')" />
              Today's Tasks
            </h2>
            <router-link to="/calendar" class="text-xs text-blue-600 hover:underline">Calendar →</router-link>
          </div>
          <div v-if="todayTasks.length === 0" class="text-sm text-slate-400 text-center py-3">
            Nothing due today
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="task in todayTasks"
              :key="task._id"
              class="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-all"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0"
                :class="taskStore.isDateCompleted(task, todayStr) ? 'bg-emerald-500' : 'bg-slate-300'"
              />
              <span class="text-sm flex-1" :class="taskStore.isDateCompleted(task, todayStr) ? 'line-through text-slate-400' : 'text-slate-700'">
                {{ task.title }}
              </span>
              <span v-if="task.isRecurring" class="text-blue-400 flex-shrink-0" v-html="icon('calendar', 'w-3.5 h-3.5')" />
            </div>
          </div>
        </div>

        <!-- Vision board mini -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-slate-900 flex items-center gap-2">
              <span class="text-blue-500" v-html="icon('photo', 'w-5 h-5')" />
              Vision Board
            </h2>
            <router-link to="/collage" class="text-xs text-blue-600 hover:underline">View all →</router-link>
          </div>
          <div v-if="goalsWithImages.length === 0" class="text-sm text-slate-400 text-center py-3">
            Add images to goals to fill your board
          </div>
          <div v-else class="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
            <div
              v-for="goal in goalsWithImages.slice(0, 6)"
              :key="goal._id"
              class="aspect-square rounded-lg overflow-hidden"
            >
              <img :src="goal.imageData" :alt="goal.title" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Quick links -->
        <div class="card">
          <h2 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <span class="text-blue-500" v-html="icon('bolt', 'w-5 h-5')" />
            Quick Actions
          </h2>
          <div class="space-y-1">
            <router-link to="/goals" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-all group">
              <span class="text-blue-400 group-hover:text-blue-600 transition-colors" v-html="icon('goals', 'w-5 h-5')" />
              <span class="text-sm font-medium text-slate-700 group-hover:text-blue-600">Create a new goal</span>
            </router-link>
            <router-link to="/calendar" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-all group">
              <span class="text-blue-400 group-hover:text-blue-600 transition-colors" v-html="icon('calendar', 'w-5 h-5')" />
              <span class="text-sm font-medium text-slate-700 group-hover:text-blue-600">Add a daily task</span>
            </router-link>
            <router-link to="/explore" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-all group">
              <span class="text-blue-400 group-hover:text-blue-600 transition-colors" v-html="icon('explore', 'w-5 h-5')" />
              <span class="text-sm font-medium text-slate-700 group-hover:text-blue-600">Explore community</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useGoalStore } from '../stores/goalStore'
import { useTaskStore } from '../stores/taskStore'
import GoalCard from '../components/goals/GoalCard.vue'
import { icon } from '../utils/icons'

const auth = useAuthStore()
const goalStore = useGoalStore()
const taskStore = useTaskStore()

const todayStr = new Date().toISOString().split('T')[0]
const todayTasks = computed(() => taskStore.getTasksForDate(todayStr))
const doneGoals = computed(() => goalStore.goals.filter(g => g.isDone).length)
const goalsWithImages = computed(() => goalStore.goals.filter(g => g.imageData))
const tasksDoneToday = computed(() =>
  todayTasks.value.filter(t => taskStore.isDateCompleted(t, todayStr)).length
)

onMounted(async () => {
  await Promise.all([
    goalStore.fetchGoals(),
    taskStore.fetchTasks(),
  ])
})
</script>
