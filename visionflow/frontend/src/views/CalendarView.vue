<template>
  <div class="px-4 sm:px-0 max-w-6xl mx-auto w-full py-6 lg:flex lg:flex-col lg:h-screen lg:overflow-hidden lg:py-0">
    <div class="flex items-center justify-between mb-4 lg:flex-shrink-0 lg:pt-6">
      <h1 class="page-title">
        <span class="text-indigo-500 flex-shrink-0" v-html="icon('calendar', 'w-7 h-7')" />
        Calendar
      </h1>
      <button @click="openAddTask" class="btn btn-primary">+ New task</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:flex-1 lg:min-h-0 pb-6 lg:pb-3">
      <!-- Calendar grid -->
      <div class="lg:col-span-2 lg:flex lg:flex-col lg:min-h-0">
        <div class="card p-0 overflow-hidden lg:flex-1 lg:flex lg:flex-col lg:min-h-0">
          <div class="flex items-center justify-between px-6 py-3 border-b border-slate-100 flex-shrink-0">
            <button @click="prevMonth" class="p-2 rounded-lg hover:bg-slate-100 bg-transparent border-0 cursor-pointer text-slate-500 text-xl">&#8249;</button>
            <h2 class="font-semibold text-slate-900 text-lg">{{ monthName }} {{ currentYear }}</h2>
            <button @click="nextMonth" class="p-2 rounded-lg hover:bg-slate-100 bg-transparent border-0 cursor-pointer text-slate-500 text-xl">&#8250;</button>
          </div>
          
          <div class="grid grid-cols-7 border-b border-slate-100 flex-shrink-0">
            <div v-for="d in dayHeaders" :key="d" class="text-center text-xs font-semibold text-slate-400 py-2">{{ d }}</div>
          </div>

          <div class="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col lg:overflow-hidden">
          <div v-for="(week, wi) in calendarWeeks" :key="wi" class="relative grid grid-cols-7 min-h-[80px] lg:min-h-0 lg:flex-1">
            <div
              v-for="day in week.days"
              :key="day.date"
              class="p-1.5 border-r border-b border-slate-50 cursor-pointer hover:bg-indigo-50/50 transition-all overflow-hidden min-h-0"
              :class="{
                'bg-indigo-50': day.isToday,
                'opacity-0 pointer-events-none': !day.day,
                'bg-indigo-100/40 ring-2 ring-inset ring-indigo-400': dragOverDate === day.date,
              }"
              @click="day.day && selectDay(day.date)"
              @dragover.prevent="day.day && (dragOverDate = day.date)"
              @dragleave="dragOverDate = null"
              @drop.prevent="day.day && handleDrop(day.date)"
            >
              <div class="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1"
                :class="day.isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'">
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
                    : isOverdue(task, day.date) ? 'bg-red-100 text-red-600'
                    : task.isRecurring ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'"
                  draggable="true"
                  @dragstart.stop="startDrag(task, day.date, $event)"
                  @click.stop
                >
                  <span class="truncate flex-1 min-w-0">{{ task.title }}</span>
                  <div v-if="isShared(task)" class="flex flex-shrink-0">
                    <template v-for="p in getSharedWith(task).slice(0, 3)" :key="p.username">
                      <img v-if="p.avatarUrl" :src="p.avatarUrl" :title="p.username"
                        class="w-3 h-3 rounded-full object-cover ring-1 ring-white -ml-1 first:ml-0" />
                      <span v-else
                        class="w-3 h-3 rounded-full bg-indigo-400 text-white text-[6px] font-bold flex items-center justify-center ring-1 ring-white -ml-1 first:ml-0"
                        :title="p.username">{{ p.username[0]?.toUpperCase() }}</span>
                    </template>
                  </div>
                </div>
                <!-- If there are more tasks than the display limit, show a "+X more" indicator -->
                <div v-if="getDayDisplayInfo(day.date).moreCount > 0" class="text-xs text-slate-400">
                  +{{ getDayDisplayInfo(day.date).moreCount }} more
                </div>
              </div>
            </div>

            <!-- task range bars -->
            <div
              v-for="(bar, bi) in getRangeBarsForWeek(week.days)"
              :key="bar.task._id + '-' + wi"
              class="absolute text-xs flex items-center px-1.5 overflow-hidden select-none cursor-pointer"
              :class="bar.done ? 'bg-emerald-100 text-emerald-700 line-through opacity-60' : isOverdue(bar.task, week.days[bar.startCol].date) ? 'bg-red-100 text-red-600' : 'bg-indigo-200 text-indigo-800'"
              :style="{
                left: 'calc(' + (bar.startCol / 7 * 100) + '% + 2px)',
                width: 'calc(' + (bar.span / 7 * 100) + '% - 4px)',
                top: (36 + bi * 20) + 'px',
                height: '18px',
                borderRadius: (!bar.startsThisWeek ? '0' : '4px') + ' ' + (!bar.endsThisWeek ? '0' : '4px') + ' ' + (!bar.endsThisWeek ? '0' : '4px') + ' ' + (!bar.startsThisWeek ? '0' : '4px'),
              }"
              @click.stop="selectDay(week.days[bar.startCol].date)"
            >
              <span class="truncate leading-none flex-1 min-w-0">{{ bar.label }}</span>
              <!-- Show shared indicator if the task is shared -->
              <div v-if="isShared(bar.task)" class="flex flex-shrink-0 ml-1">
                <template v-for="p in getSharedWith(bar.task).slice(0, 3)" :key="p.username">
                  <img v-if="p.avatarUrl" :src="p.avatarUrl" :title="p.username"
                    class="w-3 h-3 rounded-full object-cover ring-1 ring-white -ml-1 first:ml-0" />
                  <span v-else
                    class="w-3 h-3 rounded-full bg-indigo-500 text-white text-[6px] font-bold flex items-center justify-center ring-1 ring-white -ml-1 first:ml-0"
                    :title="p.username">{{ p.username[0]?.toUpperCase() }}</span>
                </template>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 py-3 text-xs text-slate-500 flex-shrink-0">
          <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded bg-indigo-600" /> Today</div>
          <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded bg-indigo-200" /> Goal task</div>
          <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded bg-sky-200" /> Task</div>
          <div class="flex items-center gap-1.5"><div class="w-4 h-2 rounded-sm bg-indigo-200" /> Date range</div>
          <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded bg-emerald-100" /> Completed</div>
          <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded bg-red-100" /> Overdue</div>
        </div>
      </div>

      <!-- Sidebar: selected day -->
      <div class="flex flex-col gap-3 lg:min-h-0 lg:overflow-hidden lg:max-h-[calc(100vh-theme(spacing.6)-3.5rem-theme(spacing.6))]">
        <!-- Overdue -->
        <div v-if="overdueTasks.length > 0" class="card !p-0 overflow-hidden border-l-4 border-l-red-400 flex-shrink-0 max-h-[50vh] lg:max-h-none overflow-y-auto">
          <button
            @click="overdueOpen = !overdueOpen"
            class="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 transition-all cursor-pointer border-0 text-left"
          >
            <span class="font-semibold text-red-700 text-sm flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500" />
              Overdue
              <span class="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{{ overdueTasks.length }}</span>
            </span>
            <span class="text-red-400 text-xs">{{ overdueOpen ? '▲' : '▼' }}</span>
          </button>
          <!-- Overdue task list -->
          <div v-if="overdueOpen" class="divide-y divide-slate-50">
            <div v-for="task in overdueTasks" :key="task._id"
              class="flex items-center gap-2.5 px-4 py-2 hover:bg-red-50/50 transition-all cursor-pointer"
              @click="selectedDate = taskDueStr(task)"
            >
              <div class="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <span class="text-sm text-slate-700 flex-1 truncate">{{ task.title }}</span>
              <span class="text-xs text-red-400 font-medium flex-shrink-0">{{ daysOverdue(task.dueDate || task.endDate || '') }}d</span>
            </div>
          </div>
        </div>

        <!-- Selected day details -->
        <div class="card min-h-[40vh] lg:min-h-0 lg:flex-1 overflow-y-auto">
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
                  class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all block">
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
import { daysOverdue } from '../utils/dateUtils'
import { useCategoryColors } from '../composables/useCategoryColors'
import TaskCard from '../components/tasks/TaskCard.vue'
import TaskEditModal from '../components/tasks/TaskEditModal.vue'
import { useTaskSharing } from '../composables/useTaskSharing'

