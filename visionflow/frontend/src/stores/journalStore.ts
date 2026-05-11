import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '../api/client'

export interface JournalEntry {
  _id: string
  title: string
  content: string
  imageUrl?: string
  goal?: { _id: string; title: string }
  createdAt: string
}

export const useJournalStore = defineStore('journal', () => {
  const entries = ref<JournalEntry[]>([])

  const fetchEntries = async () => {
    const { data } = await client.get('/journals')
    entries.value = data
  }

  const createEntry = async (entryData: Partial<JournalEntry>) => {
    const { data } = await client.post('/journals', entryData)
    entries.value.unshift(data)
  }

  const updateEntry = async (id: string, entryData: Partial<JournalEntry>) => {
    const { data } = await client.put(`/journals/${id}`, entryData)
    const idx = entries.value.findIndex(e => e._id === id)
    if (idx !== -1) entries.value[idx] = data
  }

  const deleteEntry = async (id: string) => {
    await client.delete(`/journals/${id}`)
    entries.value = entries.value.filter(e => e._id !== id)
  }

  return { entries, fetchEntries, createEntry, updateEntry, deleteEntry }
})