<template>
  <Transition
    enter-active-class="transition duration-300"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="pwa.isInstallable.value && !pwa.dismissed.value"
      class="fixed right-4 bottom-24 md:bottom-6 z-50 flex items-center gap-1"
    >
      <button
        @click="pwa.promptInstall"
        class="flex items-center gap-2 pl-4 pr-5 py-3 rounded-2xl btn-primary shadow-xl shadow-accent/30 text-sm font-semibold active:scale-95 transition-transform"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Install App
      </button>
      <button
        @click="pwa.dismiss"
        aria-label="Tutup"
        class="w-8 h-8 rounded-full glass-strong flex items-center justify-center text-text-tertiary hover:text-text-primary active:scale-95 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { usePWAInstall } from "../../composables/usePWAInstall.js";

const pwa = usePWAInstall();
</script>
