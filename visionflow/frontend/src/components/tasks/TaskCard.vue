<template>
  <div
    class="rounded-xl border transition-all"
    :class="isDone ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-white'"
  >
    <!-- Main row -->
    <div
      class="flex items-start gap-2 p-2.5 cursor-grab active:cursor-grabbing"
      draggable="true"
      @dragstart="emit('drag-start', { task, date, event: $event })"
    >
      <button
        @click="handleToggleTask"
        class="mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer bg-transparent"
        :class="isDone ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'"
      >
        <span v-if="isDone" class="text-emerald-500 text-xs font-bold leading-none">&#10003;</span>
      </button>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium" :class="isDone ? 'line-through text-slate-400' : 'text-slate-800'">
          {{ task.title }}
          <span v-if="task.time && !task.isAllDay" class="text-xs text-slate-400 ml-1">
            {{ task.time }}{{ task.endTime ? ' – ' + task.endTime : '' }}
          </span>
          <span v-if="isTaskOverdue" class="ml-1.5 text-[10px] font-semibold text-red-500 bg-red-50 rounded px-1 py-0.5">overdue</span>
        </p>
        <p v-if="task.description" class="text-xs text-slate-500 mt-0.5">{{ task.description }}</p>
        <span v-if="task.isRecurring" class="text-xs text-indigo-400">&#8635; recurring</span>
        <div v-if="isShared(task)" class="flex items-center gap-0.5 mt-1">
          <template v-for="p in getSharedWith(task)" :key="p.username">
            <img v-if="p.avatarUrl" :src="p.avatarUrl" :title="p.username"
              class="w-5 h-5 rounded-full object-cover ring-1 ring-white -ml-1 first:ml-0" />
            <span v-else
              class="w-5 h-5 rounded-full bg-indigo-400 text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white -ml-1 first:ml-0"
              :title="p.username">{{ p.username[0]?.toUpperCase() }}</span>
          </template>
        </div>
      </div>

      <div class="flex gap-1 flex-shrink-0">
        <button @click.stop="emit('edit')" class="text-slate-300 hover:text-indigo-500 bg-transparent border-0 cursor-pointer" v-html="icon('pencil', 'w-3.5 h-3.5')" />
        <button v-if="amIOwner" @click.stop="toggleShare" class="text-slate-300 hover:text-indigo-500 bg-transparent border-0 cursor-pointer" title="Share task" v-html="icon('share', 'w-3.5 h-3.5')" />
        <button v-if="amIOwner && !task.isRecurring" @click.stop="taskStore.deleteTask(task._id)"
          class="text-slate-300 hover:text-red-400 text-sm bg-transparent border-0 cursor-pointer" title="Delete">&#10005;</button>
        <button v-if="!amIOwner" @click.stop="taskStore.leaveTask(task._id)"
          class="text-slate-300 hover:text-red-400 text-xs bg-transparent border-0 cursor-pointer" title="Leave shared task">Leave</button>
      </div>
    </div>

    <!-- Share panel -->
    <div v-if="showShare" class="px-3 pb-2.5 border-t border-slate-50 pt-2">
      <p class="text-xs font-medium text-slate-500 mb-1.5">Share with (enter their email)</p>
      <div class="flex gap-1.5">
        <input
          v-model="shareEmail"
          type="email"
          placeholder="email@example.com"
          class="input py-1 text-xs flex-1"
          @keydown.enter.prevent="sendInvite"
        />
        <button @click="sendInvite" class="btn btn-primary text-xs py-1 px-3" :disabled="shareLoading">
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
        <div v-for="(item, si) in taskStore.getDateSubTasks(task, date)" :key="si"
          class="flex items-center gap-2 group/item">
          <input type="checkbox" :checked="item.completed"
            @change="taskStore.toggleDateSubTaskItem(task._id, date, si)"
            class="w-3.5 h-3.5 accent-indigo-600 flex-shrink-0" />
          <span class="text-xs flex-1" :class="item.completed ? 'line-through text-slate-400' : 'text-slate-700'">
            {{ item.title }}
          </span>
          <button @click="taskStore.removeDateSubTaskItem(task._id, date, si)"
            class="opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-red-400 bg-transparent border-0 cursor-pointer text-sm leading-none transition-opacity">
            &#10005;
          </button>
        </div>
      </div>
      <div v-if="addingSubTask" class="flex items-center gap-1.5 mt-1">
        <input
          v-model="newSubTaskText"
          @keydown.enter.prevent="confirmAddSubTask"
          @keydown.escape="cancelAddSubTask"
          placeholder="Item name…"
          class="input py-1 text-xs flex-1"
          autofocus
        />
        <button @click="confirmAddSubTask" class="text-indigo-600 bg-transparent border-0 cursor-pointer text-xs font-medium">✓</button>
        <button @click="cancelAddSubTask" class="text-slate-400 bg-transparent border-0 cursor-pointer text-xs">✕</button>
      </div>
      <button v-else @click="addingSubTask = true"
        class="text-xs text-indigo-500 hover:text-indigo-700 bg-transparent border-0 cursor-pointer p-0 mt-0.5">
        + Add item for this day
      </button>
    </div>

    <!-- Checklist for non-recurring tasks -->
    <div v-else-if="task.subTasks && task.subTasks.length > 0" class="px-3 pb-2 border-t border-slate-50 pt-2">
      <p class="text-xs text-slate-400 mb-1.5">Checklist</p>
      <div class="space-y-1 max-h-[160px] overflow-y-auto pr-1">
        <label v-for="(sub, si) in task.subTasks" :key="si" class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" :checked="sub.completed"
            @change="taskStore.toggleSubTask(task._id, si)"
            class="w-3.5 h-3.5 accent-indigo-600" />
          <span class="text-xs" :class="sub.completed ? 'line-through text-slate-400' : 'text-slate-700'">
            {{ sub.title }}
          </span>
        </label>
      </div>
    </div>

    <!-- Photo upload prompt -->
    <div v-if="pendingPhoto" class="px-2.5 pb-2.5 border-t border-slate-100 pt-2">
      <p class="text-xs font-medium text-slate-600 mb-2">Add a photo? (optional)</p>
      <div class="border border-dashed border-slate-200 rounded-lg p-2 text-center cursor-pointer hover:border-indigo-400 mb-2"
        @click="triggerPhotoInput">
        <img v-if="photoPreview" :src="photoPreview" class="max-h-16 mx-auto rounded object-cover" style="max-width:100%;" />
        <span v-else class="flex flex-col items-center gap-1 text-slate-400">
          <span v-html="icon('camera', 'w-6 h-6')" />
          <span class="text-xs">Upload photo</span>
        </span>
      </div>
      <input :id="'photo-' + task._id" type="file" accept="image/*" capture="environment"
        class="hidden" @change="handlePhotoUpload" />
      <label class="flex items-center gap-2 text-xs cursor-pointer mb-2">
        <input v-model="photoPublic" type="checkbox" class="accent-indigo-600" />
        Share publicly on Explore
      </label>
      <div class="flex gap-2">
        <button @click="saveCompletionPhoto" class="btn btn-success text-xs py-1 px-3 flex-1">Save</button>
        <button @click="cancelPhoto" class="btn btn-secondary text-xs py-1 px-3">Skip</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { useAuthStore } from '../../stores/authStore'
