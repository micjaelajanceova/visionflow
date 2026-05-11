import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '../api/client'

export interface Challenge {
  _id: string
  title: string
  description: string
  startDate: string
  completedDays: number[]
}

export const useChallengeStore = defineStore('challenge', () => {
  const challenges = ref<Challenge[]>([])

  const fetchChallenges = async () => {
    const { data } = await client.get('/challenges')
    challenges.value = data
  }

  const createChallenge = async (challengeData: Partial<Challenge>) => {
    const { data } = await client.post('/challenges', challengeData)
    challenges.value.unshift(data)
  }

  const toggleDay = async (id: string, day: number) => {
    const { data } = await client.patch(`/challenges/${id}/toggle`, { day })
    const idx = challenges.value.findIndex(c => c._id === id)
    if (idx !== -1) challenges.value[idx] = data
  }

  const deleteChallenge = async (id: string) => {
    await client.delete(`/challenges/${id}`)
    challenges.value = challenges.value.filter(c => c._id !== id)
  }

  return { challenges, fetchChallenges, createChallenge, toggleDay, deleteChallenge }
})