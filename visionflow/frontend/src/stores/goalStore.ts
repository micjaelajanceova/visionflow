import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '../api/client'
import type { Goal } from '../types/Goal'
import { useTaskStore } from './taskStore'

export const useGoalStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])
  const publicGoals = ref<Goal[]>([])
  const publicDoneGoals = ref<Goal[]>([])
  const loading = ref(false)

  const fetchGoals = async () => {
    loading.value = true
    try {
      const { data } = await client.get<Goal[]>('/goals')
      goals.value = data
    } finally {
      loading.value = false
    }
  }

  const fetchPublicGoals = async () => {
    const { data } = await client.get<Goal[]>('/goals/public')
    publicGoals.value = data
  }

  const fetchPublicDoneGoals = async () => {
    const { data } = await client.get<Goal[]>('/goals/public-done')
    publicDoneGoals.value = data
  }

  const createGoal = async (goalData: Partial<Goal>) => {
    const { data } = await client.post<Goal>('/goals', goalData)
    goals.value.unshift(data)
    return data
  }

  const updateGoal = async (id: string, goalData: Partial<Goal>) => {
    const { data } = await client.put<Goal>(`/goals/${id}`, goalData)
    const index = goals.value.findIndex(g => g._id === id)
    if (index !== -1) goals.value[index] = data
    return data
  }

  const markDone = async (id: string, donePhoto?: string, isDonePublic?: boolean) => {
    const { data } = await client.post<Goal>(`/goals/${id}/done`, { donePhoto, isDonePublic })
    const index = goals.value.findIndex(g => g._id === id)
    if (index !== -1) goals.value[index] = data
    return data
  }

  const deleteGoal = async (id: string) => {
    await client.delete(`/goals/${id}`)
    goals.value = goals.value.filter(g => g._id !== id)
    const taskStore = useTaskStore()
    taskStore.tasks = taskStore.tasks.filter(t => t.goal !== id && t.goalId !== id)
  }

  return {
    goals, publicGoals, publicDoneGoals, loading,
    fetchGoals, fetchPublicGoals, fetchPublicDoneGoals,
    createGoal, updateGoal, markDone, deleteGoal
  }
})
