<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <div class="page-header">
      <h1 class="page-title">
        <span class="text-blue-500 flex-shrink-0" v-html="icon('calendar', 'w-7 h-7')" />
        Calendar
      </h1>
      <button @click="openAddTask(null)" class="btn btn-primary">+ New task</button>
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

          <div class="grid grid-cols-7">
            <div
              v-for="day in calendarDays"
              :key="day.date"
              class="min-h-[80px] p-1.5 border-r border-b border-slate-50 cursor-pointer hover:bg-blue-50/50 transition-all"
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
              <div class="space-y-0.5">
                <div
                  v-for="task in taskStore.getTasksForDate(day.date).slice(0, 2)"
                  :key="task._id"
                  class="leading-4 flex items-center gap-0.5 cursor-grab active:cursor-grabbing min-w-0"
                  :class="rangeChipClass(task, day.date)"
                  draggable="true"
                  @dragstart.stop="startDrag(task, day.date, $event)"
                  @click.stop
                >
                  <span class="truncate flex-1 min-w-0">{{ rangeChipLabel(task, day.date) }}</span>
                  <template v-for="p in getSharedParticipants(task).slice(0, 1)" :key="p.username">
                    <img v-if="p.avatarUrl" :src="p.avatarUrl" :title="p.username"
                      class="w-3 h-3 rounded-full flex-shrink-0 object-cover ring-1 ring-white" />
                    <span v-else
                      class="w-3 h-3 rounded-full flex-shrink-0 bg-indigo-400 text-white text-[6px] font-bold flex items-center justify-center ring-1 ring-white flex-shrink-0"
                      :title="p.username">
                      {{ p.username[0].toUpperCase() }}
                    </span>
                  </template>
                </div>
                <div v-if="taskStore.getTasksForDate(day.date).length > 2" class="text-xs text-slate-400">
                  +{{ taskStore.getTasksForDate(day.date).length - 2 }} more
                </div>
              </div>
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
                <div v-for="task in dayTasks" :key="task._id"
                  class="rounded-xl border transition-all"
                  :class="isTaskDone(task, selectedDate) ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-white'">

                  <div
                    class="flex items-start gap-2 p-2.5 cursor-grab active:cursor-grabbing"
                    draggable="true"
                    @dragstart="startDrag(task, selectedDate, $event)"
                  >
                    <button
                      @click="handleToggleTask(task, selectedDate)"
                      class="mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer bg-transparent"
                      :class="isTaskDone(task, selectedDate) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'">
                      <span v-if="isTaskDone(task, selectedDate)" class="text-emerald-500 text-xs font-bold leading-none">&#10003;</span>
                    </button>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium" :class="isTaskDone(task, selectedDate) ? 'line-through text-slate-400' : 'text-slate-800'">
                        {{ task.title }}
                        <span v-if="task.time && !task.isAllDay" class="text-xs text-slate-400 ml-1">
                          {{ task.time }}{{ task.endTime ? ' – ' + task.endTime : '' }}
                        </span>
                      </p>
                      <p v-if="task.description" class="text-xs text-slate-500 mt-0.5">{{ task.description }}</p>
                      <span v-if="task.isRecurring" class="text-xs text-blue-400">&#8635; recurring</span>
                      <div v-if="getSharedParticipants(task).length > 0" class="flex items-center gap-1 mt-1">
                        <template v-for="p in getSharedParticipants(task)" :key="p.username">
                          <img v-if="p.avatarUrl" :src="p.avatarUrl" :title="p.username"
                            class="w-5 h-5 rounded-full object-cover ring-1 ring-white" />
                          <span v-else
                            class="w-5 h-5 rounded-full bg-indigo-400 text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white"
                            :title="p.username">
                            {{ p.username[0].toUpperCase() }}
                          </span>
                        </template>
                        <span class="text-[10px] text-slate-400">{{ getSharedParticipants(task).map(p => p.username).join(', ') }}</span>
                      </div>
                    </div>
                    <div class="flex gap-1 flex-shrink-0">
                      <button @click.stop="openEditTask(task, selectedDate)" class="text-slate-300 hover:text-blue-500 bg-transparent border-0 cursor-pointer" v-html="icon('pencil', 'w-3.5 h-3.5')" />
                      <button @click.stop="openShare(task._id)" class="text-slate-300 hover:text-indigo-500 bg-transparent border-0 cursor-pointer" title="Share task" v-html="icon('share', 'w-3.5 h-3.5')" />
                      <button v-if="!task.isRecurring" @click.stop="taskStore.deleteTask(task._id)"
                        class="text-slate-300 hover:text-red-400 text-sm bg-transparent border-0 cursor-pointer">&#10005;</button>
                    </div>
                  </div>

                  <!-- Share panel -->
                  <div v-if="sharingTaskId === task._id" class="px-3 pb-2.5 border-t border-slate-50 pt-2">
                    <p class="text-xs font-medium text-slate-500 mb-1.5">Share with (enter their email)</p>
                    <div class="flex gap-1.5">
                      <input
                        v-model="shareEmail"
                        type="email"
                        placeholder="email@example.com"
                        class="input py-1 text-xs flex-1"
                        @keydown.enter.prevent="sendInvite(task._id)"
                      />
                      <button @click="sendInvite(task._id)" class="btn btn-primary text-xs py-1 px-3" :disabled="shareLoading">
                        {{ shareLoading ? '…' : 'Send' }}
                      </button>
                    </div>
                    <p v-if="shareError" class="text-red-500 text-xs mt-1">{{ shareError }}</p>
                    <p v-if="shareSuccess" class="text-emerald-600 text-xs mt-1">{{ shareSuccess }}</p>
                  </div>

                  <!-- Per-date checklist for recurring tasks -->
                  <div v-if="task.isRecurring" class="px-3 pb-2 border-t border-slate-50 pt-2">
                    <p class="text-xs text-slate-400 mb-1.5">Checklist for this day</p>
                    <div class="space-y-1 max-h-[160px] overflow-y-auto pr-1 mb-1.5">
                      <div v-for="(item, si) in taskStore.getDateSubTasks(task, selectedDate!)" :key="si"
                        class="flex items-center gap-2 group/item">
                        <input type="checkbox" :checked="item.completed"
                          @change="taskStore.toggleDateSubTaskItem(task._id, selectedDate!, si)"
                          class="w-3.5 h-3.5 accent-blue-600 flex-shrink-0" />
                        <span class="text-xs flex-1" :class="item.completed ? 'line-through text-slate-400' : 'text-slate-700'">
                          {{ item.title }}
                        </span>
                        <button @click="taskStore.removeDateSubTaskItem(task._id, selectedDate!, si)"
                          class="opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-red-400 bg-transparent border-0 cursor-pointer text-sm leading-none transition-opacity">
                          &#10005;
                        </button>
                      </div>
                    </div>
                    <!-- Inline add item -->
                    <div v-if="addingSubTaskForTaskId === task._id" class="flex items-center gap-1.5 mt-1">
                      <input
                        v-model="newSubTaskText"
                        @keydown.enter.prevent="confirmAddSubTask(task._id)"
                        @keydown.escape="cancelAddSubTask"
                        placeholder="Item name…"
                        class="input py-1 text-xs flex-1"
                        ref="subTaskInput"
                        autofocus
                      />
                      <button @click="confirmAddSubTask(task._id)" class="text-blue-600 bg-transparent border-0 cursor-pointer text-xs font-medium">✓</button>
                      <button @click="cancelAddSubTask" class="text-slate-400 bg-transparent border-0 cursor-pointer text-xs">✕</button>
                    </div>
                    <button v-else @click="startAddSubTask(task._id)"
                      class="text-xs text-blue-500 hover:text-blue-700 bg-transparent border-0 cursor-pointer p-0 mt-0.5">
                      + Add item for this day
                    </button>
                  </div>

                  <!-- Shared checklist for non-recurring tasks -->
                  <div v-else-if="task.subTasks && task.subTasks.length > 0" class="px-3 pb-2 border-t border-slate-50 pt-2">
                    <p class="text-xs text-slate-400 mb-1.5">Checklist</p>
                    <div class="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                      <label v-for="(sub, si) in task.subTasks" :key="si" class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" :checked="sub.completed"
                          @change="taskStore.toggleSubTask(task._id, si)"
                          class="w-3.5 h-3.5 accent-blue-600" />
                        <span class="text-xs" :class="sub.completed ? 'line-through text-slate-400' : 'text-slate-700'">
                          {{ sub.title }}
                        </span>
                      </label>
                    </div>
                  </div>

                  <!-- Photo upload prompt -->
                  <div v-if="pendingPhotoTaskId === task._id && pendingPhotoDate === selectedDate" class="px-2.5 pb-2.5 border-t border-slate-100 pt-2">
                    <p class="text-xs font-medium text-slate-600 mb-2">Add a photo? (optional)</p>
                    <div class="border border-dashed border-slate-200 rounded-lg p-2 text-center cursor-pointer hover:border-blue-400 mb-2"
                      @click="triggerPhotoInput(task._id)">
                      <img v-if="photoPreview" :src="photoPreview" class="max-h-16 mx-auto rounded object-cover" style="max-width:100%;" />
                      <span v-else class="flex flex-col items-center gap-1 text-slate-400">
                        <span v-html="icon('camera', 'w-6 h-6')" />
                        <span class="text-xs">Upload photo</span>
                      </span>
                    </div>
                    <input :id="'photo-' + task._id" type="file" accept="image/*" capture="environment"
                      class="hidden" @change="handlePhotoUpload" />
                    <label class="flex items-center gap-2 text-xs cursor-pointer mb-2">
                      <input v-model="photoPublic" type="checkbox" class="accent-blue-600" />
                      Share publicly on Explore
                    </label>
                    <div class="flex gap-2">
                      <button @click="saveCompletionPhoto(task._id, selectedDate)" class="btn btn-success text-xs py-1 px-3 flex-1">Save</button>
                      <button @click="cancelPhoto(task._id, selectedDate)" class="btn btn-secondary text-xs py-1 px-3">Skip</button>
                    </div>
                  </div>
                </div>
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

            <button @click="openAddTask(selectedDate)" class="btn btn-secondary w-full mt-3 text-sm">
              + Add new task
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Task Modal -->
    <div v-if="showTaskModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeTaskModal">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-slate-900">{{ editingTask ? 'Edit Task' : 'Task' }}</h2>
          <button @click="closeTaskModal" class="text-slate-400 hover:text-slate-600 text-2xl bg-transparent border-0 cursor-pointer">&#215;</button>
        </div>

        <form @submit.prevent="submitTask" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Task *</label>
            <input v-model="taskForm.title" placeholder="e.g. Buy groceries" required class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea v-model="taskForm.description" rows="2" placeholder="Optional details" class="input resize-none" />
          </div>

          <!-- Sub-tasks checklist (only for non-recurring tasks; recurring tasks use per-date checklists in the sidebar) -->
          <div v-if="!editingTask || !editingTask.isRecurring">
            <label class="block text-sm font-medium text-slate-700 mb-2">Checklist items</label>
            <div class="space-y-2 mb-2">
              <div v-for="(sub, i) in taskForm.subTasks" :key="i" class="flex items-center gap-2">
                <input type="checkbox" v-model="sub.completed" class="w-4 h-4 accent-blue-600 flex-shrink-0" />
                <input v-model="sub.title" class="input py-1.5 text-sm flex-1" placeholder="e.g. Milk" />
                <button type="button" @click="removeSubTask(i)"
                  class="text-slate-300 hover:text-red-400 bg-transparent border-0 cursor-pointer text-lg flex-shrink-0">&#10005;</button>
              </div>
            </div>
            <button type="button" @click="addSubTask"
              class="text-xs text-blue-600 hover:underline bg-transparent border-0 cursor-pointer p-0">
              + Add checklist item
            </button>
          </div>

          <!-- Date section: only for non-recurring tasks (creating or editing) -->
          <div v-if="!editingTask || (editingTask && !editingTask.isRecurring)">
            <!-- Mode toggle (only when creating) -->
            <div v-if="!editingTask" class="flex gap-2 mb-3">
              <button type="button" @click="taskForm.dateMode = 'single'"
                class="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
                :class="taskForm.dateMode === 'single' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300'">
                Single day
              </button>
              <button type="button" @click="taskForm.dateMode = 'range'"
                class="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
                :class="taskForm.dateMode === 'range' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300'">
                Date range
              </button>
            </div>

            <!-- Single day -->
            <div v-if="taskForm.dateMode === 'single'">
              <label class="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input v-model="taskForm.dueDate" type="date" :required="taskForm.dateMode === 'single' && !editingTask" class="input" />
            </div>

            <!-- Date range -->
            <div v-else class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">From *</label>
                <input v-model="taskForm.dateFrom" type="date" required class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">To *</label>
                <input v-model="taskForm.dateTo" type="date" :min="taskForm.dateFrom" required class="input" />
              </div>
            </div>
          </div>

          <!-- Move this occurrence: only for recurring tasks being edited -->
          <div v-if="editingTask && editingTask.isRecurring" class="rounded-xl bg-blue-50 border border-blue-100 p-3">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Move this week's occurrence to a different day
            </label>
            <input v-model="taskForm.moveToDate" type="date" class="input bg-white" />
            <p class="text-xs text-slate-400 mt-1.5">
              Only this specific occurrence moves. The recurring schedule stays the same.
            </p>
          </div>

          <div v-if="taskForm.dateMode !== 'range' && !(editingTask && !editingTask.isRecurring && !editingTask.dueDate && editingTask.startDate && editingTask.endDate)">
            <label class="block text-sm font-medium text-slate-700 mb-2">Timing</label>
            <div class="flex gap-2">
              <button type="button" @click="taskForm.isAllDay = true" class="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
                :class="taskForm.isAllDay ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'">All day</button>
              <button type="button" @click="taskForm.isAllDay = false" class="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
                :class="!taskForm.isAllDay ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'">Specific time</button>
            </div>
            <div v-if="!taskForm.isAllDay" class="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label class="block text-xs text-slate-500 mb-1">From</label>
                <input v-model="taskForm.time" type="time" class="input" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1">To (optional)</label>
                <input v-model="taskForm.endTime" type="time" :min="taskForm.time || undefined" class="input" />
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-1">
            <button type="submit" class="btn btn-primary flex-1">{{ editingTask ? 'Save Changes' : 'Add Task' }}</button>
            <button type="button" @click="closeTaskModal" class="btn btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useGoalStore } from '../stores/goalStore'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import type { Task, TaskUser } from '../types/Task'
