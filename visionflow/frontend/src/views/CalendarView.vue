<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <div class="page-header">
      <h1 class="page-title">
        <span class="text-blue-500 flex-shrink-0" v-html="icon('calendar', 'w-7 h-7')" />
        Calendar
      </h1>
      <button @click="openAddTask" class="btn btn-primary">+ New task</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar grid -->
      <div class="lg:col-span-2">
        <div class="card p-0 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button @click="prevMonth" class="p-2 rounded-lg hover:bg-slate-100 bg-transparent border-0 cursor-pointer text-slate-500 text-xl">&#8249;</button>
            <h2 class="font-semibold text-slate-900 text-lg">{{ monthName }} {{ year }}</h2>
            <button @click="nextMonth" class="p-2 rounded-lg hover:bg-slate-100 bg-transparent border-0 cursor-pointer text-slate-500 text-xl">&#8250;</button>
          </div>

          <div class="grid grid-cols-7 border-b border-slate-100">
            <div v-for="d in dayHeaders" :key="d" class="text-center text-xs font-semibold text-slate-400 py-2">{{ d }}</div>
          </div>

          <div v-for="(week, wi) in calendarWeeks" :key="wi" class="relative grid grid-cols-7">
            <div
              v-for="day in week.days"
              :key="day.date"
              class="p-1.5 border-r border-b border-slate-50 cursor-pointer hover:bg-blue-50/50 transition-all"
              :style="{ minHeight: (80 + getRangeBarsForWeek(week.days).length * 20) + 'px' }"
              :class="{
                'bg-blue-50': day.isToday,
                'opacity-0 pointer-events-none': !day.day,
                'bg-blue-100/40 ring-2 ring-inset ring-blue-400': dragOverDate === day.date,
              }"
              @click="day.day && selectDay(day.date)"
              @dragover.prevent="day.day && (dragOverDate = day.date)"
              @dragleave="dragOverDate = null"
              @drop.prevent="day.day && handleDrop(day.date)"
            >
              <div class="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1"
                :class="day.isToday ? 'bg-blue-600 text-white' : 'text-slate-700'">
                {{ day.day }}
              </div>
              <div class="flex flex-wrap gap-0.5 mb-0.5">
                <div v-for="goal in getGoalsForDay(day)" :key="goal._id"
                  class="w-1.5 h-1.5 rounded-full" :class="goalDot(goal.category)" :title="goal.title" />
              </div>
              <!-- spacer so chips appear below the range bars -->
              <div :style="{ height: (getRangeBarsForWeek(week.days).length * 20) + 'px' }" />
              <div class="space-y-0.5">
                <div
                  v-for="task in getNonRangeTasksForDate(day.date).slice(0, getDayDisplayInfo(day.date).chipsLimit)"
                  :key="task._id"
                  class="leading-4 flex items-center gap-0.5 cursor-grab active:cursor-grabbing min-w-0 text-xs rounded px-1"
                  :class="taskStore.isDateCompleted(task, day.date)
                    ? 'bg-emerald-100 text-emerald-700 line-through opacity-60'
                    : task.isRecurring ? 'bg-blue-100 text-blue-700' : 'bg-sky-100 text-sky-700'"
                  draggable="true"
                  @dragstart.stop="startDrag(task, day.date, $event)"
                  @click.stop
                >
                  <span class="truncate flex-1 min-w-0">{{ task.title }}</span>
                </div>
                <div v-if="getDayDisplayInfo(day.date).moreCount > 0" class="text-xs text-slate-400">
                  +{{ getDayDisplayInfo(day.date).moreCount }} more
                </div>
              </div>
            </div>

            <!-- Spanning range task bars -->
            <div
              v-for="(bar, bi) in getRangeBarsForWeek(week.days)"
              :key="bar.task._id + '-' + wi"
              class="absolute text-xs flex items-center px-1.5 overflow-hidden select-none cursor-pointer"
              :class="bar.done ? 'bg-emerald-100 text-emerald-700 line-through opacity-60' : 'bg-indigo-200 text-indigo-800'"
              :style="{
                left: 'calc(' + (bar.startCol / 7 * 100) + '% + 2px)',
                width: 'calc(' + (bar.span / 7 * 100) + '% - 4px)',
                top: (36 + bi * 20) + 'px',
                height: '18px',
                borderRadius: (!bar.startsThisWeek ? '0' : '4px') + ' ' + (!bar.endsThisWeek ? '0' : '4px') + ' ' + (!bar.endsThisWeek ? '0' : '4px') + ' ' + (!bar.startsThisWeek ? '0' : '4px'),
              }"
              @click.stop="selectDay(week.days[bar.startCol].date)"
            >
              <span class="truncate leading-none">{{ bar.label }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
          <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded bg-blue-600" /> Today</div>
          <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded bg-blue-200" /> Goal task</div>
          <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded bg-sky-200" /> Task</div>
          <div class="flex items-center gap-1.5"><div class="w-4 h-2 rounded-sm bg-indigo-200" /> Date range</div>
          <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded bg-emerald-100" /> Completed</div>
        </div>
      </div>

      <!-- Sidebar: selected day -->
      <div>
        <div class="card">
          <h3 class="font-semibold text-slate-900 mb-3">
            {{ selectedDate ? formatSelectedDate(selectedDate) : 'Select a day' }}
          </h3>

          <div v-if="selectedDate">
            <div v-if="dayTasks.length === 0 && dayGoals.length === 0" class="text-sm text-slate-400 text-center py-4">
              Nothing scheduled
            </div>

            <div v-if="dayTasks.length > 0" class="mb-4">
              <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Tasks</p>
              <div class="space-y-2">
                <TaskCard
                  v-for="task in dayTasks"
                  :key="task._id"
                  :task="task"
                  :date="selectedDate"
                  @edit="openEditTask(task)"
                  @drag-start="({ task: t, date: d, event: e }) => startDrag(t, d, e)"
                />
              </div>
            </div>

            <div v-if="dayGoals.length > 0">
              <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Goal Deadlines</p>
              <div class="space-y-2">
                <router-link v-for="goal in dayGoals" :key="goal._id" :to="`/goals/${goal._id}`"
                  class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all block">
                  <div class="w-2 h-2 rounded-full flex-shrink-0" :class="goalDot(goal.category)" />
                  <span class="text-sm text-slate-700 font-medium">{{ goal.title }}</span>
                  <span class="text-xs text-slate-400 ml-auto">{{ goal.category }}</span>
                </router-link>
              </div>
            </div>

            <button @click="openAddTask" class="btn btn-secondary w-full mt-3 text-sm">
              + Add new task
            </button>
          </div>
        </div>
      </div>
    </div>

    <TaskEditModal
      :show="showTaskModal"
      :task="editingTask"
      :default-date="selectedDate || today.toISOString().split('T')[0]"
      :from-date="editingFromDate"
      @close="closeTaskModal"
      @navigate-to="(date) => { selectedDate = date; closeTaskModal() }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGoalStore } from '../stores/goalStore'
import { useTaskStore } from '../stores/taskStore'
import type { Task } from '../types/Task'
import { icon } from '../utils/icons'
import TaskCard from '../components/tasks/TaskCard.vue'
import TaskEditModal from '../components/tasks/TaskEditModal.vue'

const goalStore = useGoalStore()
const taskStore = useTaskStore()

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const selectedDate = ref<string | null>(toLocalDateStr(today))
const showTaskModal = ref(false)
const editingTask = ref<Task | null>(null)
const editingFromDate = ref<string | null>(null)

const openAddTask = () => {
  editingTask.value = null
  editingFromDate.value = null
  showTaskModal.value = true
}

const openEditTask = (task: Task) => {
  editingTask.value = task
  editingFromDate.value = selectedDate.value
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  editingTask.value = null
  editingFromDate.value = null
}

// Drag-and-drop
const draggingTask = ref<Task | null>(null)
const draggingFromDate = ref<string | null>(null)
const dragOverDate = ref<string | null>(null)

const startDrag = (task: Task, fromDate: string, e: DragEvent) => {
  draggingTask.value = task
  draggingFromDate.value = fromDate
  e.dataTransfer?.setData('text/plain', task._id)
}

const handleDrop = async (toDate: string) => {
  dragOverDate.value = null
  if (!draggingTask.value || draggingFromDate.value === toDate) {
    draggingTask.value = null
    draggingFromDate.value = null
    return
  }
  const task = draggingTask.value
  if (!task.isRecurring) {
    await taskStore.updateTask(task._id, { dueDate: toDate })
    if (selectedDate.value === draggingFromDate.value) selectedDate.value = toDate
  } else {
    await taskStore.skipDateTask(task._id, draggingFromDate.value!)
    await taskStore.createTask({
      title: task.title,
      description: task.description || '',
      dueDate: toDate,
      isAllDay: task.isAllDay,
      time: task.time,
      isRecurring: false,
      priority: task.priority || 'medium',
      subTasks: (task.subTasks || []).map(s => ({ ...s })),
    })
    selectedDate.value = toDate
  }
  draggingTask.value = null
  draggingFromDate.value = null
}

// Calendar grid
const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const year = computed(() => currentYear.value)
const monthName = computed(() =>
  new Date(currentYear.value, currentMonth.value).toLocaleString('en-US', { month: 'long' })
)

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const mondayOffset = (firstDay + 6) % 7
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days: { day: number | null; date: string; isToday: boolean }[] = []
  for (let i = 0; i < mondayOffset; i++) days.push({ day: null, date: `empty-${i}`, isToday: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const y = currentYear.value
    const m = String(currentMonth.value + 1).padStart(2, '0')
    const ds = String(d).padStart(2, '0')
    const dateStr = `${y}-${m}-${ds}`
    const isToday = y === today.getFullYear() && currentMonth.value === today.getMonth() && d === today.getDate()
    days.push({ day: d, date: dateStr, isToday })
  }
  return days
})

