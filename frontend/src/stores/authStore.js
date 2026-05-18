import { defineStore } from 'pinia'
import api from '../services/api.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    initialized: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    hasFolderId: (state) => !!state.user?.googleDriveFolderId,
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
        return this.user
      } catch {
        this.user = null
        this.initialized = true
        return null
      } finally {
        this.loading = false
      }
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

    loginWithGoogle() {
      window.location.href = '/api/auth/google'
    },
  },
})
