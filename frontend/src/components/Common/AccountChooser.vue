<template>
  <transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="close"></div>
      <div class="relative glass-strong w-full max-w-sm rounded-2xl p-5 md:p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-text-primary">Lanjutkan dengan</h3>
          <button
            @click="close"
            class="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="acc in accounts"
            :key="acc.email"
            class="group flex items-center gap-3 p-2.5 glass glass-hover rounded-xl cursor-pointer transition-all active:scale-[0.98]"
            @click="choose(acc.email)"
          >
            <img
              v-if="acc.avatar && !errored[acc.email]"
              :src="acc.avatar"
              :alt="acc.name"
              class="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-accent/20"
              @error="errored[acc.email] = true"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0 ring-2 ring-accent/20"
            >
              <span class="text-accent font-bold text-base">{{ (acc.name || '?')[0]?.toUpperCase() }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-text-primary truncate">{{ acc.name }}</p>
              <p class="text-xs text-text-tertiary truncate">{{ acc.email }}</p>
            </div>
            <button
              type="button"
              class="p-1.5 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              title="Hapus akun"
              @click.stop="forget(acc.email)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <button
          @click="choose()"
          class="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white text-gray-800 rounded-xl font-medium text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Gunakan akun lain</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive } from 'vue'
import { useAuthStore } from '../../stores/authStore.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  accounts: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const authStore = useAuthStore()
const errored = reactive({})

function close() {
  emit('update:modelValue', false)
}

function choose(email) {
  authStore.loginWithGoogle(email)
}

function forget(email) {
  authStore.forgetAccount(email)
  if (authStore.recentAccounts.length === 0) close()
}
</script>
