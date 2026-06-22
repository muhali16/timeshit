<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="pwa.instructionsOpen.value"
        class="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
        @click.self="pwa.closeInstructions"
      >
        <div
          class="glass-strong w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 max-h-[85vh] overflow-y-auto animate-float-in safe-area-bottom"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-5">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 text-accent"
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
              </div>
              <div>
                <h2 class="text-base font-semibold text-text-primary">
                  Install TimeShit
                </h2>
                <p class="text-xs text-text-tertiary mt-0.5">{{ deviceLabel }}</p>
              </div>
            </div>
            <button
              @click="pwa.closeInstructions"
              class="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
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

          <!-- Steps -->
          <ol class="space-y-3">
            <li
              v-for="(step, i) in steps"
              :key="i"
              class="flex items-start gap-3"
            >
              <span
                class="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                >{{ i + 1 }}</span
              >
              <p class="text-sm text-text-secondary leading-relaxed" v-html="step" />
            </li>
          </ol>

          <button
            @click="pwa.closeInstructions"
            class="w-full mt-6 py-3 btn-primary rounded-xl text-sm font-medium"
          >
            Mengerti
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import { usePWAInstall } from "../../composables/usePWAInstall.js";

const pwa = usePWAInstall();

const deviceLabel = computed(() => {
  if (pwa.platform.isIOS) return "iPhone / iPad — Safari";
  if (pwa.platform.isFirefox) return "Firefox";
  if (pwa.platform.isAndroid) return "Android";
  return "Browser ini";
});

const steps = computed(() => {
  if (pwa.platform.isIOS) {
    return [
      'Buka menu <b>Bagikan</b> (ikon kotak dengan panah ke atas) di bar bawah Safari.',
      'Gulir lalu ketuk <b>Tambah ke Layar Utama</b> (Add to Home Screen).',
      'Ketuk <b>Tambah</b> di pojok kanan atas. TimeShit muncul sebagai app di home screen.',
    ];
  }
  if (pwa.platform.isFirefox) {
    return [
      'Buka menu <b>⋮</b> (tiga titik) di browser.',
      'Pilih <b>Install</b> atau <b>Tambah ke Layar Utama</b>.',
      'Konfirmasi. TimeShit terpasang sebagai app.',
    ];
  }
  if (pwa.platform.isAndroid) {
    return [
      'Buka menu <b>⋮</b> (tiga titik) di pojok kanan atas Chrome.',
      'Ketuk <b>Install app</b> / <b>Tambah ke Layar Utama</b>.',
      'Konfirmasi. TimeShit muncul di laci aplikasi.',
    ];
  }
  return [
    'Klik ikon <b>install</b> (monitor dengan panah) di ujung kanan address bar.',
    'Atau buka menu <b>⋮</b> → <b>Install TimeShit</b>.',
    'Konfirmasi. App terbuka di jendela sendiri.',
  ];
});
</script>
