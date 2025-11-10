import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('../views/Welcome.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/recycling',
    name: 'recycling',
    component: () => import('../views/Recycling.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (isAuthenticated) {
    // إذا كان المستخدم مسجل دخول
    const userLanguage = localStorage.getItem('userLanguage')
    
    if (to.name === 'welcome') {
      // إذا كان في صفحة الترحيب واختار اللغة مسبقاً، اذهب للرئيسية
      if (userLanguage) {
        next('/')
      } else {
        next()
      }
    } else {
      // إذا كان يحاول الدخول لأي صفحة أخرى ولم يختر اللغة بعد، اذهب لصفحة الترحيب
      if (!userLanguage && to.name !== 'welcome') {
        next('/welcome')
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router