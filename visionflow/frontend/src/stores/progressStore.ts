import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '../api/client'

export interface ProgressEntry {
  _id: string
  goal: string
  date: string
  completed: boolean
  note: string
}

export const useProgressStore = defineStore('progress', () => {
  const entries = ref<ProgressEntry[]>([])

  const fetchByGoal = async (goalId: string) => {
    const { data } = await client.get(`/progress/goal/${goalId}`)
    entries.value = data
  }

  const logProgress = async (entryData: Partial<ProgressEntry>) => {
    const { data } = await client.post('/progress', entryData)
    entries.value.unshift(data)
  }

  const deleteEntry = async (id: string) => {
    await client.delete(`/progress/${id}`)
    entries.value = entries.value.filter(e => e._id !== id)
  }

  return { entries, fetchByGoal, logProgress, deleteEntry }
})