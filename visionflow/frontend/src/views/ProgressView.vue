<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <h1 class="page-title mb-6">
      <span class="text-indigo-500 flex-shrink-0" v-html="icon('progress', 'w-7 h-7')" />
      Progress
    </h1>

    <!-- Quick stats -->
    <div class="grid grid-cols-2 gap-4 mb-8 max-w-sm">
      <div class="card text-center">
        <div class="text-3xl font-bold text-indigo-600">{{ goalStore.goals.length }}</div>
        <div class="text-sm text-slate-500 mt-1">Total Goals</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-emerald-500">{{ doneGoals }}</div>
        <div class="text-sm text-slate-500 mt-1">Completed Goals</div>
      </div>
    </div>

    <!-- Active goal progress — completed goals are hidden -->
    <div class="card mb-6">
      <h2 class="font-semibold text-slate-900 mb-4">Goal Progress</h2>
      <div v-if="activeGoals.length === 0" class="text-center py-6 text-slate-400 text-sm">
        No active goals — create your first goal!
      </div>
      <div class="space-y-6">
        <div v-for="goal in activeGoals" :key="goal._id">
          <!-- Goal header row -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="catDot(goal.category)" />
              <router-link :to="`/goals/${goal._id}`" class="text-sm font-semibold text-slate-800 hover:text-indigo-600 truncate">
                {{ goal.title }}
              </router-link>
            </div>
            <span class="text-xs text-slate-400 flex-shrink-0 ml-2">{{ formatDate(goal.targetDate) }}</span>
          </div>

          <!-- Per-task progress bars -->
          <div v-if="goalTaskStats(goal).length > 0" class="space-y-2 pl-4">
            <ProgressBar
              v-for="stat in goalTaskStats(goal)"
              :key="stat.taskId"
              :label="stat.title"
              :percentage="stat.percent"
              :color-class="catBar(goal.category)"
              :subtext="`${stat.completed}/${stat.total} days done`"
            />
          </div>
          <div v-else class="pl-4 text-xs text-slate-400 italic">No tasks added yet</div>
        </div>
      </div>
    </div>

    <!-- Completion photos gallery -->
    <div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-indigo-500" v-html="icon('trophy', 'w-5 h-5')" />
          Completion Photos
        </h2>
        <span class="text-xs text-slate-400">{{ donePhotos.length }} photo{{ donePhotos.length !== 1 ? 's' : '' }}</span>
      </div>

      <div v-if="donePhotos.length === 0" class="text-center py-8 text-slate-400 text-sm">
        Complete a goal and add a photo to see it here!
      </div>

      <div v-else class="columns-2 sm:columns-3 gap-3 space-y-3">
        <div v-for="goal in donePhotos" :key="goal._id"
          class="break-inside-avoid mb-3 overflow-hidden border border-slate-100 shadow-sm rounded-xl">
          <img :src="goal.donePhoto" class="w-full object-cover block" style="max-height:400px;" />
          <div class="p-2 bg-white">
            <p class="text-xs font-semibold text-slate-700 truncate">{{ goal.title }}</p>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-slate-400">{{ goal.doneAt ? formatDate(goal.doneAt) : '' }}</span>
              <span v-if="goal.isDonePublic" class="text-emerald-500 flex items-center gap-0.5 text-xs">
                <span v-html="icon('explore', 'w-3 h-3')" />public
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task completion photos -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-slate-900 flex items-center gap-2">
          <span class="text-indigo-500" v-html="icon('camera', 'w-5 h-5')" />
          Task Progress Photos
        </h2>
        <span class="text-xs text-slate-400">{{ taskPhotos.length }} photo{{ taskPhotos.length !== 1 ? 's' : '' }}</span>
      </div>

      <div v-if="taskPhotos.length === 0" class="text-center py-8 text-slate-400 text-sm">
        Complete a task with a photo in the Calendar to see it here!
      </div>

      <div v-else class="columns-2 sm:columns-3 gap-3 space-y-3">
        <div v-for="photo in taskPhotos" :key="photo.taskId + photo.date"
          class="break-inside-avoid mb-3 overflow-hidden border border-slate-100 shadow-sm rounded-xl">
          <img :src="photo.photoData" class="w-full object-cover block" style="max-height:400px;" />
          <div class="p-2 bg-white">
            <p class="text-xs font-semibold text-slate-700 truncate">{{ photo.taskTitle }}</p>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-slate-400">{{ formatDate(photo.date) }}</span>
              <span v-if="photo.isPublic" class="text-emerald-500 flex items-center gap-0.5 text-xs">
                <span v-html="icon('explore', 'w-3 h-3')" />public
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGoalStore } from '../stores/goalStore'
import { useTaskStore } from '../stores/taskStore'
import type { Goal } from '../types/Goal'
import { icon } from '../utils/icons'
import { formatDate } from '../utils/dateUtils'
import { useCategoryColors } from '../composables/useCategoryColors'
import ProgressBar from '../components/ProgressBar.vue'

const goalStore = useGoalStore()
const taskStore = useTaskStore()
const { catDot, catBar } = useCategoryColors()

const doneGoals  = computed(() => goalStore.goals.filter(g => g.isDone).length)
const donePhotos = computed(() => goalStore.goals.filter(g => g.isDone && g.donePhoto))

// Active goals only — completed ones are hidden on this page
const activeGoals = computed<Goal[]>(() => goalStore.goals.filter(g => !g.isDone))

interface TaskPhoto { taskId: string; taskTitle: string; date: string; photoData: string; isPublic: boolean }
const taskPhotos = ref<TaskPhoto[]>([])

const loadTaskPhotos = () => {
  const allPhotos: TaskPhoto[] = []
  for (const task of taskStore.tasks) {
    for (const p of task.completionPhotos || []) {
      allPhotos.push({ taskId: task._id, taskTitle: task.title, date: p.date, photoData: p.photoData, isPublic: p.isPublic })
    }
  }
  allPhotos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  taskPhotos.value = allPhotos
}

// Calculates completion stats per task for a given goal
const goalTaskStats = (goal: Goal) => {
  const tasks = taskStore.tasks.filter(t => t.goal === goal._id || t.goalId === goal._id)
  return tasks.map(task => {
    const start = task.startDate ? new Date(task.startDate) : new Date(goal.createdAt)
    const end = new Date(goal.targetDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    let total = 0
    const cur = new Date(start)
    while (cur <= end) {
      const day = (cur.getDay() + 6) % 7 // Mon=0 ... Sun=6
      if (!task.isRecurring || task.recurringDays.includes(day)) total++
      cur.setDate(cur.getDate() + 1)
    }
    if (!task.isRecurring) total = 1
    const completed = task.isRecurring ? task.completedDates.length : (task.completed ? 1 : 0)
    const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0
    return { taskId: task._id, title: task.title, completed, total, percent }
  })
}

onMounted(async () => {
  await Promise.all([goalStore.fetchGoals(), taskStore.fetchTasks()])
  loadTaskPhotos()
})
</script>
