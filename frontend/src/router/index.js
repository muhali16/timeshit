import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import Home from '../views/Home.vue'
import Timesheet from '../views/Timesheet.vue'
import History from '../views/History.vue'
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'
import Tools from '../views/Tools.vue'
import Privacy from '../views/Privacy.vue'
import Terms from '../views/Terms.vue'
import Landing from '../views/Landing.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing,
    meta: { public: true },
  },
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
    path: '/app',
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
    path: '/tools',
    name: 'Tools',
    component: Tools,
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
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.fetchUser()
  }

  // Logged-in users skip the public landing and go straight to the app
  if (to.name === 'Landing' && authStore.isLoggedIn) {
    return next('/app')
  }

  // Public pages (landing, legal) are accessible without authentication
  if (to.meta.public) {
    return next()
  }

  if (to.meta.guest && authStore.isLoggedIn) {
    return next('/app')
  }

  if (!to.meta.guest && !authStore.isLoggedIn) {
    return next('/login')
  }

  next()
})

export default router
