<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="handleClose">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

      <!-- Step indicator -->
      <div class="p-6 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
            :class="step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'"
            @click="step = 1"
          >{{ step === 1 ? '1' : '✓' }}</div>
          <div class="w-8 h-0.5" :class="step === 2 ? 'bg-blue-600' : 'bg-slate-200'" />
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            :class="step === 2 ? 'bg-blue-600 text-white' : (editingGoal ? 'bg-slate-200 text-slate-500 cursor-pointer hover:bg-blue-100' : 'bg-slate-200 text-slate-400')"
            @click="editingGoal && goToStep2()"
          >2</div>
          <span class="text-sm text-slate-500 ml-1">{{ step === 1 ? 'Goal details' : 'Add a task' }}</span>
        </div>
        <button @click="handleClose" class="text-slate-400 hover:text-slate-600 text-2xl leading-none bg-transparent border-0 cursor-pointer">×</button>
      </div>

      <!-- Step 1: Goal info -->
      <form v-if="step === 1" @submit.prevent="() => {}" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Goal title *</label>
          <input v-model="form.title" placeholder="e.g. Run a 5K" required class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea v-model="form.description" placeholder="What does this goal mean to you?" rows="3" class="input resize-none" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select v-model="form.category" class="input">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Target date *</label>
            <input v-model="form.targetDate" type="date" required class="input" />
          </div>
        </div>

        <!-- Image upload -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Vision board image</label>
          <div
            class="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-all"
            @click="imageInput?.click()"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <div v-if="imagePreview" class="relative">
              <img :src="imagePreview" class="max-h-40 mx-auto rounded-lg object-cover" />
              <button
                type="button"
                @click.stop="clearImage"
                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center cursor-pointer border-0"
              >×</button>
            </div>
            <div v-else class="py-3">
              <div class="flex justify-center mb-2">
                <span class="text-slate-300" v-html="icon('camera', 'w-10 h-10')" />
              </div>
              <p class="text-sm text-slate-500">Click or drag & drop an image</p>
              <p class="text-xs text-slate-400 mt-1">Shown in your Vision Board</p>
            </div>
          </div>
          <input ref="imageInput" type="file" accept="image/*" capture="environment" class="hidden" @change="handleImageUpload" />
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" @click="submitGoal(false)" :disabled="!form.title || !form.targetDate" class="btn-primary btn flex-1 disabled:opacity-50">
            {{ editingGoal ? 'Update Goal' : 'Create Goal' }}
          </button>
          <button v-if="editingGoal" type="button" @click="goToStep2()" class="btn-secondary btn flex-1">
            Add Task →
          </button>
          <button v-if="!editingGoal" type="button" @click="submitGoal(true)" :disabled="!form.title || !form.targetDate" class="btn-secondary btn flex-1 disabled:opacity-50">
            Create & Add Task
          </button>
        </div>
      </form>

      <!-- Step 2: Add first task -->
      <div v-if="step === 2" class="p-6 space-y-4">
        <button @click="step = 1" class="text-xs text-slate-400 hover:text-blue-600 bg-transparent border-0 cursor-pointer p-0 mb-1">← Back to goal details</button>
        <p class="text-sm text-slate-500">Add a recurring task to your goal. You can add more tasks later from the goal page.</p>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Task name *</label>
          <input v-model="taskForm.title" placeholder="e.g. Go to the gym" class="input" />
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
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300'"
            >{{ name }}</button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Timing</label>
          <div class="flex gap-2">
            <button type="button" @click="taskForm.isAllDay = true" class="flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer"
              :class="taskForm.isAllDay ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'">All day</button>
            <button type="button" @click="taskForm.isAllDay = false" class="flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer"
              :class="!taskForm.isAllDay ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'">Specific time</button>
          </div>
          <input v-if="!taskForm.isAllDay" v-model="taskForm.time" type="time" class="input mt-2" />
        </div>

        <div class="flex gap-3 pt-1">
          <button @click="submitTask" :disabled="!taskForm.title || !taskForm.recurringDays.length" class="btn btn-primary flex-1 disabled:opacity-50">
            Add Task & Finish
          </button>
          <button @click="handleClose" class="btn btn-secondary px-6">Skip</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Goal } from '../../types/Goal'
import { useGoalStore } from '../../stores/goalStore'
import { useTaskStore } from '../../stores/taskStore'
import { icon } from '../../utils/icons'

const props = defineProps<{ editingGoal?: Goal | null }>()
const emit = defineEmits<{ (e: 'done'): void; (e: 'close'): void }>()

const goalStore = useGoalStore()
const taskStore = useTaskStore()

const categories: Goal['category'][] = ['Health', 'Career', 'Finance', 'Education', 'Personal', 'Other']
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const step = ref(1)
const createdGoalId = ref('')
const createdGoalTargetDate = ref('')

const form = reactive({
  title: '',
  description: '',
  category: 'Personal' as Goal['category'],
  targetDate: '',
  imageData: '',
})

const taskForm = reactive({
  title: '',
  description: '',
  recurringDays: [] as number[],
  isAllDay: true,
  time: '',
})

const imagePreview = ref('')
const imageInput = ref<HTMLInputElement | null>(null)

const clearImage = () => {
  imagePreview.value = ''
  form.imageData = ''
  if (imageInput.value) imageInput.value.value = ''
}

const loadImageFile = (file: File) => {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    imagePreview.value = result
    form.imageData = result
  }
  reader.readAsDataURL(file)
}

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadImageFile(file)
}

const handleDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file) loadImageFile(file)
}

const submitGoal = async (goToTask: boolean) => {
  if (!form.title || !form.targetDate) return
  if (props.editingGoal) {
    await goalStore.updateGoal(props.editingGoal._id, { ...form })
    emit('done')
    return
  }
  const goal = await goalStore.createGoal({ ...form })
  if (goToTask) {
    createdGoalId.value = goal._id
    createdGoalTargetDate.value = goal.targetDate
    step.value = 2
  } else {
    emit('done')
  }
}

const toggleDay = (day: number) => {
  const idx = taskForm.recurringDays.indexOf(day)
  if (idx === -1) taskForm.recurringDays.push(day)
  else taskForm.recurringDays.splice(idx, 1)
}

const submitTask = async () => {
  if (!taskForm.title || !taskForm.recurringDays.length) return
  await taskStore.createTask({
    title: taskForm.title,
    description: taskForm.description,
    isRecurring: true,
    recurringDays: taskForm.recurringDays,
    isAllDay: taskForm.isAllDay,
    time: taskForm.isAllDay ? undefined : taskForm.time,
    goal: createdGoalId.value,
    startDate: new Date().toISOString(),
    endDate: createdGoalTargetDate.value,
    priority: 'medium',
  })
  emit('done')
}

const goToStep2 = () => {
  if (props.editingGoal) {
    createdGoalId.value = props.editingGoal._id
    createdGoalTargetDate.value = props.editingGoal.targetDate
    step.value = 2
  }
}

const handleClose = () => emit('close')

watch(() => props.editingGoal, (goal) => {
  if (!goal) return
  form.title = goal.title
  form.description = goal.description
  form.category = goal.category
  form.targetDate = new Date(goal.targetDate).toISOString().split('T')[0]
  form.imageData = goal.imageData || ''
  imagePreview.value = goal.imageData || ''
}, { immediate: true })
</script>