const selectDay = (date: string) => { selectedDate.value = date }

const getGoalsForDay = (day: { day: number | null; date: string }) => {
  if (!day.day) return []
  return goalStore.goals.filter(g => toLocalDateStr(new Date(g.targetDate)) === day.date)
}

const dayTasks = computed(() => selectedDate.value ? taskStore.getTasksForDate(selectedDate.value) : [])
const dayGoals = computed(() => selectedDate.value ? getGoalsForDay({ day: 1, date: selectedDate.value }) : [])

const prevMonth = () => {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } else currentMonth.value--
}
const nextMonth = () => {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } else currentMonth.value++
}

const formatSelectedDate = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

const goalDot = (cat: string) => ({
  Health: 'bg-emerald-500', Career: 'bg-blue-500', Finance: 'bg-yellow-500',
  Education: 'bg-purple-500', Personal: 'bg-pink-500', Other: 'bg-slate-400',
}[cat] || 'bg-slate-400')

type CalendarDay = { day: number | null; date: string; isToday: boolean }
type RangeBar = { task: Task; startCol: number; span: number; done: boolean; label: string; startsThisWeek: boolean; endsThisWeek: boolean }

const calendarWeeks = computed(() => {
  const days = calendarDays.value
  const weeks: { days: CalendarDay[] }[] = []
  for (let i = 0; i < days.length; i += 7) weeks.push({ days: days.slice(i, i + 7) })
  return weeks
})

