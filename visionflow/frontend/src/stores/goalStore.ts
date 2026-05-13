import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '../api/client'
import type { Goal } from '../types/Goal'
import { useTaskStore } from './taskStore'

// Manages goal-related state and actions (fetching, creating, updating, deleting goals)
export const useGoalStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])              // current user's goals
  const publicGoals = ref<Goal[]>([])        // all public goals (Explore)
  const publicDoneGoals = ref<Goal[]>([])    // completed goals shared publicly
  const loading = ref(false)

  // Fetch all goals for the logged-in user
  const fetchGoals = async () => {
    loading.value = true
    try {
      const { data } = await client.get<Goal[]>('/goals')
      goals.value = data
    } finally {
      loading.value = false
    }
  }

  // Fetch goals marked as public (used on Explore page)
  const fetchPublicGoals = async () => {
    const { data } = await client.get<Goal[]>('/goals/public')
    publicGoals.value = data
  }

  // Fetch completed goals shared publicly (used on Explore page)
  const fetchPublicDoneGoals = async () => {
    const { data } = await client.get<Goal[]>('/goals/public-done')
    publicDoneGoals.value = data
  }

  // Create a new goal and prepend it to the list
  const createGoal = async (goalData: Partial<Goal>) => {
    const { data } = await client.post<Goal>('/goals', goalData)
    goals.value.unshift(data)
    return data
  }

  // Update an existing goal and refresh it in the local list
  const updateGoal = async (id: string, goalData: Partial<Goal>) => {
    const { data } = await client.put<Goal>(`/goals/${id}`, goalData)
    const index = goals.value.findIndex(g => g._id === id)
    if (index !== -1) goals.value[index] = data
    return data
  }

  // Mark a goal as completed — optionally attach a photo and share publicly
  const markDone = async (id: string, donePhoto?: string, isDonePublic?: boolean) => {
    const { data } = await client.post<Goal>(`/goals/${id}/done`, { donePhoto, isDonePublic })
    const index = goals.value.findIndex(g => g._id === id)
    if (index !== -1) goals.value[index] = data
    return data
  }

  // Delete a goal and remove all its linked tasks from the task store
  const deleteGoal = async (id: string) => {
    await client.delete(`/goals/${id}`)
    goals.value = goals.value.filter(g => g._id !== id)
    const taskStore = useTaskStore()
    // String() conversion handles both plain string IDs and Mongoose ObjectId types
    taskStore.tasks = taskStore.tasks.filter(t => String(t.goal) !== id && t.goalId !== id)
  }

  return {
    goals, publicGoals, publicDoneGoals, loading,
    fetchGoals, fetchPublicGoals, fetchPublicDoneGoals,
    createGoal, updateGoal, markDone, deleteGoal
  }
})
