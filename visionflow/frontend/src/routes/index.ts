import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: () => import('../views/LoginView.vue'), meta: { guest: true } },
    { path: '/register', component: () => import('../views/RegisterView.vue'), meta: { guest: true } },
    { path: '/dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
    { path: '/goals', component: () => import('../views/GoalsView.vue'), meta: { requiresAuth: true } },
    { path: '/goals/:id', component: () => import('../views/GoalDetailView.vue'), meta: { requiresAuth: true } },
    { path: '/collage', component: () => import('../views/CollageView.vue'), meta: { requiresAuth: true } },
    { path: '/calendar', component: () => import('../views/CalendarView.vue'), meta: { requiresAuth: true } },
    { path: '/progress', component: () => import('../views/ProgressView.vue'), meta: { requiresAuth: true } },
    { path: '/explore', component: () => import('../views/ExploreView.vue') },
    { path: '/profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } },
    { path: '/shared', component: () => import('../views/SharedTasksView.vue'), meta: { requiresAuth: true } },
    { path: '/users/:id', component: () => import('../views/UserProfileView.vue') },
  ],
})

// TODO: maybe add a dedicated 404 page later
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return next('/login')
  if (to.meta.guest && auth.isAuthenticated) return next('/dashboard')
  next()
})

export default router
