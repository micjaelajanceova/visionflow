import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '../api/client'
import type { Task } from '../types/Task'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)

  const fetchTasks = async () => {
    loading.value = true
    try {
      const { data } = await client.get<Task[]>('/tasks')
      tasks.value = data
    } finally {
      loading.value = false
    }
  }

  const createTask = async (taskData: Partial<Task>) => {
    const { data } = await client.post<Task>('/tasks', taskData)
    tasks.value.unshift(data)
    return data
  }

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    const { data } = await client.put<Task>(`/tasks/${id}`, taskData)
    const index = tasks.value.findIndex(t => t._id === id)
    if (index !== -1) tasks.value[index] = data
    return data
  }

  const toggleTask = async (id: string) => {
    const task = tasks.value.find(t => t._id === id)
    if (!task) return
    await updateTask(id, { completed: !task.completed })
  }

  const completeDateTask = async (id: string, date: string, photoData?: string, isPublic?: boolean) => {
    const { data } = await client.post<Task>(`/tasks/${id}/complete-date`, { date, photoData, isPublic })
    const index = tasks.value.findIndex(t => t._id === id)
    if (index !== -1) tasks.value[index] = data
    return data
  }

  const skipDateTask = async (id: string, date: string) => {
    const { data } = await client.post<Task>(`/tasks/${id}/skip-date`, { date })
    const index = tasks.value.findIndex(t => t._id === id)
    if (index !== -1) tasks.value[index] = data
    return data
  }

  const deleteTask = async (id: string) => {
    await client.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter(t => t._id !== id)
  }

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

  const isDateCompleted = (task: Task, dateStr: string): boolean => {
    if (task.isRecurring) return task.completedDates.includes(dateStr)
    return task.completed
  }

  const toggleSubTask = async (taskId: string, subIndex: number) => {
    const task = tasks.value.find(t => t._id === taskId)
    if (!task) return
    const newSubTasks = task.subTasks.map((s, i) =>
      i === subIndex ? { ...s, completed: !s.completed } : s
    )
    await updateTask(taskId, { subTasks: newSubTasks })
  }

  const toggleSubTaskForDate = async (taskId: string, subIndex: number, date: string) => {
    const { data } = await client.post<Task>(`/tasks/${taskId}/subtask-date`, { date, subIndex })
    const index = tasks.value.findIndex(t => t._id === taskId)
    if (index !== -1) tasks.value[index] = data
    return data
  }

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

  const getDateSubTasks = (task: Task, date: string) =>
    (task.dateSubTasks || []).find(d => d.date === date)?.items || []

  const addDateSubTaskItem = (taskId: string, date: string, title: string) => {
    const task = tasks.value.find(t => t._id === taskId)
    const current = getDateSubTasks(task!, date)
    return _saveDateSubTasks(taskId, date, [...current, { title, completed: false }])
  }

  const toggleDateSubTaskItem = (taskId: string, date: string, itemIndex: number) => {
    const task = tasks.value.find(t => t._id === taskId)
    const current = getDateSubTasks(task!, date).map((s, i) =>
      i === itemIndex ? { ...s, completed: !s.completed } : s
    )
    return _saveDateSubTasks(taskId, date, current)
  }

  const removeDateSubTaskItem = (taskId: string, date: string, itemIndex: number) => {
    const task = tasks.value.find(t => t._id === taskId)
    const current = getDateSubTasks(task!, date).filter((_, i) => i !== itemIndex)
    return _saveDateSubTasks(taskId, date, current)
  }

  return { tasks, loading, fetchTasks, createTask, updateTask, toggleTask, completeDateTask, skipDateTask, deleteTask, getTasksForDate, isDateCompleted, toggleSubTask, toggleSubTaskForDate, getSubTaskStateForDate, getDateSubTasks, addDateSubTaskItem, toggleDateSubTaskItem, removeDateSubTaskItem }
})
