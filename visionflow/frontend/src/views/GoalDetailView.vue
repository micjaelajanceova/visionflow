<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <router-link to="/goals" class="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
      ← Back to Goals
    </router-link>

    <LoadingSpinner v-if="!goal" />

    <div v-else>
      <!-- ─── Goal header card ─── -->
      <div class="card mb-6">
        <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div class="flex flex-wrap gap-2">
            <span class="badge bg-indigo-100 text-indigo-700">{{ goal.category }}</span>
            <span v-if="goal.isPublic" class="badge bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <span v-html="icon('explore', 'w-3 h-3')" />Public
            </span>
            <!-- Show "Completed" badge if done, otherwise show "Overdue" badge if past target date -->
            <span v-if="goal.isDone" class="badge bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1">
              <span v-html="icon('checkCircle', 'w-3 h-3')" />Completed!
            </span>
            <span v-else-if="isOverdue" class="badge bg-red-100 text-red-600">{{ daysLeft }} days over deadline</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-400 flex items-center gap-1">
              <span class="text-slate-400" v-html="icon('calendar', 'w-4 h-4')" />
              Due {{ formatDateLong(goal.targetDate) }}
            </span>
            <button v-if="!goal.isDone" @click="showEditGoal = true" class="btn btn-secondary text-xs py-1.5 px-3">Edit</button>
          </div>
        </div>

        <h1 class="text-2xl font-bold text-slate-900 mb-2">{{ goal.title }}</h1>
        <p v-if="goal.description" class="text-slate-600">{{ goal.description }}</p>
        <img v-if="goal.imageData" :src="goal.imageData" :alt="goal.title" class="w-full max-h-80 object-cover rounded-xl mt-4" style="max-height:320px;" />

        <!-- Mark as done / completed state -->
        <div v-if="!goal.isDone" class="mt-4 pt-4 border-t border-slate-100">
          <button @click="showDoneModal = true" class="btn btn-success gap-2">
            <span v-html="icon('trophy', 'w-4 h-4')" />Mark as Done
          </button>
        </div>
        <div v-else class="mt-4 pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm text-emerald-600 font-medium">
              Completed on {{ goal.doneAt ? formatDateLong(goal.doneAt) : '' }}
            </p>
            <button @click="undoDone" class="btn btn-secondary text-xs py-1 px-3 text-slate-500">
              Undo completion
            </button>
          </div>
        </div>
      </div>

      <!-- ─── Goal tasks ─── -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-slate-900 flex items-center gap-2">
            <span class="text-indigo-500" v-html="icon('clipboard', 'w-5 h-5')" />
            Goal Tasks
          </h2>
          <button @click="showTaskForm = true" class="btn btn-primary text-xs py-1.5 px-3">+ Add Task</button>
        </div>

        <p class="text-xs text-slate-400 mb-4">Tasks repeat on selected days every week until the target date.</p>

        <div v-if="goalTasks.length === 0" class="text-center py-6 text-slate-400 text-sm">
          No tasks yet — add your first recurring task!
        </div>

        <!-- Task list with progress bars -->
        <div v-else class="space-y-3">
          <div v-for="{ task, stats } in goalTasksWithStats" :key="task._id" class="border border-slate-100 rounded-xl p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-800">{{ task.title }}</p>
                <p v-if="task.description" class="text-xs text-slate-500 mt-0.5">{{ task.description }}</p>
                <div class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="day in task.recurringDays"
                    :key="day"
                    class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium"
                  >{{ dayNames[day] }}</span>
                  <span v-if="!task.isAllDay && task.time" class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">⏰ {{ task.time }}</span>
                </div>
              </div>
              <div class="flex gap-1 flex-shrink-0">
                <button @click="openEditTask(task)" class="btn btn-secondary text-xs py-1 px-3">Edit</button>
                <button @click="deleteGoalTask(task._id)" class="btn btn-danger text-xs py-1 px-3">Delete</button>
              </div>
            </div>
            <div class="mt-3">
              <ProgressBar
                label=""
                :percentage="stats.percent"
                :subtext="`${stats.completed}/${stats.total} days done`"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Add / Edit Task Modal ─── -->
    <div v-if="showTaskForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeTaskForm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-slate-900">{{ editingTask ? 'Edit Task' : 'New Task' }}</h2>
          <button @click="closeTaskForm" class="text-slate-400 hover:text-slate-600 text-2xl bg-transparent border-0 cursor-pointer">×</button>
        </div>

        <form @submit.prevent="submitTask" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Task name *</label>
            <input v-model="taskForm.title" required placeholder="e.g. Go to the gym" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea v-model="taskForm.description" rows="2" placeholder="e.g. Workout split for this day" class="input resize-none" />
          </div>

          <!-- Day selector — Mon=0 ... Sun=6 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Repeat on days *</label>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="(name, i) in dayNames" :key="i"
                type="button"
                @click="toggleDay(i)"
                class="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer"
                :class="taskForm.recurringDays.includes(i)
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'"
              >{{ name }}</button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Timing</label>
            <div class="flex gap-2">
              <button type="button" @click="taskForm.isAllDay = true"
                class="flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                :class="taskForm.isAllDay ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'"
              >All day</button>
              <button type="button" @click="taskForm.isAllDay = false"
                class="flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                :class="!taskForm.isAllDay ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'"
              >Specific time</button>
            </div>
            <input v-if="!taskForm.isAllDay" v-model="taskForm.time" type="time" class="input mt-2" />
          </div>

          <div class="flex gap-3 pt-1">
            <button type="submit" :disabled="!taskForm.recurringDays.length" class="btn btn-primary flex-1 disabled:opacity-50">
              {{ editingTask ? 'Save Changes' : 'Add Task' }}
            </button>
            <button type="button" @click="closeTaskForm" class="btn btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ─── Edit Goal Modal (extracted component) ─── -->
    <GoalEditModal
      v-if="showEditGoal && goal"
      :goal="goal"
      :categories="categories"
      @close="showEditGoal = false"
      @saved="onGoalSaved"
    />

    <!-- ─── Mark as Done Modal (extracted component) ─── -->
    <GoalDoneModal
      v-if="showDoneModal && goal"
      :goal="goal"
      @close="showDoneModal = false"
      @done="onGoalDone"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGoalStore } from '../stores/goalStore'