// Category dot colour for goal deadline markers on calendar cells
const { catDot: goalDot } = useCategoryColors()

const goalStore = useGoalStore()
const taskStore = useTaskStore()
// Composable that exposes helpers for shared/collaborative tasks
const { getSharedWith, isShared } = useTaskSharing()

// ─── State ────────────────────────────────────────────────────────────────────

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

// Formats a Date to YYYY-MM-DD without timezone conversion issues
const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const todayStr = toLocalDateStr(today)

// The date the user clicked — drives the sidebar task list
const selectedDate = ref<string | null>(toLocalDateStr(today))
const showTaskModal = ref(false)
const editingTask = ref<Task | null>(null)
const editingFromDate = ref<string | null>(null)

// ─── Task modal ───────────────────────────────────────────────────────────────

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

// ─── Drag-and-drop ────────────────────────────────────────────────────────────

const draggingTask = ref<Task | null>(null)
const draggingFromDate = ref<string | null>(null)
const dragOverDate = ref<string | null>(null) // highlights the drop target cell

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
    // Simple task: just move the due date
    await taskStore.updateTask(task._id, { dueDate: toDate })
    if (selectedDate.value === draggingFromDate.value) selectedDate.value = toDate
  } else {
    // Recurring task: skip the dragged occurrence and create a one-off copy on the target date
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

// ─── Calendar grid ────────────────────────────────────────────────────────────

const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const monthName = computed(() =>
  new Date(currentYear.value, currentMonth.value).toLocaleString('en-US', { month: 'long' })
)

// Builds the flat list of day cells — empty cells at the start so Mon is always column 0
const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const mondayOffset = (firstDay + 6) % 7 // convert Sun=0 to Mon=0
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

// Returns goals whose target date falls on the given calendar cell (shown as coloured dots)
const getGoalsForDay = (day: { day: number | null; date: string }) => {
  if (!day.day) return []
  return goalStore.goals.filter(g => toLocalDateStr(new Date(g.targetDate)) === day.date)
}

// Tasks and goal deadlines shown in the sidebar for the selected day
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

// Returns the last index in arr where fn(element) is true
function lastIndex<T>(arr: T[], fn: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) if (fn(arr[i])) return i
  return -1
}

