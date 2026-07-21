import { defineStore } from 'pinia'
import api from '../services/api.js'

const RECENT_ACCOUNTS_KEY = 'ts_recent_accounts'
const MAX_RECENT_ACCOUNTS = 3

function loadRecentAccounts() {
  try {
    const raw = localStorage.getItem(RECENT_ACCOUNTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((a) => a && a.email) : []
  } catch {
    return []
  }
}

function persistRecentAccounts(accounts) {
  try {
    localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // ignore
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    initialized: false,
    recentAccounts: loadRecentAccounts(),
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    hasGoogleToken: (state) => !!state.user?.hasGoogleToken,
  },

  actions: {
    async fetchUser() {
      if (this.initialized) return this.user
      this.loading = true
      try {
        const { data } = await api.get('/auth/me')
        this.user = data.data
        this.initialized = true
        this.rememberAccount(this.user)
        return this.user
      } catch {
        this.user = null
        this.initialized = true
        return null
      } finally {
        this.loading = false
      }
    },

    rememberAccount(user) {
      if (!user?.email) return
      const entry = {
        email: user.email,
        name: user.name || user.email,
        avatar: user.avatar || null,
      }
      const rest = this.recentAccounts.filter((a) => a.email !== entry.email)
      this.recentAccounts = [entry, ...rest].slice(0, MAX_RECENT_ACCOUNTS)
      persistRecentAccounts(this.recentAccounts)
    },

    forgetAccount(email) {
      this.recentAccounts = this.recentAccounts.filter((a) => a.email !== email)
      persistRecentAccounts(this.recentAccounts)
    },

    async logout() {
      try {
        await api.post('/auth/logout')
      } catch {
        // ignore
      }
      this.user = null
      this.initialized = false
    },

    loginWithGoogle(loginHint) {
      const url = loginHint
        ? `/api/auth/google?login_hint=${encodeURIComponent(loginHint)}`
        : '/api/auth/google'
      window.location.href = url
    },
  },
})
