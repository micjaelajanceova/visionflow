import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import client from '../api/client'

interface User {
  id: string
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, password: string) => {
    const { data } = await client.post('/auth/login', { email, password })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  const register = async (username: string, email: string, password: string) => {
    const { data } = await client.post('/auth/register', { username, email, password })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  const fetchMe = async () => {
    try {
      const { data } = await client.get('/auth/me')
      user.value = data
    } catch {
      logout()
    }
  }

  return { user, token, isAuthenticated, login, register, logout, fetchMe }
})