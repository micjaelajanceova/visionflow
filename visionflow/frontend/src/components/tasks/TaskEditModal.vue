<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="emit('close')">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-slate-900">{{ task ? 'Edit Task' : 'Task' }}</h2>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 text-2xl bg-transparent border-0 cursor-pointer">&#215;</button>
      </div>

      <form @submit.prevent="submitTask" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Task *</label>
          <input v-model="form.title" placeholder="e.g. Buy groceries" required class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea v-model="form.description" rows="2" placeholder="Optional details" class="input resize-none" />
        </div>

        <!-- Checklist (only for non-recurring tasks) -->
        <div v-if="!task || !task.isRecurring">
          <label class="block text-sm font-medium text-slate-700 mb-2">Checklist items</label>
          <div class="space-y-2 mb-2">
            <div v-for="(sub, i) in form.subTasks" :key="i" class="flex items-center gap-2">
              <input type="checkbox" v-model="sub.completed" class="w-4 h-4 accent-indigo-600 flex-shrink-0" />
              <input v-model="sub.title" class="input py-1.5 text-sm flex-1" placeholder="e.g. Milk" />
              <button type="button" @click="removeSubTask(i)"
                class="text-slate-300 hover:text-red-400 bg-transparent border-0 cursor-pointer text-lg flex-shrink-0">&#10005;</button>
            </div>
          </div>
          <button type="button" @click="addSubTask"
            class="text-xs text-indigo-600 hover:underline bg-transparent border-0 cursor-pointer p-0">
            + Add checklist item
          </button>
        </div>

        <!-- Date section (only for non-recurring tasks) -->
        <div v-if="!task || !task.isRecurring">
          <div v-if="!task" class="flex gap-2 mb-3">
            <button type="button" @click="form.dateMode = 'single'"
              class="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
              :class="form.dateMode === 'single' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'">
              Single day
            </button>
            <button type="button" @click="form.dateMode = 'range'"
              class="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
              :class="form.dateMode === 'range' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'">
              Date range
            </button>
          </div>

          <div v-if="form.dateMode === 'single'">
            <label class="block text-sm font-medium text-slate-700 mb-1">Date *</label>
            <input v-model="form.dueDate" type="date" :required="form.dateMode === 'single' && !task" class="input" />
          </div>

          <div v-else class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">From *</label>
              <input v-model="form.dateFrom" type="date" required class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">To *</label>
              <input v-model="form.dateTo" type="date" :min="form.dateFrom" required class="input" />
            </div>
          </div>
        </div>

        <!-- Move occurrence (only for recurring tasks being edited) -->
        <div v-if="task && task.isRecurring" class="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Move this week's occurrence to a different day
          </label>
          <input v-model="form.moveToDate" type="date" class="input bg-white" />
          <p class="text-xs text-slate-400 mt-1.5">
            Only this specific occurrence moves. The recurring schedule stays the same.
          </p>
        </div>

        <!-- Timing -->
        <div v-if="form.dateMode !== 'range' && !(task && !task.isRecurring && !task.dueDate && task.startDate && task.endDate)">
          <label class="block text-sm font-medium text-slate-700 mb-2">Timing</label>
          <div class="flex gap-2">
            <button type="button" @click="form.isAllDay = true" class="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
              :class="form.isAllDay ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'">All day</button>
            <button type="button" @click="form.isAllDay = false" class="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
              :class="!form.isAllDay ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'">Specific time</button>
          </div>
          <div v-if="!form.isAllDay" class="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label class="block text-xs text-slate-500 mb-1">From</label>
              <input v-model="form.time" type="time" class="input" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">To (optional)</label>
              <input v-model="form.endTime" type="time" :min="form.time || undefined" class="input" />
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-1">
          <button type="submit" class="btn btn-primary flex-1">{{ task ? 'Save Changes' : 'Add Task' }}</button>
          <button type="button" @click="emit('close')" class="btn btn-secondary px-6">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import type { Task } from '../../types/Task'

const props = defineProps<{
  show: boolean
  task: Task | null
  defaultDate: string
  fromDate: string | null
}>()

const emit = defineEmits<{
  close: []
  'navigate-to': [date: string]
}>()

