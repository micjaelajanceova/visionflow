import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '../api/client'
import type { Task } from '../types/Task'

// Manages task-related state and actions (fetching, creating, updating, deleting tasks)
export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)

  // Fetch all tasks for the logged-in user
  const fetchTasks = async () => {
    loading.value = true
    try {
      const { data } = await client.get<Task[]>('/tasks')
      tasks.value = data
    } finally {
      loading.value = false
    }
  }

  // Create a new task and prepend it to the list
  const createTask = async (taskData: Partial<Task>) => {
    const { data } = await client.post<Task>('/tasks', taskData)
    tasks.value.unshift(data)
    return data
  }

  // Update an existing task and refresh it in the local list
  const updateTask = async (id: string, taskData: Partial<Task>) => {
    const { data } = await client.put<Task>(`/tasks/${id}`, taskData)
    const index = tasks.value.findIndex(t => t._id === id)
    if (index !== -1) tasks.value[index] = data
    return data
  }

  // Toggle completion status of a task (for non-recurring tasks) or toggle today's completion (for recurring tasks)
  const toggleTask = async (id: string) => {
    const task = tasks.value.find(t => t._id === id)
    if (!task) return
    await updateTask(id, { completed: !task.completed })
  }

  // Mark a recurring task as completed for a specific date — optionally attach a photo and share publicly
  const completeDateTask = async (id: string, date: string, photoData?: string, isPublic?: boolean) => {
    const { data } = await client.post<Task>(`/tasks/${id}/complete-date`, { date, photoData, isPublic })
    const index = tasks.value.findIndex(t => t._id === id)
    if (index !== -1) tasks.value[index] = data
    return data
  }

  // Mark a recurring task as skipped for a specific date (won't show as completed but also won't be overdue)
  const skipDateTask = async (id: string, date: string) => {
    const { data } = await client.post<Task>(`/tasks/${id}/skip-date`, { date })
    const index = tasks.value.findIndex(t => t._id === id)
    if (index !== -1) tasks.value[index] = data
    return data
  }

  // Delete a task and remove it from the local list
  const deleteTask = async (id: string) => {
    await client.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter(t => t._id !== id)
  }

  // Leave a shared task (remove self from participants) and remove it from the local list
  const leaveTask = async (id: string) => {
    await client.delete(`/tasks/${id}/leave`)
    tasks.value = tasks.value.filter(t => t._id !== id)
  }

  // Remove a participant from a shared task (admin only) and update the local list
  const removeParticipant = async (taskId: string, userId: string) => {
    const { data } = await client.delete<Task>(`/tasks/${taskId}/participants/${userId}`)
    const index = tasks.value.findIndex(t => t._id === taskId)
    if (index !== -1) tasks.value[index] = data
  }

  // Get tasks that occur on a specific date (used for calendar and daily task list)
  const getTasksForDate = (dateStr: string): Task[] => {
    return tasks.value.filter(t => {
      if (t.isRecurring) {
        if ((t.skippedDates || []).includes(dateStr)) return false
        const dayOfWeek = (new Date(dateStr).getDay() + 6) % 7 // 0=Mon, 6=Sun
        if (!t.recurringDays.includes(dayOfWeek)) return false
        if (t.startDate && dateStr < t.startDate.split('T')[0]) return false
        if (t.endDate && dateStr > t.endDate.split('T')[0]) return false
        return true
      } else {
        if (t.dueDate) {
          const d = new Date(t.dueDate).toISOString().split('T')[0]
          return d === dateStr
        }
        // Date-range task (non-recurring with startDate + endDate)
        if (t.startDate && t.endDate) {
          const start = t.startDate.split('T')[0]
          const end = t.endDate.split('T')[0]
          return dateStr >= start && dateStr <= end
        }
        return false
      }
    })
  }

  // Check if a task is completed for a specific date (used to show completed status in calendar and daily task list)
  const isDateCompleted = (task: Task, dateStr: string): boolean => {
    if (task.isRecurring) return task.completedDates.includes(dateStr)
    return task.completed
  }

  // Toggle completion of a sub-task (for non-recurring tasks) or toggle today's completion of a sub-task (for recurring tasks)
  const toggleSubTask = async (taskId: string, subIndex: number) => {
    const task = tasks.value.find(t => t._id === taskId)
    if (!task) return
    const newSubTasks = task.subTasks.map((s, i) =>
      i === subIndex ? { ...s, completed: !s.completed } : s
    )
    await updateTask(taskId, { subTasks: newSubTasks })
  }

  // Toggle completion of a sub-task for a specific date (only applies to recurring tasks)
  const toggleSubTaskForDate = async (taskId: string, subIndex: number, date: string) => {
    const { data } = await client.post<Task>(`/tasks/${taskId}/subtask-date`, { date, subIndex })
    const index = tasks.value.findIndex(t => t._id === taskId)
    if (index !== -1) tasks.value[index] = data
    return data
  }

  // Get completion state of a sub-task for a specific date (only applies to recurring tasks)
  const getSubTaskStateForDate = (task: Task, subIndex: number, date: string): boolean => {
    const entry = (task.dateSubTaskStates || []).find(s => s.date === date)
    return entry?.states[subIndex] ?? false
  }

  // Per-date checklist for recurring tasks
  const _saveDateSubTasks = async (taskId: string, date: string, items: { title: string; completed: boolean }[]) => {
    const { data } = await client.post<Task>(`/tasks/${taskId}/date-subtasks`, { date, items })
    const index = tasks.value.findIndex(t => t._id === taskId)
    if (index !== -1) tasks.value[index] = data
    return data
  }

  // Get the checklist of sub-tasks for a specific date (only applies to recurring tasks) — used in the UI to show the checklist for each day
  const getDateSubTasks = (task: Task, date: string) =>
    (task.dateSubTasks || []).find(d => d.date === date)?.items || []

  // Add a new item to the checklist of sub-tasks for a specific date (only applies to recurring tasks)
  const addDateSubTaskItem = (taskId: string, date: string, title: string) => {
    const task = tasks.value.find(t => t._id === taskId)
    const current = getDateSubTasks(task!, date)
    return _saveDateSubTasks(taskId, date, [...current, { title, completed: false }])
  }

  // Toggle completion of an item in the checklist of sub-tasks for a specific date (only applies to recurring tasks)
  const toggleDateSubTaskItem = (taskId: string, date: string, itemIndex: number) => {
    const task = tasks.value.find(t => t._id === taskId)
    const current = getDateSubTasks(task!, date).map((s, i) =>
      i === itemIndex ? { ...s, completed: !s.completed } : s
    )
    return _saveDateSubTasks(taskId, date, current)
  }

  // Remove an item from the checklist of sub-tasks for a specific date (only applies to recurring tasks)
  const removeDateSubTaskItem = (taskId: string, date: string, itemIndex: number) => {
    const task = tasks.value.find(t => t._id === taskId)
    const current = getDateSubTasks(task!, date).filter((_, i) => i !== itemIndex)
    return _saveDateSubTasks(taskId, date, current)
  }

  // Pending invites for shared tasks — used to show a list of tasks the user has been invited to but hasn't accepted yet
  const pendingInvites = ref<Task[]>([])

  // Fetch the list of pending invites for the logged-in user
  const fetchPendingInvites = async () => {
    const { data } = await client.get<Task[]>('/tasks/invites/pending')
    pendingInvites.value = data
  }

  // Invite another user to collaborate on a task by email (admin only)
  const inviteToTask = async (taskId: string, email: string) => {
    await client.post(`/tasks/${taskId}/invite`, { email })
  }

  // Respond to a task invite (accept or decline) and update the local lists accordingly
  const respondToInvite = async (taskId: string, accept: boolean) => {
    await client.put(`/tasks/${taskId}/invite/respond`, { accept })
    pendingInvites.value = pendingInvites.value.filter(t => t._id !== taskId)
    if (accept) await fetchTasks()
  }

  return { tasks, loading, pendingInvites, fetchTasks, fetchPendingInvites, inviteToTask, respondToInvite, removeParticipant, createTask, updateTask, toggleTask, completeDateTask, skipDateTask, deleteTask, leaveTask, getTasksForDate, isDateCompleted, toggleSubTask, toggleSubTaskForDate, getSubTaskStateForDate, getDateSubTasks, addDateSubTaskItem, toggleDateSubTaskItem, removeDateSubTaskItem }
})