// ─── Range task bars ──────────────────────────────────────────────────────────

type CalendarDay = { day: number | null; date: string; isToday: boolean }
type RangeBar = { task: Task; startCol: number; span: number; done: boolean; label: string; startsThisWeek: boolean; endsThisWeek: boolean }

// Groups the flat day list into rows of 7 for the grid template
const calendarWeeks = computed(() => {
  const days = calendarDays.value
  const weeks: { days: CalendarDay[] }[] = []
  for (let i = 0; i < days.length; i += 7) weeks.push({ days: days.slice(i, i + 7) })
  return weeks
})

// A range task spans multiple days (startDate + endDate, no dueDate, not recurring)
function isRangeTask(task: Task): boolean {
  return !task.isRecurring && !task.dueDate && !!task.startDate && !!task.endDate
}

function getNonRangeTasksForDate(date: string): Task[] {
  return taskStore.getTasksForDate(date).filter(t => !isRangeTask(t))
}

// Calculates visual bar data for range tasks visible in a given week row.
// Returns position info (startCol, span) so bars can be absolutely positioned over the grid.
function getRangeBarsForWeek(weekDays: CalendarDay[]): RangeBar[] {
  const realDays = weekDays.filter(d => d.day !== null)
  if (realDays.length === 0) return []
  const weekStart = realDays[0].date
  const weekEnd = realDays[realDays.length - 1].date

  return taskStore.tasks
    .filter(t => isRangeTask(t) && t.startDate!.split('T')[0] <= weekEnd && t.endDate!.split('T')[0] >= weekStart)
    .slice(0, 3) // max 3 bars per row to prevent overflow
    .map(t => {
      const taskStart = t.startDate!.split('T')[0]
      const taskEnd = t.endDate!.split('T')[0]
      const startsThisWeek = taskStart >= weekStart
      const endsThisWeek = taskEnd <= weekEnd
      const startCol = startsThisWeek ? weekDays.findIndex(d => d.date === taskStart) : weekDays.findIndex(d => d.day !== null)
      const endCol = endsThisWeek
        ? lastIndex(weekDays, d => d.date === taskEnd)
        : lastIndex(weekDays, d => d.day !== null)
      const span = Math.max(1, endCol - startCol + 1)
      return {
        task: t,
        startCol,
        span,
        done: taskStore.isDateCompleted(t, weekDays[startCol].date),
        label: startsThisWeek ? t.title : `↩ ${t.title}`, // ↩ means bar continues from a previous week
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

// ─── Overdue tasks ────────────────────────────────────────────────────────────

const overdueOpen = ref(true)

// Non-recurring tasks whose due/end date has already passed
const overdueTasks = computed(() =>
  taskStore.tasks.filter(t => {
    if (t.isRecurring || t.completed) return false
    if (t.dueDate) return new Date(t.dueDate).toISOString().split('T')[0] < todayStr
    if (t.endDate) return t.endDate.split('T')[0] < todayStr
    return false
  })
)

// Returns the due date string of a task (used to navigate the calendar to that date on click)
function taskDueStr(task: Task): string {
  if (task.dueDate) return new Date(task.dueDate).toISOString().split('T')[0]
  if (task.endDate) return task.endDate.split('T')[0]
  return todayStr
}

function isOverdue(task: Task, dateStr: string): boolean {
  if (task.isRecurring) return false
  if (taskStore.isDateCompleted(task, dateStr)) return false
  if (task.dueDate) return new Date(task.dueDate).toISOString().split('T')[0] < todayStr
  if (task.endDate) return task.endDate.split('T')[0] < todayStr
  return false
}

// Limits how many task chips show per cell — range bars take priority, chips fill remaining space
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