import type { Task } from '../../types/Task'
import { icon } from '../../utils/icons'
import { useTaskSharing } from '../../composables/useTaskSharing'

const props = defineProps<{ task: Task; date: string }>()
const emit = defineEmits<{
  edit: []
  'drag-start': [payload: { task: Task; date: string; event: DragEvent }]
}>()

const taskStore = useTaskStore()
const auth = useAuthStore()
const { getSharedWith, isShared } = useTaskSharing()

const amIOwner = computed(() => {
  const myId = (auth.user as any)?.id || (auth.user as any)?._id
  const ownerId = typeof props.task.user === 'string' ? props.task.user : (props.task.user as any)?._id
  return myId === ownerId
})

const isDone = computed(() => taskStore.isDateCompleted(props.task, props.date))

const todayStr = new Date().toISOString().split('T')[0]
const isTaskOverdue = computed(() => {
  if (props.task.isRecurring || isDone.value) return false
  if (props.task.dueDate) return new Date(props.task.dueDate).toISOString().split('T')[0] < todayStr
  if (props.task.endDate) return props.task.endDate.split('T')[0] < todayStr
  return false
})

// Share
const showShare = ref(false)
const shareEmail = ref('')
const shareLoading = ref(false)
const shareError = ref('')
const shareSuccess = ref('')

const toggleShare = () => {
  showShare.value = !showShare.value
  shareEmail.value = ''
  shareError.value = ''
  shareSuccess.value = ''
}

const sendInvite = async () => {
  if (!shareEmail.value.trim()) return
  shareLoading.value = true
  shareError.value = ''
  shareSuccess.value = ''
  try {
    await taskStore.inviteToTask(props.task._id, shareEmail.value.trim())
    shareSuccess.value = 'Invite sent!'
    shareEmail.value = ''
  } catch (e: any) {
    shareError.value = e.response?.data?.message || 'Failed to send invite.'
  } finally {
    shareLoading.value = false
  }
}

// Per-date subtask adding
const addingSubTask = ref(false)
const newSubTaskText = ref('')

const confirmAddSubTask = async () => {
  const text = newSubTaskText.value.trim()
  if (text) await taskStore.addDateSubTaskItem(props.task._id, props.date, text)
  addingSubTask.value = false
  newSubTaskText.value = ''
}

const cancelAddSubTask = () => {
  addingSubTask.value = false
  newSubTaskText.value = ''
}

// Photo upload
const pendingPhoto = ref(false)
const photoPreview = ref('')
const photoData = ref('')
const photoPublic = ref(false)

const handleToggleTask = async () => {
  if (props.task.isRecurring) {
    if (!isDone.value) {
      pendingPhoto.value = true
      photoPreview.value = ''
      photoData.value = ''
      photoPublic.value = false
    } else {
      await taskStore.completeDateTask(props.task._id, props.date)
      pendingPhoto.value = false
    }
  } else {
    await taskStore.toggleTask(props.task._id)
  }
}

const triggerPhotoInput = () => {
  (document.getElementById('photo-' + props.task._id) as HTMLInputElement | null)?.click()
}

const handlePhotoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { photoData.value = photoPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

const saveCompletionPhoto = async () => {
  await taskStore.completeDateTask(props.task._id, props.date, photoData.value || undefined, photoPublic.value)
  pendingPhoto.value = false
  photoPreview.value = photoData.value = ''
}

const cancelPhoto = async () => {
  await taskStore.completeDateTask(props.task._id, props.date)
  pendingPhoto.value = false
  photoPreview.value = photoData.value = ''
}
</script>
