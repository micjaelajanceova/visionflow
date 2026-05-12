<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <router-link to="/goals" class="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
      ← Back to Goals
    </router-link>

    <div v-if="!goal" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
    </div>

    <div v-else>
      <!-- Header card -->
      <div class="card mb-6">
        <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div class="flex flex-wrap gap-2">
            <span class="badge bg-indigo-100 text-indigo-700">{{ goal.category }}</span>
            <span v-if="goal.isPublic" class="badge bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <span v-html="icon('explore', 'w-3 h-3')" />Public
            </span>
            <span v-if="goal.isDone" class="badge bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1">
              <span v-html="icon('checkCircle', 'w-3 h-3')" />Completed!
            </span>
            <span v-else-if="isOverdue" class="badge bg-red-100 text-red-600">{{ daysLeft }} days over deadline</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-400 flex items-center gap-1">
              <span class="text-slate-400" v-html="icon('calendar', 'w-4 h-4')" />
              Due {{ formatDate(goal.targetDate) }}
            </span>
            <button v-if="!goal.isDone" @click="openEditGoal" class="btn btn-secondary text-xs py-1.5 px-3">Edit</button>
          </div>
        </div>

        <h1 class="text-2xl font-bold text-slate-900 mb-2">{{ goal.title }}</h1>
        <p v-if="goal.description" class="text-slate-600">{{ goal.description }}</p>

        <img v-if="goal.imageData" :src="goal.imageData" :alt="goal.title" class="w-full max-h-80 max-w-full object-cover rounded-xl mt-4" style="max-height:320px;max-width:100%;" />

        <!-- Done button -->
        <div v-if="!goal.isDone" class="mt-4 pt-4 border-t border-slate-100">
          <button @click="showDoneModal = true" class="btn btn-success gap-2">
            <span v-html="icon('trophy', 'w-4 h-4')" />
            Mark as Done
          </button>
        </div>
        <div v-else class="mt-4 pt-4 border-t border-slate-100">
          <p class="text-sm text-emerald-600 font-medium mb-2">
            Completed on {{ goal.doneAt ? formatDate(goal.doneAt) : '' }}
          </p>
          <img v-if="goal.donePhoto" :src="goal.donePhoto" class="rounded-xl object-cover" style="max-height:320px;max-width:100%;" />
        </div>
      </div>

      <!-- Goal tasks -->
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

        <div v-else class="space-y-3">
          <div v-for="task in goalTasks" :key="task._id" class="border border-slate-100 rounded-xl p-4">
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
              <div class="flex justify-between text-xs text-slate-500 mb-1">
                <span>{{ task.completedDates.length }} completed</span>
                <span>{{ taskProgress(task) }}%</span>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-500 rounded-full transition-all" :style="{ width: taskProgress(task) + '%' }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Task Modal -->
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

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Repeat on days *</label>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="(name, i) in dayNames"
                :key="i"
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
              <button
                type="button"
                @click="taskForm.isAllDay = true"
                class="flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                :class="taskForm.isAllDay ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'"
              >All day</button>
              <button
                type="button"
                @click="taskForm.isAllDay = false"
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

    <!-- Edit Goal Modal -->
    <div v-if="showEditGoal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showEditGoal = false">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-slate-900">Edit Goal</h2>
          <button @click="showEditGoal = false" class="text-slate-400 hover:text-slate-600 text-2xl bg-transparent border-0 cursor-pointer">×</button>
        </div>
        <form @submit.prevent="submitEditGoal" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input v-model="editGoalForm.title" required class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea v-model="editGoalForm.description" rows="2" class="input resize-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select v-model="editGoalForm.category" class="input">
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Target date *</label>
            <input v-model="editGoalForm.targetDate" type="date" required class="input" />
          </div>
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="editGoalForm.isPublic" type="checkbox" class="w-4 h-4 accent-indigo-600" />
            <span class="text-sm text-slate-700">Show on Explore (public)</span>
          </label>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Picture</label>
            <div
              class="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:border-indigo-400 transition-all"
              @click="editPicInput?.click()"
            >
              <img v-if="editGoalForm.imagePreview" :src="editGoalForm.imagePreview" class="max-h-36 mx-auto rounded-lg object-cover mb-2" />
              <p class="text-xs text-slate-400">{{ editGoalForm.imagePreview ? 'Click to replace' : 'Click to add a picture' }}</p>
            </div>
            <input ref="editPicInput" type="file" accept="image/*" class="hidden" @change="handleEditPic" />
            <button
              v-if="editGoalForm.imagePreview"
              type="button"
              @click="editGoalForm.imagePreview = ''; editGoalForm.imageData = null"
              class="btn btn-secondary text-xs mt-2 text-red-500"
            >Remove picture</button>
          </div>
          <div class="flex gap-3 pt-1">
            <button type="submit" class="btn btn-primary flex-1">Save Changes</button>
            <button type="button" @click="showEditGoal = false" class="btn btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Done Modal -->
    <div v-if="showDoneModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showDoneModal = false">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span class="text-indigo-500" v-html="icon('trophy', 'w-5 h-5')" />Goal Completed!
          </h2>
          <button @click="showDoneModal = false" class="text-slate-400 hover:text-slate-600 text-2xl bg-transparent border-0 cursor-pointer">×</button>
        </div>
        <p class="text-sm text-slate-500 mb-4">Celebrate your achievement! Optionally add a photo and share with the community.</p>

        <div
          class="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition-all mb-4"
          @click="donePhotoInput?.click()"
        >
          <div v-if="donePhotoPreview">
            <img :src="donePhotoPreview" class="max-h-36 mx-auto rounded-lg object-cover" />
          </div>
          <div v-else class="py-3">
            <div class="flex justify-center mb-1">
              <span class="text-slate-300" v-html="icon('camera', 'w-10 h-10')" />
            </div>
            <p class="text-sm text-slate-500">Add a celebration photo (optional)</p>
          </div>
        </div>
        <input ref="donePhotoInput" type="file" accept="image/*" capture="environment" class="hidden" @change="handleDonePhoto" />

        <label class="flex items-center gap-3 cursor-pointer mb-4">
          <input v-model="donePublic" type="checkbox" class="w-4 h-4 accent-indigo-600" />
          <span class="text-sm text-slate-700">Share publicly on Explore</span>
        </label>

        <div class="flex gap-3">
          <button @click="submitDone" class="btn btn-success flex-1">Mark as Done</button>
          <button @click="showDoneModal = false" class="btn btn-secondary px-6">Cancel</button>
        </div>
      </div>
    </div>
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

