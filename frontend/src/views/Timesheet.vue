<template>
  <div class="max-w-lg mx-auto md:max-w-2xl lg:max-w-3xl">
    <div class="mb-5 md:mb-8">
      <h1 class="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Input Timesheet</h1>
      <p class="text-text-tertiary text-sm mt-0.5 md:text-base">Catat aktivitas kerja Anda</p>
    </div>

    <div class="glass rounded-2xl p-5 md:p-8 glow-orange">
      <form @submit.prevent="handleSubmit" class="space-y-4 md:space-y-5">
        <div>
          <label class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2">Tanggal</label>
          <input v-model="form.tanggal" type="date" required class="form-input" />
        </div>

        <div class="grid grid-cols-2 gap-3 md:gap-4">
          <div>
            <label class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2">Jam Mulai</label>
            <input v-model="form.jam_mulai" type="time" required class="form-input" />
            <p v-if="settings.defaultStartTime" class="text-text-tertiary text-[10px] md:text-xs mt-1 leading-snug">
              Default dari Settings: {{ settings.defaultStartTime }}
            </p>
          </div>
          <div>
            <label class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2">Jam Selesai</label>
            <input v-model="form.jam_selesai" type="time" required class="form-input" />
            <p v-if="settings.defaultEndTime" class="text-text-tertiary text-[10px] md:text-xs mt-1 leading-snug">
              Default dari Settings: {{ settings.defaultEndTime }}
            </p>
          </div>
        </div>
        <div v-if="durationPreview" class="flex items-center gap-2">
          <span class="text-accent text-xs md:text-sm font-medium">{{ durationPreview }}</span>
          <span v-if="settings.defaultBreakMinutes > 0" class="text-text-tertiary text-[10px] md:text-xs">
            (termasuk istirahat {{ settings.defaultBreakMinutes }} menit)
          </span>
        </div>
        <p v-if="!settings.defaultStartTime && !settings.defaultEndTime" class="text-text-tertiary text-[10px] md:text-xs -mt-2 leading-snug">
          Tip: Set jam default di <router-link to="/settings" class="text-accent underline hover:text-accent-hover transition-colors">Settings</router-link> agar otomatis terisi.
        </p>

        <!-- Location: dynamic based on settings -->
        <div>
          <label class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2">Lokasi</label>

          <template v-if="locationMode === 'select'">
            <div class="relative" ref="locWrapper">
              <button
                type="button"
                @click="locOpen = !locOpen"
                class="form-input text-left flex items-center justify-between"
                :class="{ 'text-text-tertiary': !selectedLocation || selectedLocation === '' }"
              >
                <span>{{ selectedLocationLabel }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-if="locOpen" class="absolute z-30 top-full left-0 right-0 mt-1 glass-strong rounded-xl shadow-2xl overflow-hidden">
                <div class="max-h-48 overflow-y-auto">
                  <button
                    v-for="loc in settings.locations"
                    :key="loc.name"
                    type="button"
                    @click="selectLocation(loc.name)"
                    :class="[
                      'w-full px-3.5 py-2.5 text-left text-sm transition-colors',
                      selectedLocation === loc.name
                        ? 'bg-accent/15 text-accent font-medium'
                        : 'text-text-secondary hover:bg-white/5'
                    ]"
                  >
                    {{ loc.name }}
                  </button>
                  <button
                    type="button"
                    @click="selectLocation('__custom__')"
                    :class="[
                      'w-full px-3.5 py-2.5 text-left text-sm transition-colors border-t border-white/10',
                      selectedLocation === '__custom__'
                        ? 'bg-accent/15 text-accent font-medium'
                        : 'text-text-tertiary hover:bg-white/5'
                    ]"
                  >
                    Lainnya (ketik manual)...
                  </button>
                </div>
              </div>
            </div>
            <div v-if="selectedLocation === '__custom__'" class="mt-2">
              <input
                v-model="customLocation"
                type="text"
                required
                placeholder="Masukkan lokasi kerja..."
                class="form-input"
              />
            </div>
          </template>

          <template v-else>
            <input
              v-model="form.lokasi"
              type="text"
              required
              :placeholder="locationMode === 'single' ? settings.locations[0]?.name : 'Contoh: Kantor Pusat - Jakarta'"
              class="form-input"
            />
          </template>

          <p v-if="settings.locations.length === 0" class="text-text-tertiary text-[10px] md:text-xs mt-1 leading-snug">
            Tip: Tambahkan daftar lokasi di <router-link to="/settings" class="text-accent underline hover:text-accent-hover transition-colors">Settings</router-link> untuk kemudahan input.
          </p>
        </div>

        <div>
          <label class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2">Rincian Tugas</label>
          <textarea
            ref="rincianTextarea"
            v-model="form.rincian_tugas"
            rows="1"
            required
            placeholder="Deskripsikan aktivitas yang dilakukan..."
            class="form-input resize-none overflow-hidden"
            @paste="handlePaste"
            @input="autoResize(rincianTextarea)"
          ></textarea>
          <div v-if="parseToast.show" class="mt-1.5 flex items-center gap-2 p-2 glass rounded-lg border-l-2 border-l-accent">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="text-xs text-accent flex-1">{{ parseToast.message }}</span>
            <button @click="undoParse" type="button" class="text-xs text-accent font-medium hover:underline flex-shrink-0">
              Batal
            </button>
          </div>
        </div>

        <!-- Evidence Files -->
        <div>
          <label class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2">Evidence (Opsional)</label>
          <div
            tabindex="0"
            @click="$refs.fileInput.click()"
            @dragover.prevent
            @drop.prevent="handleDrop"
            @paste.prevent="handlePasteFiles"
            class="border-2 border-dashed border-white/10 rounded-xl p-5 md:p-6 text-center cursor-pointer hover:border-accent/40 transition-colors focus:outline-none focus:border-accent/60"
            :class="{ 'border-accent/40 bg-accent/5': dragOver }"
            @dragenter.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 mx-auto text-text-tertiary mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-text-secondary text-sm">Klik, drag, atau paste file di sini</p>
            <p class="text-text-tertiary text-xs mt-0.5">PDF, Gambar, Dokumen (Max 50MB)</p>
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              class="hidden"
              @change="handleFileSelect"
            />
          </div>

          <div v-if="selectedFiles.length > 0" class="mt-2.5 space-y-2">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="flex items-center justify-between p-2.5 glass rounded-xl"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div class="min-w-0">
                  <p class="text-sm text-text-primary truncate">{{ file.name }}</p>
                  <p class="text-xs text-text-tertiary">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button @click="removeFile(index)" type="button" class="p-1 text-danger hover:bg-danger/10 rounded-lg flex-shrink-0 transition-all active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-if="error" class="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-3 md:py-3.5 btn-primary rounded-xl text-sm md:text-base font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg v-if="submitting" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ submitting ? 'Menyimpan...' : 'Simpan Timesheet' }}
        </button>
      </form>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2 md:bottom-6 md:right-6">
      <transition-group
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="glass-strong rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 max-w-xs md:max-w-sm"
          :class="{
            'border-l-2 border-l-success': toast.type === 'success',
            'border-l-2 border-l-danger': toast.type === 'error',
            'border-l-2 border-l-accent': toast.type === 'info',
          }"
        >
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-danger flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-text-primary">{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTimesheetStore } from '../stores/timesheetStore.js'
import { useAuthStore } from '../stores/authStore.js'
import api from '../services/api.js'
import { parseWrapUpText } from '../utils/textFilter.js'