function isRangeTask(task: Task): boolean {
  return !task.isRecurring && !task.dueDate && !!task.startDate && !!task.endDate
}

function getNonRangeTasksForDate(date: string): Task[] {
  return taskStore.getTasksForDate(date).filter(t => !isRangeTask(t))
}

function getRangeBarsForWeek(weekDays: CalendarDay[]): RangeBar[] {
  const realDays = weekDays.filter(d => d.day !== null)
  if (realDays.length === 0) return []
  const weekStart = realDays[0].date
  const weekEnd = realDays[realDays.length - 1].date

  return taskStore.tasks
    .filter(t => isRangeTask(t) && t.startDate!.split('T')[0] <= weekEnd && t.endDate!.split('T')[0] >= weekStart)
    .slice(0, 3)
    .map(t => {
      const taskStart = t.startDate!.split('T')[0]
      const taskEnd = t.endDate!.split('T')[0]
      const startsThisWeek = taskStart >= weekStart
      const endsThisWeek = taskEnd <= weekEnd
      const startCol = startsThisWeek ? weekDays.findIndex(d => d.date === taskStart) : weekDays.findIndex(d => d.day !== null)
      const endCol = endsThisWeek
        ? weekDays.findLastIndex(d => d.date === taskEnd)
        : weekDays.findLastIndex(d => d.day !== null)
      const span = Math.max(1, endCol - startCol + 1)
      return {
        task: t,
        startCol,
        span,
        done: taskStore.isDateCompleted(t, weekDays[startCol].date),
        label: startsThisWeek ? t.title : `↩ ${t.title}`,
        startsThisWeek,
        endsThisWeek,
      }
    })
}

function getRangeTaskCountForDay(date: string): number {
  return taskStore.tasks.filter(t =>
    isRangeTask(t) &&
    date >= t.startDate!.split('T')[0] &&
    date <= t.endDate!.split('T')[0]
  ).length
}

function getDayDisplayInfo(date: string): { chipsLimit: number; moreCount: number } {
  const rangeShown = Math.min(3, getRangeTaskCountForDay(date))
  const chipsLimit = Math.max(0, 3 - rangeShown)
  const nonRangeCount = getNonRangeTasksForDate(date).length
  const chipsShown = Math.min(nonRangeCount, chipsLimit)
  const moreCount = Math.max(0, taskStore.getTasksForDate(date).length - rangeShown - chipsShown)
  return { chipsLimit, moreCount }
}

onMounted(() => { goalStore.fetchGoals(); taskStore.fetchTasks() })
</script>
