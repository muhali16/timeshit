<template>
  <div class="space-y-5 md:space-y-0 md:grid md:grid-cols-12 md:gap-6">
    <!-- Mobile Header -->
    <div class="md:col-span-12">
      <div class="md:hidden">
        <h1 class="text-xl font-bold text-text-primary">Dashboard</h1>
        <p class="text-text-tertiary text-sm mt-0.5">Ringkasan aktivitas hari ini</p>
      </div>
      <!-- Desktop Hero -->
      <div class="hidden md:block mb-8 animate-float-in">
        <h1 class="text-3xl font-bold text-text-primary tracking-tight">
          Halo, <span class="text-accent">{{ authStore.user?.name?.split(' ')[0] || 'User' }}</span>
        </h1>
        <p class="text-text-tertiary text-base mt-1">Ringkasan aktivitas kerja Anda</p>
      </div>
    </div>

    <!-- Upload Notifications -->
    <div v-if="pendingUploads.length > 0" class="md:col-span-12 space-y-2.5">
      <div
        v-for="upload in pendingUploads"
        :key="upload.id"
        class="glass rounded-2xl p-3.5"
        :class="{
          'border-l-4 border-l-success': upload.status === 'done',
          'border-l-4 border-l-danger': upload.status === 'error',
          'border-l-4 border-l-accent': upload.status === 'uploading' || upload.status === 'pending',
        }"
      >
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2 min-w-0">
            <svg v-if="upload.status === 'uploading'" class="w-4 h-4 text-accent animate-spin flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else-if="upload.status === 'done'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="upload.status === 'error'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-danger flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="text-sm font-medium truncate" :class="{
              'text-accent': upload.status === 'uploading',
              'text-success': upload.status === 'done',
              'text-danger': upload.status === 'error',
            }">{{ upload.file.name }}</span>
          </div>
          <button
            v-if="upload.status === 'done' || upload.status === 'error'"
            @click="store.removePendingUpload(upload.id)"
            class="text-text-tertiary hover:text-text-primary flex-shrink-0 ml-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="upload.status === 'uploading'" class="w-full bg-bg-primary/50 rounded-full h-1.5 overflow-hidden">
          <div class="bg-gradient-to-r from-accent to-accent-hover h-1.5 rounded-full transition-all duration-200" :style="{ width: upload.progress + '%' }"></div>
        </div>
        <p class="text-xs mt-1" :class="{
          'text-text-tertiary': upload.status === 'uploading',
          'text-success': upload.status === 'done',
          'text-danger': upload.status === 'error',
        }">
          <template v-if="upload.status === 'uploading'">Uploading... {{ upload.progress }}%</template>
          <template v-else>{{ upload.message }}</template>
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="md:col-span-4">
      <div class="glass glass-hover card-lift rounded-2xl p-5 text-center md:text-left relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-colors duration-500"></div>
        <p class="text-text-tertiary text-xs uppercase tracking-wider font-medium mb-2">Jam Hari Ini</p>
        <p class="text-3xl md:text-4xl font-bold text-accent tracking-tight">{{ todayHours }}</p>
        <p class="text-text-tertiary text-xs mt-1">Total jam kerja</p>
      </div>
    </div>
    <div class="md:col-span-4">
      <div class="glass glass-hover card-lift rounded-2xl p-5 text-center md:text-left relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-success/20 transition-colors duration-500"></div>
        <p class="text-text-tertiary text-xs uppercase tracking-wider font-medium mb-2">Total Entry</p>
        <p class="text-3xl md:text-4xl font-bold text-success tracking-tight">{{ totalEntries }}</p>
        <p class="text-text-tertiary text-xs mt-1">Entri tercatat</p>
      </div>
    </div>
    <div class="md:col-span-4">
      <div class="glass glass-hover card-lift rounded-2xl p-5 text-center md:text-left relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-24 h-24 bg-warning/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-warning/20 transition-colors duration-500"></div>
        <p class="text-text-tertiary text-xs uppercase tracking-wider font-medium mb-2">Lokasi Terakhir</p>
        <p class="text-lg md:text-xl font-semibold text-text-primary truncate">{{ lastLocation || 'Belum ada' }}</p>
        <p class="text-text-tertiary text-xs mt-1">Lokasi kerja terakhir</p>
      </div>
    </div>

    <!-- Quick Action Card (desktop only) -->
    <div class="hidden md:block md:col-span-12 mb-2">
      <router-link
        to="/timesheet"
        class="glass glass-hover card-lift rounded-2xl p-6 flex items-center justify-between group cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-shadow duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">Input Timesheet</p>
            <p class="text-text-tertiary text-sm">Catat aktivitas kerja hari ini</p>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </router-link>
    </div>

    <!-- Recent Entries -->
    <div class="md:col-span-12">
      <div class="flex items-center justify-between mb-3 md:mb-4">
        <h2 class="text-base md:text-lg font-semibold text-text-primary">Entri Terbaru</h2>
        <router-link to="/history" class="text-accent text-xs md:text-sm font-medium hover:text-accent-hover transition-colors flex items-center gap-1 group">
          Lihat Semua
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="inline-block w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="recentEntries.length === 0" class="text-center py-10">
        <p class="text-text-tertiary text-sm mb-2">Belum ada entri timesheet</p>
        <router-link to="/timesheet" class="text-accent text-sm font-medium">+ Buat entri pertama</router-link>
      </div>

      <!-- Mobile entries list -->
      <div v-else class="space-y-2.5 md:hidden">
        <div
          v-for="entry in recentEntries"
          :key="entry.id"
          class="glass rounded-xl p-3.5"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold text-accent uppercase bg-accent/10 px-2 py-0.5 rounded-md">{{ entry.hari?.slice(0, 3) }}</span>
                <span class="text-text-tertiary text-xs">{{ entry.tanggalDisplay || entry.tanggal }}</span>
              </div>
              <p class="text-sm font-medium text-text-primary">{{ entry.lokasi }}</p>
              <p class="text-text-tertiary text-xs mt-0.5">{{ entry.jam_mulai }} - {{ entry.jam_selesai }} · {{ entry.durasi }}</p>
              <div class="text-text-tertiary text-xs mt-0.5 max-h-[2.5rem] overflow-hidden">
                <p
                  v-for="(line, lIdx) in (entry.rincian_tugas || '').split('\n').filter(l => l.trim())"
                  :key="lIdx"
                  :class="{ 'task-muted': line.trim().startsWith('~') }"
                  class="leading-snug"
                >
                  {{ line }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <span v-if="hasPendingTask(entry.rincian_tugas)" class="px-1.5 py-0.5 bg-text-tertiary/20 text-text-tertiary text-[10px] rounded-md font-medium">
                pending
              </span>
              <span v-if="entry.evidence?.length" class="px-2 py-0.5 bg-accent/15 text-accent text-xs rounded-full font-medium">
                {{ entry.evidence.length }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop entries grid -->
      <div v-if="!loading && recentEntries.length > 0" class="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(entry, index) in recentEntries"
          :key="entry.id"
          class="glass glass-hover card-lift rounded-2xl p-5 opacity-0 animate-float-in"
          :class="`stagger-${Math.min(index + 1, 5)}`"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-accent/10 flex flex-col items-center justify-center">
                <span class="text-accent text-[10px] font-bold uppercase leading-none">{{ entry.hari?.slice(0, 3) }}</span>
                <span class="text-text-primary font-bold text-sm leading-tight">{{ entry.tanggalDisplay ? entry.tanggalDisplay.split(' ')[0] : entry.tanggal?.split('-')[2] }}</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-text-primary">{{ entry.lokasi }}</p>
                <p class="text-text-tertiary text-xs font-mono">{{ entry.jam_mulai }} - {{ entry.jam_selesai }}</p>
              </div>
            </div>
            <span class="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">
              {{ entry.durasi }}
            </span>
          </div>
          <div class="text-text-tertiary text-xs space-y-0.5 max-h-[3rem] overflow-hidden">
            <p
              v-for="(line, lIdx) in (entry.rincian_tugas || '').split('\n').filter(l => l.trim())"
              :key="lIdx"
              :class="{ 'task-muted': line.trim().startsWith('~') }"
            >
              {{ line }}
            </p>
          </div>
          <div v-if="entry.evidence?.length" class="mt-3 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span class="text-accent text-xs font-medium">{{ entry.evidence.length }} evidence</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useTimesheetStore } from '../stores/timesheetStore.js'
import { useAuthStore } from '../stores/authStore.js'

const store = useTimesheetStore()
const authStore = useAuthStore()
const loading = computed(() => store.loading)
const recentEntries = computed(() => store.entries.slice(0, 6))
const pendingUploads = computed(() => store.pendingUploads)
const totalEntries = computed(() => store.total)

const todayHours = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = store.entries.filter(e => e.tanggal === today)
  const totalMinutes = todayEntries.reduce((sum, e) => sum + (e.durasi_menit || 0), 0)
  return (totalMinutes / 60).toFixed(1)
})

const lastLocation = computed(() => {
  if (store.entries.length === 0) return null
  return store.entries[0]?.lokasi
})

function hasPendingTask(text) {
  if (!text) return false
  return text.split('\n').some(line => line.trim().startsWith('~'))
}

watch(pendingUploads, async (uploads) => {
  for (const upload of uploads) {
    if (upload.status === 'pending') {
      await store.uploadPendingFile(upload.id)
    }
  }
}, { deep: true, immediate: true })

onMounted(() => {
  store.fetchEntries({ limit: 10 })
})
</script>