import { useTaskStore } from '../stores/taskStore'
import type { Goal } from '../types/Goal'
import type { Task } from '../types/Task'
import client from '../api/client'
import { icon } from '../utils/icons'
import { formatDateLong } from '../utils/dateUtils'
import GoalEditModal from '../components/goals/GoalEditModal.vue'
import GoalDoneModal from '../components/goals/GoalDoneModal.vue'
import LoadingSpinner from '../components/shared/LoadingSpinner.vue'
import ProgressBar from '../components/ProgressBar.vue'

const route = useRoute()
const goalStore = useGoalStore()
const taskStore = useTaskStore()

// ─── State ───────────────────────────────────────────────
const goal = ref<Goal | null>(null)
const showTaskForm = ref(false)
const showEditGoal = ref(false)
const showDoneModal = ref(false)
const editingTask = ref<Task | null>(null)

const categories = ['Health', 'Career', 'Finance', 'Education', 'Personal', 'Other']
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Form state for add/edit task modal
const taskForm = reactive({
  title: '',
  description: '',
  recurringDays: [] as number[],
  isAllDay: true,
  time: '',
})

// ─── Computed ────────────────────────────────────────────

// Filter tasks that belong to this goal
const goalTasks = computed(() =>
  taskStore.tasks.filter(t => t.goal === goal.value?._id || t.goalId === goal.value?._id)
)

// Enrich each task with completion stats (completed / total / percent)
const goalTasksWithStats = computed(() =>
  goalTasks.value.map(task => {
    if (!goal.value) return { task, stats: { completed: 0, total: 0, percent: 0 } }
    const start = task.startDate ? new Date(task.startDate) : new Date(goal.value.createdAt)
    const end = new Date(goal.value.targetDate)
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
    return { task, stats: { completed, total, percent } }
  })
)

const isOverdue = computed(() =>
  !!goal.value && !goal.value.isDone && new Date(goal.value.targetDate) < new Date()
)

const daysLeft = computed(() =>
  goal.value ? Math.abs(Math.ceil((new Date(goal.value.targetDate).getTime() - Date.now()) / 86400000)) : 0
)

// ─── Modal event handlers ─────────────────────────────────

const onGoalSaved = (updated: Goal) => {
  goal.value = updated
  showEditGoal.value = false
}

const onGoalDone = (updated: Goal) => {
  goal.value = updated
  showDoneModal.value = false
}

// ─── Task form handlers ───────────────────────────────────

const toggleDay = (day: number) => {
  const idx = taskForm.recurringDays.indexOf(day)
  if (idx === -1) taskForm.recurringDays.push(day)
  else taskForm.recurringDays.splice(idx, 1)
}

const openEditTask = (task: Task) => {
  editingTask.value = task
  taskForm.title = task.title
  taskForm.description = task.description || ''
  taskForm.recurringDays = [...task.recurringDays]
  taskForm.isAllDay = task.isAllDay
  taskForm.time = task.time || ''
  showTaskForm.value = true
}

const closeTaskForm = () => {
  showTaskForm.value = false
  editingTask.value = null
  Object.assign(taskForm, { title: '', description: '', recurringDays: [], isAllDay: true, time: '' })
}

const submitTask = async () => {
  if (!goal.value) return
  const payload = {
    title: taskForm.title,
    description: taskForm.description,
    isRecurring: true,
    recurringDays: taskForm.recurringDays,
    isAllDay: taskForm.isAllDay,
    time: taskForm.isAllDay ? undefined : taskForm.time,
    goal: goal.value._id,
    startDate: new Date().toISOString(),
    endDate: goal.value.targetDate,
    priority: 'medium' as const,
  }
  if (editingTask.value) {
    await taskStore.updateTask(editingTask.value._id, payload)
  } else {
    await taskStore.createTask(payload)
  }
  closeTaskForm()
}

const deleteGoalTask = async (id: string) => {
  if (confirm('Delete this task?')) await taskStore.deleteTask(id)
}

// ─── Undo completion ──────────────────────────────────────

const undoDone = async () => {
  if (!goal.value || !confirm('Mark this goal as not completed?')) return
  // Pass null values to unset doneAt / donePhoto fields in the backend
  const updated = await goalStore.updateGoal(goal.value._id, {
    isDone: false,
    doneAt: null,
    donePhoto: null,
    isDonePublic: false,
  } as any)
  goal.value = updated
}

// ─── Lifecycle ────────────────────────────────────────────

onMounted(async () => {
  const id = route.params.id as string
  const { data } = await client.get(`/goals/${id}`)
  goal.value = data
  await taskStore.fetchTasks()
})
</script>