const route = useRoute()
const goalStore = useGoalStore()
const taskStore = useTaskStore()

const goal = ref<Goal | null>(null)
const showTaskForm = ref(false)
const editingTask = ref<Task | null>(null)
const showDoneModal = ref(false)
const showEditGoal = ref(false)
const categories = ['Health', 'Career', 'Finance', 'Education', 'Personal', 'Other']
const editGoalForm = reactive({ title: '', description: '', category: '', targetDate: '', isPublic: false, imagePreview: '', imageData: null as string | null })
const editPicInput = ref<HTMLInputElement | null>(null)

const openEditGoal = () => {
  if (!goal.value) return
  editGoalForm.title = goal.value.title
  editGoalForm.description = goal.value.description || ''
  editGoalForm.category = goal.value.category
  editGoalForm.targetDate = new Date(goal.value.targetDate).toISOString().split('T')[0]
  editGoalForm.isPublic = goal.value.isPublic
  editGoalForm.imagePreview = goal.value.imageData || ''
  editGoalForm.imageData = goal.value.imageData || null
  showEditGoal.value = true
}

const handleEditPic = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = ev.target?.result as string
    editGoalForm.imagePreview = result
    editGoalForm.imageData = result
  }
  reader.readAsDataURL(file)
}

const submitEditGoal = async () => {
  if (!goal.value) return
  const updated = await goalStore.updateGoal(goal.value._id, {
    title: editGoalForm.title,
    description: editGoalForm.description,
    category: editGoalForm.category as any,
    targetDate: editGoalForm.targetDate as any,
    isPublic: editGoalForm.isPublic,
    imageData: editGoalForm.imageData,
  })
  goal.value = updated
  showEditGoal.value = false
}
const donePhotoPreview = ref('')
const donePhotoData = ref('')
const donePublic = ref(false)
const donePhotoInput = ref<HTMLInputElement | null>(null)

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const taskForm = reactive({
  title: '',
  description: '',
  recurringDays: [] as number[],
  isAllDay: true,
  time: '',
})

const goalTasks = computed(() =>
  taskStore.tasks.filter(t => t.goal === goal.value?._id || t.goalId === goal.value?._id)
)

const isOverdue = computed(() => {
  if (!goal.value || goal.value.isDone) return false
  return new Date(goal.value.targetDate) < new Date()
})

const daysLeft = computed(() => {
  if (!goal.value) return 0
  return Math.abs(Math.ceil((new Date(goal.value.targetDate).getTime() - Date.now()) / 86400000))
})

const taskProgress = (task: Task) => {
  if (!goal.value) return 0
  const start = task.startDate ? new Date(task.startDate) : new Date(goal.value.createdAt)
  const end = new Date() < new Date(goal.value.targetDate) ? new Date() : new Date(goal.value.targetDate)
  let total = 0
  const cur = new Date(start)
  while (cur <= end) {
    const day = (cur.getDay() + 6) % 7
    if (task.recurringDays.includes(day)) total++
    cur.setDate(cur.getDate() + 1)
  }
  if (total === 0) return 0
  return Math.round((task.completedDates.length / total) * 100)
}

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
  taskForm.title = ''
  taskForm.description = ''
  taskForm.recurringDays = []
  taskForm.isAllDay = true
  taskForm.time = ''
}

const submitTask = async () => {
  if (!goal.value) return
  const data = {
    title: taskForm.title,
    description: taskForm.description,
    isRecurring: true,
    recurringDays: taskForm.recurringDays,
    isAllDay: taskForm.isAllDay,
    time: taskForm.isAllDay ? undefined : taskForm.time,
    goal: goal.value._id,
    startDate: new Date().toISOString(),
    endDate: goal.value.targetDate,
    priority: 'medium',
  }
  if (editingTask.value) {
    await taskStore.updateTask(editingTask.value._id, data)
  } else {
    await taskStore.createTask(data)
  }
  closeTaskForm()
}

const deleteGoalTask = async (id: string) => {
  if (confirm('Delete this task?')) await taskStore.deleteTask(id)
}

const handleDonePhoto = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    donePhotoData.value = ev.target?.result as string
    donePhotoPreview.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

const submitDone = async () => {
  if (!goal.value) return
  await goalStore.markDone(goal.value._id, donePhotoData.value || undefined, donePublic.value)
  const { data } = await client.get(`/goals/${goal.value._id}`)
  goal.value = data
  showDoneModal.value = false
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

onMounted(async () => {
  const id = route.params.id as string
  const { data } = await client.get(`/goals/${id}`)
  goal.value = data
  await taskStore.fetchTasks()
})
</script>