const taskStore = useTaskStore()

const form = reactive({
  title: '',
  description: '',
  dateMode: 'single' as 'single' | 'range',
  dueDate: '',
  dateFrom: '',
  dateTo: '',
  isAllDay: true,
  time: '',
  endTime: '',
  subTasks: [] as { title: string; completed: boolean }[],
  moveToDate: '',
})

watch(() => props.show, (visible) => {
  if (!visible) return
  const t = props.task
  // If no task, initialize with defaults.
  if (!t) {
    form.title = ''
    form.description = ''
    form.dateMode = 'single'
    form.dueDate = props.defaultDate
    form.dateFrom = props.defaultDate
    form.dateTo = props.defaultDate
    form.isAllDay = true
    form.time = ''
    form.endTime = ''
    form.subTasks = []
    form.moveToDate = ''
  } 
  // If editing an existing task, pre-fill with its values. 
  else {
    form.title = t.title
    form.description = t.description || ''
    if (!t.isRecurring && !t.dueDate && t.startDate && t.endDate) {
      form.dateMode = 'range'
      form.dateFrom = t.startDate.split('T')[0]
      form.dateTo = t.endDate.split('T')[0]
      form.dueDate = ''
    } 
    // For recurring tasks or tasks with a due date, use single date mode with dueDate.
    else {
      form.dateMode = 'single'
      form.dueDate = t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : ''
      form.dateFrom = ''
      form.dateTo = ''
    }
    form.isAllDay = t.isAllDay
    form.time = t.time || ''
    form.endTime = t.endTime || ''
    form.subTasks = (t.subTasks || []).map(s => ({ ...s }))
    form.moveToDate = ''
  }
})

const addSubTask = () => form.subTasks.push({ title: '', completed: false })
const removeSubTask = (i: number) => form.subTasks.splice(i, 1)
const submitTask = async () => {
  const subTasks = form.subTasks.filter(s => s.title.trim())
  if (props.task) {
    // If it's a recurring task and the user chose to move this occurrence to a different date, we need to skip this date in the recurring series and create a new one-off task for the moved occurrence
    if (props.task.isRecurring && form.moveToDate && props.fromDate && form.moveToDate !== props.fromDate) {
      await taskStore.skipDateTask(props.task._id, props.fromDate)
      await taskStore.createTask({
        title: form.title,
        description: form.description,
        dueDate: form.moveToDate,
        isAllDay: form.isAllDay,
        time: form.isAllDay ? undefined : form.time,
        isRecurring: false,
        priority: props.task.priority || 'medium',
        subTasks,
      })
      emit('navigate-to', form.moveToDate)
    } 
    else {
      const patch: Partial<Task> = {
        title: form.title,
        description: form.description,
        isAllDay: form.isAllDay,
        time: form.isAllDay ? undefined : form.time,
        endTime: form.isAllDay ? undefined : (form.endTime || undefined),
        subTasks,
      }
      // Only allow changing dates for non-recurring tasks, or if the recurring task doesn't have fixed dates (i.e. it uses dueDate instead of start/end)
      if (!props.task.isRecurring) {
        if (form.dateMode === 'range') {
          patch.startDate = form.dateFrom as any
          patch.endDate = form.dateTo as any
          patch.dueDate = undefined
        } else if (form.dueDate) {
          patch.dueDate = form.dueDate as any
          patch.startDate = undefined
          patch.endDate = undefined
        }
      }
      await taskStore.updateTask(props.task._id, patch)
    }
  } 
  else {
    const newTask: Partial<Task> = {
      title: form.title,
      description: form.description,
      isAllDay: form.isAllDay,
      time: form.isAllDay ? undefined : form.time,
      endTime: form.isAllDay ? undefined : (form.endTime || undefined),
      isRecurring: false,
      priority: 'medium',
      subTasks,
    }
    if (form.dateMode === 'range') {
      newTask.startDate = form.dateFrom as any
      newTask.endDate = form.dateTo as any
    } else {
      newTask.dueDate = form.dueDate as any
    }
    await taskStore.createTask(newTask)
  }
  emit('close')
}
</script>