import { icon } from '../utils/icons'

const goalStore = useGoalStore()
const taskStore = useTaskStore()
const auth = useAuthStore()

function getSharedParticipants(task: Task): { avatarUrl?: string; username: string }[] {
  const currentUserId = auth.user?.id
  const owner = task.user
  const ownerId = typeof owner === 'string' ? owner : (owner as TaskUser)._id

  if (ownerId === currentUserId) {
    return task.participants
      .filter(p => p.accepted)
      .map(p => {
        const u = p.userId
        if (typeof u === 'string') return { username: p.email }
        return { avatarUrl: (u as TaskUser).avatarUrl, username: (u as TaskUser).username }
      })
  } else {
    if (typeof owner === 'string') return []
    const o = owner as TaskUser
    return [{ avatarUrl: o.avatarUrl, username: o.username }]
  }
}

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const selectedDate = ref<string | null>(toLocalDateStr(today))
const showTaskModal = ref(false)
const editingTask = ref<Task | null>(null)
const editingFromDate = ref<string | null>(null)
const pendingPhotoTaskId = ref<string | null>(null)
const pendingPhotoDate = ref<string | null>(null)
const photoPreview = ref('')
const photoData = ref('')
const photoPublic = ref(false)

// Share
const sharingTaskId = ref<string | null>(null)
const shareEmail = ref('')
const shareLoading = ref(false)
const shareError = ref('')
const shareSuccess = ref('')