const router = useRouter()
const store = useTimesheetStore()
const authStore = useAuthStore()
const submitting = ref(false)
const error = ref(null)
const selectedFiles = ref([])
const dragOver = ref(false)
const selectedLocation = ref('')
const customLocation = ref('')
const locOpen = ref(false)
const locWrapper = ref(null)
const rincianTextarea = ref(null)
const parseToast = ref({ show: false, message: '' })
const undoText = ref('')
let parseToastTimer = null

// Toast notifications
const toasts = ref([])

function autoResize(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.max(el.scrollHeight, 80) + 'px'
}

function showToast(message, type = 'success', duration = 4000) {
  const id = Date.now() + Math.random()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

const selectedLocationLabel = computed(() => {
  if (!selectedLocation.value) return 'Pilih lokasi...'
  if (selectedLocation.value === '__custom__') return 'Lainnya (ketik manual)...'
  return selectedLocation.value
})

function selectLocation(val) {
  selectedLocation.value = val
  locOpen.value = false
  if (val !== '__custom__') {
    form.lokasi = val
    customLocation.value = ''
  } else {
    form.lokasi = ''
  }
}

function onLocClickOutside(e) {
  if (locWrapper.value && !locWrapper.value.contains(e.target)) {
    locOpen.value = false
  }
}

const settings = reactive({
  defaultStartTime: '',
  defaultEndTime: '',
  defaultBreakMinutes: 0,
  locations: [],
})

const locationMode = computed(() => {
  if (settings.locations.length > 1) return 'select'
  if (settings.locations.length === 1) return 'single'
  return 'text'
})

const durationPreview = computed(() => {
  if (!form.jam_mulai || !form.jam_selesai) return ''
  const [sh, sm] = form.jam_mulai.split(':').map(Number)
  const [eh, em] = form.jam_selesai.split(':').map(Number)
  const startMinutes = sh * 60 + sm
  const endMinutes = eh * 60 + em
  let duration = endMinutes - startMinutes - settings.defaultBreakMinutes
  if (endMinutes < startMinutes || duration <= 0) return ''
  const hours = Math.floor(duration / 60)
  const mins = duration % 60
  if (mins === 0) return `${hours} jam`
  return `${hours} jam ${mins} menit`
})

const form = reactive({
  tanggal: new Date().toISOString().split('T')[0],
  jam_mulai: '',
  jam_selesai: '',
  lokasi: '',
  rincian_tugas: '',
})

watch(customLocation, (val) => {
  if (selectedLocation.value === '__custom__') {
    form.lokasi = val
  }
})

function applySettings() {
  const user = authStore.user
  if (!user) return

  settings.defaultStartTime = user.defaultStartTime || ''
  settings.defaultEndTime = user.defaultEndTime || ''
  settings.defaultBreakMinutes = user.defaultBreakMinutes || 0
  settings.locations = (user.locations || []).map(l => ({ ...l }))

  if (settings.defaultStartTime) {
    form.jam_mulai = settings.defaultStartTime
  }
  if (settings.defaultEndTime) {
    form.jam_selesai = settings.defaultEndTime
  }

  if (settings.locations.length === 1) {
    form.lokasi = settings.locations[0].name
  } else if (settings.locations.length > 1) {
    const defaultLoc = settings.locations.find(l => l.isDefault)
    if (defaultLoc) {
      selectedLocation.value = defaultLoc.name
      form.lokasi = defaultLoc.name
    }
  }
}

onMounted(async () => {
  document.addEventListener('click', onLocClickOutside)
  if (authStore.user) {
    applySettings()
  } else {
    try {
      await authStore.fetchUser()
      applySettings()
    } catch {
      // ignore
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onLocClickOutside)
})

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  selectedFiles.value.push(...files)
}

function handleDrop(event) {
  dragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  selectedFiles.value.push(...files)
}

function handlePasteFiles(event) {
  const clipboardData = event.clipboardData || window.clipboardData
  if (!clipboardData) return
  const files = Array.from(clipboardData.files || [])
  if (files.length > 0) {
    selectedFiles.value.push(...files)
    showToast(`${files.length} file dari clipboard ditambahkan`, 'info', 2000)
  }
}

function removeFile(index) {
  selectedFiles.value.splice(index, 1)
}

function handlePaste(event) {
  const clipboardData = event.clipboardData || window.clipboardData
  const pastedText = clipboardData.getData('text')
  const user = authStore.user
  const textFilter = user?.textFilter

  if (!textFilter?.enabled || !pastedText?.trim()) return

  const result = parseWrapUpText(pastedText, textFilter)
  if (!result.tasks.length) return

  event.preventDefault()

  undoText.value = form.rincian_tugas
  form.rincian_tugas = result.output

  parseToast.value = {
    show: true,
    message: `Smart filter diterapkan: ${result.tasks.length} task ditemukan.`,
  }

  if (parseToastTimer) clearTimeout(parseToastTimer)
  parseToastTimer = setTimeout(() => {
    parseToast.value.show = false
  }, 5000)
}

function undoParse() {
  if (undoText.value !== '') {
    form.rincian_tugas = undoText.value
    undoText.value = ''
  }
  parseToast.value.show = false
}

async function handleSubmit() {
  if (locationMode.value === 'single' && !form.lokasi.trim()) {
    form.lokasi = settings.locations[0]?.name || ''
  }

  submitting.value = true
  error.value = null
  try {
    const payload = {
      tanggal: form.tanggal,
      jam_mulai: form.jam_mulai,
      jam_selesai: form.jam_selesai,
      lokasi: form.lokasi,
      rincian_tugas: form.rincian_tugas,
    }
    const response = await store.createEntry(payload)
    const timesheetId = response.data?.id
    if (selectedFiles.value.length > 0 && timesheetId) {
      store.addPendingUpload(timesheetId, selectedFiles.value)
      showToast(`Timesheet tersimpan! Upload ${selectedFiles.value.length} evidence berjalan di background...`, 'info', 4000)
    } else {
      showToast('Timesheet berhasil disimpan', 'success', 3000)
    }
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Gagal menyimpan timesheet'
    showToast(error.value, 'error', 5000)
  } finally {
    submitting.value = false
  }
}
</script>
