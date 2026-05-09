import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    { path: '/dashboard', component: () => import('../views/DashboardView.vue') },
    { path: '/goals', component: () => import('../views/GoalsView.vue') },
    { path: '/goals/:id', component: () => import('../views/GoalDetailView.vue') },
    { path: '/collage', component: () => import('../views/CollageView.vue') },
    { path: '/calendar', component: () => import('../views/CalendarView.vue') },
    { path: '/progress', component: () => import('../views/ProgressView.vue') },
    { path: '/explore', component: () => import('../views/ExploreView.vue') },
  ],
})

export default router