const openShare = (taskId: string) => {
  sharingTaskId.value = sharingTaskId.value === taskId ? null : taskId
  shareEmail.value = ''
  shareError.value = ''
  shareSuccess.value = ''
}

const sendInvite = async (taskId: string) => {
  if (!shareEmail.value.trim()) return
  shareLoading.value = true
  shareError.value = ''
  shareSuccess.value = ''
  try {
    await taskStore.inviteToTask(taskId, shareEmail.value.trim())
    shareSuccess.value = 'Invite sent!'
    shareEmail.value = ''
  } catch (e: any) {
    shareError.value = e.response?.data?.message || 'Failed to send invite.'
  } finally {
    shareLoading.value = false
  }
}

// Inline per-date subtask adding
const addingSubTaskForTaskId = ref<string | null>(null)
const newSubTaskText = ref('')

const startAddSubTask = (taskId: string) => {
  addingSubTaskForTaskId.value = taskId
  newSubTaskText.value = ''
}

const confirmAddSubTask = async (taskId: string) => {
  const text = newSubTaskText.value.trim()
  if (text && selectedDate.value) {
    await taskStore.addDateSubTaskItem(taskId, selectedDate.value, text)
  }
  addingSubTaskForTaskId.value = null
  newSubTaskText.value = ''
}

