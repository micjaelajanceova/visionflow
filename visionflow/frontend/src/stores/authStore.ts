import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import client from '../api/client'

interface User {
  id: string
  username: string
  email: string
  avatarUrl?: string
  isAdmin?: boolean
}

// Manages user authentication pinia state and actions (login, logout, register, fetch profile, update profile)
export const useAuthStore = defineStore('auth', () => {
  // Restore session from localStorage on app startup
  const stored = localStorage.getItem('user')
  const user = ref<User | null>(stored ? JSON.parse(stored) : null)
  const token = ref<string | null>(localStorage.getItem('token'))

  // True when a valid JWT token exists
  const isAuthenticated = computed(() => !!token.value)

  // Persist user data to both reactive state and localStorage
  const saveUser = (u: User) => {
    user.value = u
    localStorage.setItem('user', JSON.stringify(u))
  }

  const login = async (email: string, password: string) => {
    const { data } = await client.post('/auth/login', { email, password })
    token.value = data.token
    saveUser(data.user)
    localStorage.setItem('token', data.token)
  }

  const register = async (username: string, email: string, password: string) => {
    const { data } = await client.post('/auth/register', { username, email, password })
    token.value = data.token
    saveUser(data.user)
    localStorage.setItem('token', data.token)
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Fetch fresh user data from the server (called on app mount to verify token is still valid)
  const fetchMe = async () => {
    try {
      const { data } = await client.get('/auth/me')
      saveUser(data)
    } catch {
      logout() // token expired or invalid — clear session
    }
  }

  const updateProfile = async (payload: { username?: string; avatarUrl?: string | null }) => {
    const { data } = await client.put('/auth/profile', payload)
    if (user.value) saveUser({ ...user.value, ...data })
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    await client.put('/auth/password', { currentPassword, newPassword })
  }

  return { user, token, isAuthenticated, login, register, logout, fetchMe, updateProfile, updatePassword }
})
