import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import Home from '../views/Home.vue'
import Timesheet from '../views/Timesheet.vue'
import History from '../views/History.vue'
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'
import Privacy from '../views/Privacy.vue'
import Terms from '../views/Terms.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true },
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: Privacy,
    meta: { public: true },
  },
  {
    path: '/terms',
    name: 'Terms',
    component: Terms,
    meta: { public: true },
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/timesheet',
    name: 'Timesheet',
    component: Timesheet,
  },
  {
    path: '/history',
    name: 'History',
    component: History,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  // Public pages (legal) are accessible without authentication
  if (to.meta.public) {
    return next()
  }

  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.fetchUser()
  }

  if (to.meta.guest && authStore.isLoggedIn) {
    return next('/')
  }

  if (!to.meta.guest && !authStore.isLoggedIn) {
    return next('/login')
  }

  next()
})

export default router