const cancelAddSubTask = () => {
  addingSubTaskForTaskId.value = null
  newSubTaskText.value = ''
}

// Drag state
const draggingTask = ref<Task | null>(null)
const draggingFromDate = ref<string | null>(null)
const dragOverDate = ref<string | null>(null)

const taskForm = reactive({
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

const getGoalsForDay = (day: { day: number | null; date: string }) => {
  if (!day.day) return []
  return goalStore.goals.filter(g => {
    const td = new Date(g.targetDate)
    return toLocalDateStr(td) === day.date
  })
}

const dayTasks = computed(() => selectedDate.value ? taskStore.getTasksForDate(selectedDate.value) : [])
const dayGoals = computed(() => selectedDate.value ? getGoalsForDay({ day: 1, date: selectedDate.value }) : [])

const isTaskDone = (task: Task, date: string) => taskStore.isDateCompleted(task, date)

const handleToggleTask = async (task: Task, date: string) => {
  if (task.isRecurring) {
    if (!isTaskDone(task, date)) {
      // Show photo prompt WITHOUT marking done yet — done in save/cancel
      pendingPhotoTaskId.value = task._id
      pendingPhotoDate.value = date
      photoPreview.value = ''
      photoData.value = ''
      photoPublic.value = false
    } else {
      // Unmark done
      await taskStore.completeDateTask(task._id, date)
      if (pendingPhotoTaskId.value === task._id && pendingPhotoDate.value === date) {
        pendingPhotoTaskId.value = null
        pendingPhotoDate.value = null
      }
    }
  } else {
    await taskStore.toggleTask(task._id)
  }
}

const triggerPhotoInput = (taskId: string) => {
  (document.getElementById('photo-' + taskId) as HTMLInputElement | null)?.click()
}

const handlePhotoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { photoData.value = photoPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

// Single call: mark done with optional photo
const saveCompletionPhoto = async (taskId: string, date: string) => {
  await taskStore.completeDateTask(taskId, date, photoData.value || undefined, photoPublic.value)
  pendingPhotoTaskId.value = null
  pendingPhotoDate.value = null
  photoPreview.value = photoData.value = ''
}

// Skip photo but still mark done
const cancelPhoto = async (taskId: string, date: string) => {
  await taskStore.completeDateTask(taskId, date)
  pendingPhotoTaskId.value = null
  pendingPhotoDate.value = null
  photoPreview.value = photoData.value = ''
}

// Drag-and-drop
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
    // Recurring task: skip this week's occurrence on the original date,
    // then create a one-time task on the new date
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

const selectDay = (date: string) => { selectedDate.value = date }

const openAddTask = (date: string | null) => {
  editingTask.value = null
  taskForm.title = ''
  taskForm.description = ''
  taskForm.dateMode = 'single'
  taskForm.dueDate = date || today.toISOString().split('T')[0]
  taskForm.dateFrom = date || today.toISOString().split('T')[0]
  taskForm.dateTo = date || today.toISOString().split('T')[0]
  taskForm.isAllDay = true
  taskForm.time = ''
  taskForm.endTime = ''
  taskForm.subTasks = []
  showTaskModal.value = true
}

const openEditTask = (task: Task, fromDate?: string | null) => {
  editingTask.value = task
  editingFromDate.value = fromDate || selectedDate.value
  taskForm.title = task.title
  taskForm.description = task.description || ''
  if (!task.isRecurring && !task.dueDate && task.startDate && task.endDate) {
    taskForm.dateMode = 'range'
    taskForm.dateFrom = task.startDate.split('T')[0]
    taskForm.dateTo = task.endDate.split('T')[0]
    taskForm.dueDate = ''
  } else {
    taskForm.dateMode = 'single'
    taskForm.dueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    taskForm.dateFrom = ''
    taskForm.dateTo = ''
  }
  taskForm.isAllDay = task.isAllDay
  taskForm.time = task.time || ''
  taskForm.endTime = task.endTime || ''
  taskForm.subTasks = (task.subTasks || []).map(s => ({ ...s }))
  taskForm.moveToDate = ''
  showTaskModal.value = true
}

const closeTaskModal = () => { showTaskModal.value = false; editingTask.value = null; editingFromDate.value = null }

const addSubTask = () => taskForm.subTasks.push({ title: '', completed: false })
const removeSubTask = (i: number) => taskForm.subTasks.splice(i, 1)

const submitTask = async () => {
  const subTasks = taskForm.subTasks.filter(s => s.title.trim())
  if (editingTask.value) {
    // Recurring task: move this specific occurrence to a different day
    if (editingTask.value.isRecurring && taskForm.moveToDate && editingFromDate.value && taskForm.moveToDate !== editingFromDate.value) {
      await taskStore.skipDateTask(editingTask.value._id, editingFromDate.value)
      await taskStore.createTask({
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.moveToDate,
        isAllDay: taskForm.isAllDay,
        time: taskForm.isAllDay ? undefined : taskForm.time,
        isRecurring: false,
        priority: editingTask.value.priority || 'medium',
        subTasks,
      })
      selectedDate.value = taskForm.moveToDate
    } else {
      // Regular edit (title, description, timing, or date for non-recurring)
      const patch: Partial<Task> = {
        title: taskForm.title,
        description: taskForm.description,
        isAllDay: taskForm.isAllDay,
        time: taskForm.isAllDay ? undefined : taskForm.time,
        endTime: taskForm.isAllDay ? undefined : (taskForm.endTime || undefined),
        subTasks,
      }
      if (!editingTask.value.isRecurring) {
        if (taskForm.dateMode === 'range') {
          patch.startDate = taskForm.dateFrom as any
          patch.endDate = taskForm.dateTo as any
          patch.dueDate = undefined
        } else if (taskForm.dueDate) {
          patch.dueDate = taskForm.dueDate as any
          patch.startDate = undefined
          patch.endDate = undefined
        }
      }
      await taskStore.updateTask(editingTask.value._id, patch)
    }
  } else {
    const newTask: Partial<Task> = {
      title: taskForm.title,
      description: taskForm.description,
      isAllDay: taskForm.isAllDay,
      time: taskForm.isAllDay ? undefined : taskForm.time,
      endTime: taskForm.isAllDay ? undefined : (taskForm.endTime || undefined),
      isRecurring: false,
      priority: 'medium',
      subTasks,
    }
    if (taskForm.dateMode === 'range') {
      newTask.startDate = taskForm.dateFrom as any
      newTask.endDate = taskForm.dateTo as any
    } else {
      newTask.dueDate = taskForm.dueDate as any
    }
    await taskStore.createTask(newTask)
  }
  closeTaskModal()
}

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

// Range task visual helpers
const getRangePos = (task: Task, dateStr: string): 'start' | 'middle' | 'end' | 'only' | null => {
  if (task.isRecurring || task.dueDate || !task.startDate || !task.endDate) return null
  const start = task.startDate.split('T')[0]
  const end = task.endDate.split('T')[0]
  if (dateStr === start && dateStr === end) return 'only'
  if (dateStr === start) return 'start'
  if (dateStr === end) return 'end'
  return 'middle'
}

const rangeChipClass = (task: Task, dateStr: string): string => {
  const pos = getRangePos(task, dateStr)
  const done = isTaskDone(task, dateStr)
  const doneModifier = done ? ' opacity-60 line-through' : ''
  const doneColor = done ? 'bg-emerald-100 text-emerald-700' : ''

  if (pos === 'start') return `text-xs rounded-l-sm -mr-1.5 pl-1 ${done ? doneColor : 'bg-indigo-200 text-indigo-800'}${doneModifier}`
  if (pos === 'middle') return `text-xs -mx-1.5 ${done ? doneColor : 'bg-indigo-100 text-indigo-800'}${doneModifier}`
  if (pos === 'end') return `text-xs rounded-r-sm -ml-1.5 ${done ? doneColor : 'bg-indigo-100 text-indigo-800'}${doneModifier}`
  if (pos === 'only') return `text-xs rounded px-1 ${done ? doneColor : 'bg-indigo-200 text-indigo-800'}${doneModifier}`
  if (done) return 'text-xs rounded px-1 bg-emerald-100 text-emerald-700 line-through opacity-60'
  return task.isRecurring
    ? 'text-xs rounded px-1 bg-blue-100 text-blue-700'
    : 'text-xs rounded px-1 bg-sky-100 text-sky-700'
}

const rangeChipLabel = (task: Task, dateStr: string): string => {
  const pos = getRangePos(task, dateStr)
  if (pos === 'middle' || pos === 'end') return ' '
  return task.title
}

onMounted(() => { goalStore.fetchGoals(); taskStore.fetchTasks() })
</script>
