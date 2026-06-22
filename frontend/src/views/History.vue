<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Riwayat</h1>
        <p class="text-text-tertiary text-sm mt-0.5">Semua entri timesheet</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="openMarkAbsence"
          class="px-3 py-2 glass glass-hover rounded-xl text-xs md:text-sm font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tidak Masuk
        </button>
        <router-link
          to="/timesheet"
          class="px-3.5 py-2 btn-primary rounded-xl text-xs md:text-sm font-medium flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Timesheet Baru
        </router-link>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 p-1 glass rounded-2xl w-fit">
      <button
        @click="activeTab = 'entries'"
        :class="[
          'px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all',
          activeTab === 'entries'
            ? 'bg-accent/15 text-accent shadow-sm'
            : 'text-text-tertiary hover:text-text-secondary'
        ]"
      >
        Entri Kerja
        <span v-if="entries.length > 0" class="ml-1.5 px-1.5 py-0.5 text-[10px] bg-bg-primary/60 rounded-full">{{ entries.length }}</span>
      </button>
      <button
        @click="activeTab = 'absence'"
        :class="[
          'px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all',
          activeTab === 'absence'
            ? 'bg-accent/15 text-accent shadow-sm'
            : 'text-text-tertiary hover:text-text-secondary'
        ]"
      >
        Tidak Masuk
        <span v-if="absenceEntries.length > 0" class="ml-1.5 px-1.5 py-0.5 text-[10px] bg-bg-primary/60 rounded-full">{{ absenceEntries.length }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div v-if="activeTab === 'entries'" class="glass rounded-2xl p-4 md:p-5">
      <div class="grid grid-cols-2 gap-3 md:flex md:items-end md:gap-4">
        <div>
          <label class="block text-xs text-text-tertiary mb-1.5 font-medium">Dari</label>
          <input
            v-model="filters.date_from"
            type="date"
            class="form-input"
            @change="applyFilters"
          />
        </div>
        <div>
          <label class="block text-xs text-text-tertiary mb-1.5 font-medium">Sampai</label>
          <input
            v-model="filters.date_to"
            type="date"
            class="form-input"
            @change="applyFilters"
          />
        </div>
        <div>
          <label class="block text-xs text-text-tertiary mb-1.5 font-medium">Urutkan</label>
          <select
            v-model="sortOption"
            class="form-input text-sm"
          >
            <option value="date_asc">Tanggal (Awal)</option>
            <option value="date_desc">Tanggal (Terbaru)</option>
            <option value="duration_asc">Durasi (Terkecil)</option>
            <option value="duration_desc">Durasi (Terbesar)</option>
            <option value="location">Lokasi (A-Z)</option>
          </select>
        </div>
        <div class="col-span-2 flex flex-wrap items-center gap-3 md:ml-auto md:col-span-1">
          <button
            v-if="filters.date_from || filters.date_to"
            @click="resetFilters"
            class="text-xs text-accent font-medium hover:text-accent-hover transition-colors"
          >
            Reset filter
          </button>
          <button
            @click="openExport"
            class="px-4 py-2.5 btn-primary rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export ke Excel
          </button>
        </div>
      </div>
      <p class="text-text-tertiary text-[10px] md:text-xs mt-2 leading-relaxed">
        💡 Filter tanggal otomatis diterapkan berdasarkan periode default. Atur di
        <router-link to="/settings" class="text-accent hover:underline font-medium">Preferensi Settings</router-link>.
      </p>
    </div>

    <!-- Entries Tab -->
    <div v-if="activeTab === 'entries'">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="sortedEntries.length === 0" class="text-center py-12 glass rounded-2xl">
        <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-accent/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-accent/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-text-tertiary text-sm mb-2">Belum ada entri timesheet</p>
        <router-link to="/timesheet" class="text-accent text-sm font-medium hover:text-accent-hover transition-colors">+ Buat entri pertama</router-link>
      </div>

      <!-- Entries list (mobile) & masonry (desktop) -->
      <div v-else>
        <!-- Mobile -->
        <div class="space-y-2.5 md:hidden">
          <div
            v-for="entry in sortedEntries"
            :key="entry.id"
            class="glass rounded-2xl p-4"
          >
            <!-- Header row: icon + meta + actions -->
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-11 h-11 bg-accent/10 rounded-xl flex flex-col items-center justify-center">
                <span class="text-accent text-[10px] font-bold uppercase leading-none">{{ entry.hari?.slice(0, 3) }}</span>
                <span class="text-text-primary font-bold text-sm leading-tight">{{ entry.tanggalDisplay ? entry.tanggalDisplay.split(' ')[0] : entry.tanggal?.split('-')[2] }}</span>
                <span class="text-text-tertiary text-[8px] leading-none mt-0.5">{{ formatMonthYear(entry.tanggal) }}</span>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-text-secondary text-xs font-mono">{{ entry.jam_mulai }} - {{ entry.jam_selesai }}</span>
                  <span class="text-accent text-xs font-medium">{{ entry.durasi }}</span>
                </div>
                <p class="text-sm font-medium text-text-primary">{{ entry.lokasi }}</p>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1 flex-shrink-0">
                <button
                  @click="openEdit(entry)"
                  type="button"
                  class="p-1.5 text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-lg transition-all active:scale-90"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(entry)"
                  type="button"
                  class="p-1.5 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg transition-all active:scale-90"
                  title="Hapus"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Rincian tugas: full width -->
            <div class="text-text-tertiary text-xs mt-2 space-y-0.5">
              <p
                v-for="(line, lIdx) in (entry.rincian_tugas || '').split('\n').filter(l => l.trim())"
                :key="lIdx"
                :class="{ 'task-muted': line.trim().startsWith('~') }"
              >
                {{ line }}
              </p>
            </div>

            <!-- Evidence: full width -->
            <div v-if="entry.evidence?.length > 0" class="flex flex-wrap gap-1.5 mt-2">
              <a
                v-for="file in entry.evidence"
                :key="file.file_name"
                :href="file.google_drive_url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-bg-primary/50 border border-border rounded-lg text-xs text-text-secondary hover:border-accent hover:text-accent transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span class="truncate max-w-[120px]">{{ file.file_name }}</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Desktop masonry -->
        <div class="hidden md:block masonry-2 lg:masonry-3">
          <div
            v-for="entry in sortedEntries"
            :key="entry.id"
            class="glass glass-hover card-lift rounded-2xl p-5 group masonry-item mb-4"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-accent/10 flex flex-col items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <span class="text-accent text-[10px] font-bold uppercase leading-none">{{ entry.hari?.slice(0, 3) }}</span>
                  <span class="text-text-primary font-bold text-base leading-tight">{{ entry.tanggalDisplay ? entry.tanggalDisplay.split(' ')[0] : entry.tanggal?.split('-')[2] }}</span>
                  <span class="text-text-tertiary text-[8px] leading-none mt-0.5">{{ formatMonthYear(entry.tanggal) }}</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-text-primary">{{ entry.lokasi }}</p>
                  <p class="text-text-tertiary text-xs font-mono">{{ entry.jam_mulai }} - {{ entry.jam_selesai }}</p>
                </div>
              </div>
              <span class="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">{{ entry.durasi }}</span>
            </div>

            <div class="text-text-tertiary text-xs space-y-0.5 mb-4">
              <p
                v-for="(line, lIdx) in (entry.rincian_tugas || '').split('\n').filter(l => l.trim())"
                :key="lIdx"
                :class="{ 'task-muted': line.trim().startsWith('~') }"
              >
                {{ line }}
              </p>
            </div>

            <!-- Evidence links like mobile -->
            <div v-if="entry.evidence?.length > 0" class="flex flex-wrap gap-1.5 mb-4">
              <a
                v-for="file in entry.evidence"
                :key="file.file_name"
                :href="file.google_drive_url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-bg-primary/50 border border-border rounded-lg text-xs text-text-secondary hover:border-accent hover:text-accent transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span class="truncate max-w-[140px]">{{ file.file_name }}</span>
              </a>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-white/5">
              <span v-if="entry.evidence?.length > 0" class="text-text-tertiary text-xs">{{ entry.evidence.length }} file</span>
              <span v-else></span>
              <div class="flex items-center gap-1">
                <button
                  @click="openEdit(entry)"
                  type="button"
                  class="p-2 text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-xl transition-all active:scale-90"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(entry)"
                  type="button"
                  class="p-2 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-xl transition-all active:scale-90"
                  title="Hapus"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Absence Tab -->
    <div v-if="activeTab === 'absence'" class="space-y-2.5">
      <div v-if="absenceEntries.length === 0" class="text-center py-12 glass rounded-2xl">
        <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-danger/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-danger/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-text-tertiary text-sm mb-2">Belum ada entri tidak masuk / libur</p>
        <button @click="openMarkAbsence" class="text-accent text-sm font-medium hover:text-accent-hover transition-colors">+ Tandai tidak masuk</button>
      </div>

      <template v-else>
        <!-- Mobile -->
        <div class="space-y-2.5 md:hidden">
          <div
            v-for="entry in absenceEntries"
            :key="entry.id"
            class="glass rounded-2xl p-4 border-l-2"
            :style="{ borderLeftColor: entry.reason?.color || '#ef4444' }"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center" :class="entry.isNationalHoliday ? 'bg-accent/10' : 'bg-danger/10'">
                <span class="text-[10px] font-bold uppercase leading-none" :class="entry.isNationalHoliday ? 'text-accent' : 'text-danger'">{{ entry.hari?.slice(0, 3) }}</span>
                <span class="font-bold text-sm leading-tight text-text-primary">{{ entry.tanggalDisplay }}</span>
                <span class="text-text-tertiary text-[8px] leading-none mt-0.5" :class="entry.isNationalHoliday ? 'text-accent' : 'text-text-tertiary'">{{ formatMonthYearFromDate(entry.entryDate) }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-text-primary">{{ entry.reason?.name || entry.holidayName || 'Libur Nasional' }}</p>
                <p v-if="entry.notes" class="text-text-tertiary text-xs mt-0.5">{{ entry.notes }}</p>
              </div>
              <button
                @click="deleteAbsenceEntry(entry.id)"
                class="p-1.5 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg transition-all active:scale-90"
                title="Hapus"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <!-- Desktop masonry -->
        <div class="hidden md:block masonry-2 lg:masonry-3">
          <div
            v-for="entry in absenceEntries"
            :key="entry.id"
            class="glass rounded-2xl p-5 masonry-item mb-4 border-l-2"
            :style="{ borderLeftColor: entry.reason?.color || '#ef4444' }"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl flex flex-col items-center justify-center" :class="entry.isNationalHoliday ? 'bg-accent/10' : 'bg-danger/10'">
                  <span class="text-[10px] font-bold uppercase leading-none" :class="entry.isNationalHoliday ? 'text-accent' : 'text-danger'">{{ entry.hari?.slice(0, 3) }}</span>
                  <span class="font-bold text-base leading-tight text-text-primary">{{ entry.tanggalDisplay }}</span>
                  <span class="text-text-tertiary text-[8px] leading-none mt-0.5" :class="entry.isNationalHoliday ? 'text-accent' : 'text-text-tertiary'">{{ formatMonthYearFromDate(entry.entryDate) }}</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-text-primary">{{ entry.reason?.name || entry.holidayName || 'Libur Nasional' }}</p>
                </div>
              </div>
              <button
                @click="deleteAbsenceEntry(entry.id)"
                class="p-2 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-xl transition-all active:scale-90"
                title="Hapus"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <p v-if="entry.notes" class="text-text-tertiary text-xs">{{ entry.notes }}</p>
          </div>
        </div>
      </template>
    </div>

    <!-- Mark Absence Modal -->
    <transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showAbsenceModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeAbsenceModal"></div>
        <div class="relative glass-strong w-full max-w-md rounded-2xl p-5 md:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-text-primary">Tandai Tidak Masuk</h3>
            <button @click="closeAbsenceModal" class="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label class="block text-xs font-medium text-text-secondary mb-1.5">Tanggal</label>
            <input v-model="absenceForm.entry_date" type="date" class="form-input" />
          </div>

          <div>
            <label class="block text-xs font-medium text-text-secondary mb-1.5">Alasan</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="reason in absenceReasonOptions"
                :key="reason.id"
                @click="absenceForm.reason_id = reason.id"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                  absenceForm.reason_id === reason.id
                    ? 'ring-2 ring-offset-1 ring-offset-bg-primary'
                    : 'glass hover:bg-white/5'
                ]"
                :style="absenceForm.reason_id === reason.id ? { backgroundColor: reason.color + '20', color: reason.color, ringColor: reason.color } : {}"
              >
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: reason.color }"></span>
                {{ reason.name }}
              </button>
            </div>
            <p v-if="absenceReasonOptions.length === 0" class="text-text-tertiary text-xs mt-2">
              Belum ada alasan. Tambahkan di <router-link to="/settings" class="text-accent hover:underline">Settings</router-link>.
            </p>
          </div>

          <div>
            <label class="block text-xs font-medium text-text-secondary mb-1.5">Catatan (Opsional)</label>
            <textarea v-model="absenceForm.notes" rows="2" class="form-input resize-none" placeholder="Tambahkan keterangan..."></textarea>
          </div>

          <div v-if="absenceHolidayInfo" class="p-3 glass rounded-xl text-xs">
            <span class="text-accent font-medium">{{ absenceHolidayInfo.name }}</span>
            <span class="text-text-tertiary"> pada tanggal ini.</span>
          </div>

          <div class="flex gap-3 pt-1">
            <button @click="closeAbsenceModal" class="flex-1 py-2.5 text-text-secondary text-sm font-medium border border-white/10 rounded-xl hover:bg-white/5 transition-all active:scale-95">
              Batal
            </button>
            <button
              @click="saveAbsence"
              :disabled="savingAbsence || !absenceForm.entry_date || !absenceForm.reason_id"
              class="flex-1 py-2.5 btn-primary rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              <svg v-if="savingAbsence" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ savingAbsence ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Edit Modal -->
    <transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showEditModal" class="fixed inset-0 z-50" @click.self="closeEdit">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center p-4">
          <div class="glass-strong md:max-w-lg md:w-full rounded-t-2xl md:rounded-2xl max-h-[85vh] overflow-y-auto">
            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-bold text-text-primary">Edit Timesheet</h2>
                <button @click="closeEdit" class="p-1.5 text-text-tertiary hover:text-text-primary rounded-xl hover:bg-white/5 transition-all active:scale-90">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div v-if="editError" class="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm">
                {{ editError }}
              </div>

              <div>
                <label class="block text-xs font-medium text-text-secondary mb-1.5">Tanggal</label>
                <input v-model="editForm.tanggal" type="date" class="form-input" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-text-secondary mb-1.5">Jam Mulai</label>
                  <input v-model="editForm.jam_mulai" type="time" class="form-input" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-text-secondary mb-1.5">Jam Selesai</label>
                  <input v-model="editForm.jam_selesai" type="time" class="form-input" />
                </div>
              </div>
              <div v-if="editDurationPreview" class="flex items-center gap-2">
                <span class="text-accent text-xs font-medium">{{ editDurationPreview }}</span>
                <span v-if="userBreakMinutes > 0" class="text-text-tertiary text-[10px]">
                  (termasuk istirahat {{ userBreakMinutes }} menit)
                </span>
              </div>

              <!-- Location: dynamic based on settings -->
              <div>
                <label class="block text-xs font-medium text-text-secondary mb-1.5">Lokasi</label>
                <template v-if="editLocationMode === 'select'">
                  <div class="relative" ref="editLocWrapper">
                    <button
                      type="button"
                      @click="editLocOpen = !editLocOpen"
                      class="form-input text-left flex items-center justify-between"
                      :class="{ 'text-text-tertiary': !editSelectedLocation || editSelectedLocation === '' }"
                    >
                      <span>{{ editSelectedLocationLabel }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div v-if="editLocOpen" class="absolute z-30 top-full left-0 right-0 mt-1 glass-strong rounded-xl shadow-2xl overflow-hidden max-h-48">
                      <div class="max-h-48 overflow-y-auto">
                        <button
                          v-for="loc in userLocations"
                          :key="loc.name"
                          type="button"
                          @click="selectEditLocation(loc.name)"
                          :class="[
                            'w-full px-3.5 py-2.5 text-left text-sm transition-colors',
                            editSelectedLocation === loc.name
                              ? 'bg-accent/15 text-accent font-medium'
                              : 'text-text-secondary hover:bg-white/5'
                          ]"
                        >
                          {{ loc.name }}
                        </button>
                        <button
                          type="button"
                          @click="selectEditLocation('__custom__')"
                          :class="[
                            'w-full px-3.5 py-2.5 text-left text-sm transition-colors border-t border-white/10',
                            editSelectedLocation === '__custom__'
                              ? 'bg-accent/15 text-accent font-medium'
                              : 'text-text-tertiary hover:bg-white/5'
                          ]"
                        >
                          Lainnya (ketik manual)...
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-if="editSelectedLocation === '__custom__'" class="mt-2">
                    <input
                      v-model="editCustomLocation"
                      type="text"
                      placeholder="Masukkan lokasi kerja..."
                      class="form-input"
                    />
                  </div>
                </template>
                <template v-else>
                  <input
                    v-model="editForm.lokasi"
                    type="text"
                    :placeholder="editLocationMode === 'single' ? userLocations[0]?.name : 'Contoh: Kantor Pusat - Jakarta'"
                    class="form-input"
                  />
                </template>
              </div>

              <div>
                <label class="block text-xs font-medium text-text-secondary mb-1.5">Rincian Tugas</label>
                <textarea
                  ref="editTextarea"
                  v-model="editForm.rincian_tugas"
                  rows="1"
                  class="form-input resize-none overflow-hidden"
                  placeholder="Deskripsikan aktivitas yang dilakukan..."
                  @input="autoResize(editTextarea)"
                ></textarea>
              </div>

              <!-- Existing Evidence -->
              <div v-if="editingEntry?.evidence?.length > 0">
                <label class="block text-xs font-medium text-text-secondary mb-1.5">Evidence</label>
                <div class="space-y-2">
                  <div
                    v-for="file in editingEntry.evidence"
                    :key="file.id"
                    class="flex items-center justify-between p-2.5 glass rounded-xl"
                  >
                    <a
                      :href="file.google_drive_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-2 min-w-0 flex-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="text-sm text-text-primary truncate">{{ file.file_name }}</span>
                    </a>
                    <button
                      @click="deleteEvidenceFile(file.id)"
                      :disabled="deletingEvidence === file.id"
                      type="button"
                      class="p-1 text-danger hover:bg-danger/10 rounded-lg flex-shrink-0 transition-all active:scale-90"
                    >
                      <svg v-if="deletingEvidence === file.id" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Upload New Evidence -->
              <div>
                <label class="block text-xs font-medium text-text-secondary mb-1.5">Tambah Evidence</label>
                <div
                  tabindex="0"
                  @click="$refs.editFileInput.click()"
                  @dragover.prevent
                  @drop.prevent="handleEditDrop"
                  @paste.prevent="handleEditPasteFiles"
                  class="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-accent/40 transition-colors focus:outline-none focus:border-accent/60"
                  :class="{ 'border-accent/40 bg-accent/5': editDragOver }"
                  @dragenter.prevent="editDragOver = true"
                  @dragleave.prevent="editDragOver = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mx-auto text-text-tertiary mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="text-text-secondary text-xs">Klik, drag, atau paste file di sini</p>
                  <input
                    ref="editFileInput"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    class="hidden"
                    @change="handleEditFileSelect"
                  />
                </div>
                <div v-if="editNewFiles.length > 0" class="mt-2 space-y-1.5">
                  <div
                    v-for="(file, index) in editNewFiles"
                    :key="index"
                    class="flex items-center justify-between p-2 glass rounded-lg"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="text-xs text-text-primary truncate">{{ file.name }}</span>
                    </div>
                    <button @click="editNewFiles.splice(index, 1)" type="button" class="p-1 text-danger hover:bg-danger/10 rounded flex-shrink-0 transition-all active:scale-90">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  @click="closeEdit"
                  type="button"
                  class="flex-1 py-3 text-text-secondary text-sm font-medium border border-white/10 rounded-2xl hover:bg-white/5 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  @click="saveEdit"
                  :disabled="savingEdit || uploadingEvidence"
                  class="flex-1 py-3 btn-primary rounded-2xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg v-if="savingEdit || uploadingEvidence" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ savingEdit ? 'Menyimpan...' : uploadingEvidence ? 'Uploading...' : 'Simpan Perubahan' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showDeleteModal = false"></div>
        <div class="relative glass-strong w-full max-w-sm rounded-2xl p-6 space-y-5">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-danger/15 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-semibold text-text-primary">Hapus Timesheet?</h3>
              <p class="text-text-tertiary text-xs mt-1 leading-relaxed">Entri ini akan dihapus secara permanen dari database dan Google Drive.</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="showDeleteModal = false"
              type="button"
              class="flex-1 py-2.5 text-text-secondary text-sm font-medium border border-white/10 rounded-xl hover:bg-white/5 transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              @click="doDelete"
              :disabled="deleting"
              class="flex-1 py-2.5 bg-gradient-to-r from-danger to-red-600 hover:from-red-500 hover:to-red-700 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              <svg v-if="deleting" class="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ deleting ? 'Menghapus...' : 'Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

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

    <!-- Export Modal -->
    <transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeExport"></div>
        <div class="relative glass-strong w-full max-w-lg rounded-2xl p-5 md:p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base md:text-lg font-semibold text-text-primary">Export Excel</h3>
              <p class="text-text-tertiary text-xs mt-0.5">Pilih kolom dan periode yang ingin diekspor</p>
            </div>
            <button @click="closeExport" class="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-text-tertiary mb-1.5 font-medium">Dari Tanggal</label>
              <input v-model="exportForm.date_from" type="date" class="form-input" />
            </div>
            <div>
              <label class="block text-xs text-text-tertiary mb-1.5 font-medium">Sampai Tanggal</label>
              <input v-model="exportForm.date_to" type="date" class="form-input" />
            </div>
          </div>

          <!-- Include Absence -->
          <div
            class="flex items-center gap-2 p-2.5 rounded-xl glass hover:bg-white/5 transition-colors cursor-pointer select-none"
            @click="exportForm.include_absence = !exportForm.include_absence"
          >
            <div
              :class="[
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                exportForm.include_absence
                  ? 'bg-accent border-accent'
                  : 'border-border bg-bg-primary/50'
              ]"
            >
              <svg
                v-if="exportForm.include_absence"
                xmlns="http://www.w3.org/2000/svg"
                class="w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <label class="flex-1 text-sm text-text-primary cursor-pointer select-none">Sertakan entri tidak masuk (Absence)</label>
          </div>

          <!-- Absence Mode -->
          <div v-if="exportForm.include_absence" class="space-y-2 pl-1">
            <label class="text-xs text-text-tertiary font-medium">Mode Absence</label>
            <div class="space-y-1.5">
              <label
                v-for="mode in [
                  { key: 'separate_sheet', label: 'Sheet terpisah (tab baru)' },
                  { key: 'same_sheet_separate_table', label: 'Sheet sama, table terpisah' },
                  { key: 'same_sheet_merged', label: 'Sheet sama, table sama (gabung)' },
                ]"
                :key="mode.key"
                class="flex items-center gap-2 p-2 rounded-xl glass hover:bg-white/5 transition-colors cursor-pointer select-none"
                @click="exportForm.absence_mode = mode.key"
              >
                <div
                  :class="[
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                    exportForm.absence_mode === mode.key
                      ? 'border-accent'
                      : 'border-border'
                  ]"
                >
                  <div
                    v-if="exportForm.absence_mode === mode.key"
                    class="w-2 h-2 rounded-full bg-accent"
                  />
                </div>
                <span class="text-sm text-text-primary">{{ mode.label }}</span>
              </label>
            </div>

            <!-- Merged Column Mapping -->
            <div v-if="exportForm.absence_mode === 'same_sheet_merged'" class="space-y-2 mt-2">
              <div>
                <label class="block text-[11px] text-text-tertiary font-medium mb-1">Alasan absence masuk ke kolom</label>
                <select v-model="exportForm.absence_alasan_column" class="form-input text-sm py-2">
                  <option value="">-- Pilih kolom --</option>
                  <option
                    v-for="col in exportColumns.filter(c => c.checked && c.key !== 'tanggal' && c.key !== 'hari')"
                    :key="col.key"
                    :value="col.key"
                  >
                    {{ col.alias || col.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] text-text-tertiary font-medium mb-1">Catatan absence masuk ke kolom</label>
                <select v-model="exportForm.absence_catatan_column" class="form-input text-sm py-2">
                  <option value="">-- Pilih kolom --</option>
                  <option
                    v-for="col in exportColumns.filter(c => c.checked && c.key !== 'tanggal' && c.key !== 'hari')"
                    :key="col.key"
                    :value="col.key"
                  >
                    {{ col.alias || col.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Column Selector -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs text-text-tertiary font-medium">Kolom yang Ditampilkan</label>
              <button @click="resetExportColumns" class="text-[10px] text-accent hover:text-accent-hover transition-colors">Reset default</button>
            </div>
            <div class="space-y-1.5">
              <div
                v-for="(col, index) in exportColumns"
                :key="col.key"
                class="flex items-start gap-2 p-2 rounded-xl glass hover:bg-white/5 transition-colors group"
              >
                <div
                  :class="[
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5',
                    col.checked
                      ? 'bg-accent border-accent'
                      : 'border-border bg-bg-primary/50'
                  ]"
                  @click.stop="toggleExportColumn(index)"
                >
                  <svg
                    v-if="col.checked"
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0 cursor-pointer" @click="toggleExportColumn(index)">
                  <div class="text-sm text-text-primary">{{ col.label }}</div>
                  <input
                    v-if="col.checked"
                    v-model="col.alias"
                    @click.stop
                    type="text"
                    placeholder="Ganti nama kolom..."
                    class="w-full text-[11px] bg-transparent border-b border-white/10 text-text-secondary placeholder-text-tertiary focus:border-accent focus:outline-none mt-0.5 py-0.5 transition-colors"
                    @input="saveExportColumns"
                  />
                </div>
                <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                  <button
                    @click.stop="moveExportColumn(index, -1)"
                    :disabled="index === 0"
                    class="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                    title="Naik"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    @click.stop="moveExportColumn(index, 1)"
                    :disabled="index === exportColumns.length - 1"
                    class="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                    title="Turun"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div>
            <label class="text-xs text-text-tertiary font-medium mb-2 block">Urutan Kolom (Preview)</label>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="col in checkedExportColumns"
                :key="col.key"
                class="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-lg font-medium"
              >
                {{ col.alias || col.label }}
              </span>
              <span v-if="checkedExportColumns.length === 0" class="text-text-tertiary text-xs italic">Belum ada kolom dipilih</span>
            </div>
          </div>

          <div class="flex gap-3 pt-1">
            <button
              @click="closeExport"
              type="button"
              class="flex-1 py-2.5 text-text-secondary text-sm font-medium border border-white/10 rounded-xl hover:bg-white/5 transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              @click="downloadExport"
              :disabled="exporting || checkedExportColumns.length === 0"
              class="flex-1 py-2.5 btn-primary rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              <svg v-if="exporting" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {{ exporting ? 'Menggenerate...' : 'Download Excel' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTimesheetStore } from '../stores/timesheetStore.js'
import { useAuthStore } from '../stores/authStore.js'
import api from '../services/api.js'

const store = useTimesheetStore()
const authStore = useAuthStore()
const loading = computed(() => store.loading)
const entries = computed(() => store.entries)

const userLocations = computed(() => authStore.user?.locations || [])
const userBreakMinutes = computed(() => authStore.user?.defaultBreakMinutes || 0)

const filters = reactive({
  date_from: '',
  date_to: '',
})

const sortOption = ref('date_asc')

const sortedEntries = computed(() => {
  const list = [...entries.value]

  switch (sortOption.value) {
    case 'date_desc':
      return list.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    case 'duration_asc': {
      const durationToMinutes = (durasi) => {
        if (!durasi) return 0
        const match = durasi.match(/(\d+)\s*jam\s*(\d+)/)
        if (match) return parseInt(match[1]) * 60 + parseInt(match[2])
        const hours = durasi.match(/(\d+)\s*jam/)
        return hours ? parseInt(hours[1]) * 60 : 0
      }
      return list.sort((a, b) => durationToMinutes(a.durasi) - durationToMinutes(b.durasi))
    }
    case 'duration_desc': {
      const durationToMinutes = (durasi) => {
        if (!durasi) return 0
        const match = durasi.match(/(\d+)\s*jam\s*(\d+)/)
        if (match) return parseInt(match[1]) * 60 + parseInt(match[2])
        const hours = durasi.match(/(\d+)\s*jam/)
        return hours ? parseInt(hours[1]) * 60 : 0
      }
      return list.sort((a, b) => durationToMinutes(b.durasi) - durationToMinutes(a.durasi))
    }
    case 'location':
      return list.sort((a, b) => (a.lokasi || '').localeCompare(b.lokasi || ''))
    case 'date_asc':
    default:
      return list.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
  }
})

const activeTab = ref('entries')

const showEditModal = ref(false)
const savingEdit = ref(false)
const uploadingEvidence = ref(false)
const editError = ref('')
const editingId = ref(null)
const editingEntry = ref(null)
const editNewFiles = ref([])
const editDragOver = ref(false)

const editForm = reactive({
  tanggal: '',
  jam_mulai: '',
  jam_selesai: '',
  lokasi: '',
  rincian_tugas: '',
})

// Edit modal location state
const editLocOpen = ref(false)
const editLocWrapper = ref(null)
const editSelectedLocation = ref('')
const editCustomLocation = ref('')

const editLocationMode = computed(() => {
  if (userLocations.value.length > 1) return 'select'
  if (userLocations.value.length === 1) return 'single'
  return 'text'
})

const editSelectedLocationLabel = computed(() => {
  if (!editSelectedLocation.value) return 'Pilih lokasi...'
  if (editSelectedLocation.value === '__custom__') return 'Lainnya (ketik manual)...'
  return editSelectedLocation.value
})

const editDurationPreview = computed(() => {
  if (!editForm.jam_mulai || !editForm.jam_selesai) return ''
  const [sh, sm] = editForm.jam_mulai.split(':').map(Number)
  const [eh, em] = editForm.jam_selesai.split(':').map(Number)
  const startMinutes = sh * 60 + sm
  const endMinutes = eh * 60 + em
  let duration = endMinutes - startMinutes - userBreakMinutes.value
  if (endMinutes < startMinutes || duration <= 0) return ''
  const hours = Math.floor(duration / 60)
  const mins = duration % 60
  if (mins === 0) return `${hours} jam`
  return `${hours} jam ${mins} menit`
})

function selectEditLocation(val) {
  editSelectedLocation.value = val
  editLocOpen.value = false
  if (val !== '__custom__') {
    editForm.lokasi = val
    editCustomLocation.value = ''
  } else {
    editForm.lokasi = editCustomLocation.value
  }
}

function onEditLocClickOutside(e) {
  if (editLocWrapper.value && !editLocWrapper.value.contains(e.target)) {
    editLocOpen.value = false
  }
}

watch(editCustomLocation, (val) => {
  if (editSelectedLocation.value === '__custom__') {
    editForm.lokasi = val
  }
})

const showDeleteModal = ref(false)
const deleting = ref(false)
const deleteTargetId = ref(null)
const deletingEvidence = ref(null)

// Toast notifications
const toasts = ref([])
const editTextarea = ref(null)

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

// Export state
const LS_KEY = 'ts_export_cols'
const showExportModal = ref(false)
const exporting = ref(false)
const DEFAULT_EXPORT_COLUMNS = [
  { key: 'tanggal', label: 'Tanggal', checked: true, alias: '' },
  { key: 'hari', label: 'Hari', checked: true, alias: '' },
  { key: 'jam_mulai', label: 'Jam Mulai', checked: true, alias: '' },
  { key: 'jam_selesai', label: 'Jam Selesai', checked: true, alias: '' },
  { key: 'istirahat', label: 'Istirahat (menit)', checked: true, alias: '' },
  { key: 'durasi', label: 'Durasi', checked: true, alias: '' },
  { key: 'lokasi', label: 'Lokasi', checked: true, alias: '' },
  { key: 'aktivitas', label: 'Aktivitas', checked: true, alias: '' },
  { key: 'jumlah_evidence', label: 'Jumlah Evidence', checked: false, alias: '' },
  { key: 'link_evidence', label: 'Link Evidence', checked: false, alias: '' },
]

function loadSavedColumns() {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const validKeys = new Set(DEFAULT_EXPORT_COLUMNS.map(c => c.key))
      const filtered = parsed.filter(c => validKeys.has(c.key))
      if (filtered.length > 0) {
        const ordered = []
        const seen = new Set()
        for (const c of filtered) {
          const def = DEFAULT_EXPORT_COLUMNS.find(d => d.key === c.key)
          if (def) {
            ordered.push({
              ...def,
              checked: !!c.checked,
              alias: (c.alias || '').trim(),
            })
            seen.add(c.key)
          }
        }
        for (const def of DEFAULT_EXPORT_COLUMNS) {
          if (!seen.has(def.key)) ordered.push({ ...def })
        }
        return ordered
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_EXPORT_COLUMNS.map(c => ({ ...c }))
}

const exportColumns = ref(loadSavedColumns())
const exportForm = reactive({
  date_from: '',
  date_to: '',
  include_absence: false,
  absence_mode: 'separate_sheet',
  absence_alasan_column: '',
  absence_catatan_column: '',
})

const checkedExportColumns = computed(() => exportColumns.value.filter(c => c.checked))

function saveExportColumns() {
  try {
    const toSave = exportColumns.value.map(c => ({
      key: c.key,
      checked: c.checked,
      alias: (c.alias || '').trim(),
    }))
    localStorage.setItem(LS_KEY, JSON.stringify(toSave))
  } catch { /* ignore */ }
}

function openExport() {
  exportForm.date_from = filters.date_from
  exportForm.date_to = filters.date_to
  showExportModal.value = true
}

function closeExport() {
  showExportModal.value = false
}

function resetExportColumns() {
  exportColumns.value = DEFAULT_EXPORT_COLUMNS.map(c => ({ ...c }))
  exportForm.absence_mode = 'separate_sheet'
  exportForm.absence_alasan_column = ''
  exportForm.absence_catatan_column = ''
  saveExportColumns()
}

function moveExportColumn(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= exportColumns.value.length) return
  const cols = [...exportColumns.value]
  const [moved] = cols.splice(index, 1)
  cols.splice(newIndex, 0, moved)
  exportColumns.value = cols
  saveExportColumns()
}

function toggleExportColumn(index) {
  exportColumns.value[index].checked = !exportColumns.value[index].checked
  saveExportColumns()
}

async function downloadExport() {
  if (checkedExportColumns.value.length === 0) return
  exporting.value = true
  try {
    const colKeys = exportColumns.value
      .filter(c => c.checked)
      .map(c => c.key)
      .join(',')

    const aliases = {}
    exportColumns.value.forEach(c => {
      if (c.checked && c.alias) aliases[c.key] = c.alias
    })

    const params = {
      date_from: exportForm.date_from || undefined,
      date_to: exportForm.date_to || undefined,
      columns: colKeys,
      include_absence: exportForm.include_absence ? 'true' : undefined,
    }

    if (exportForm.include_absence) {
      params.absence_mode = exportForm.absence_mode
      if (exportForm.absence_mode === 'same_sheet_merged') {
        params.absence_alasan_column = exportForm.absence_alasan_column || undefined
        params.absence_catatan_column = exportForm.absence_catatan_column || undefined
      }
    }

    if (Object.keys(aliases).length > 0) {
      params.column_aliases = JSON.stringify(aliases)
    }

    const response = await api.get('/export/excel', {
      params,
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const contentDisposition = response.headers['content-disposition']
    let filename = 'timesheet_export.xlsx'
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/)
      if (match) filename = match[1]
    }

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)

    showExportModal.value = false
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Gagal mengexport Excel'
    alert(msg)
  } finally {
    exporting.value = false
  }
}

async function openEdit(entry) {
  editingId.value = entry.id
  editError.value = ''
  editNewFiles.value = []
  try {
    const { data } = await store.fetchEntry(entry.id)
    editingEntry.value = data
    editForm.tanggal = data.tanggal
    editForm.jam_mulai = data.jam_mulai
    editForm.jam_selesai = data.jam_selesai
    editForm.lokasi = data.lokasi
    editForm.rincian_tugas = data.rincian_tugas

    if (userLocations.value.length > 1) {
      const matchedLoc = userLocations.value.find(l => l.name === data.lokasi)
      if (matchedLoc) {
        editSelectedLocation.value = matchedLoc.name
      } else {
        editSelectedLocation.value = '__custom__'
        editCustomLocation.value = data.lokasi
      }
    }
  } catch {
    editingEntry.value = entry
    editForm.tanggal = entry.tanggal
    editForm.jam_mulai = entry.jam_mulai
    editForm.jam_selesai = entry.jam_selesai
    editForm.lokasi = entry.lokasi
    editForm.rincian_tugas = entry.rincian_tugas
    if (userLocations.value.length > 1) {
      const matchedLoc = userLocations.value.find(l => l.name === entry.lokasi)
      if (matchedLoc) {
        editSelectedLocation.value = matchedLoc.name
      } else {
        editSelectedLocation.value = '__custom__'
        editCustomLocation.value = entry.lokasi
      }
    }
  }

  showEditModal.value = true
  document.addEventListener('click', onEditLocClickOutside)

  // Auto-resize textarea after modal opens
  nextTick(() => {
    autoResize(editTextarea.value)
  })
}

function closeEdit() {
  showEditModal.value = false
  editingId.value = null
  editingEntry.value = null
  editError.value = ''
  editNewFiles.value = []
  editSelectedLocation.value = ''
  editCustomLocation.value = ''
  document.removeEventListener('click', onEditLocClickOutside)
}

async function deleteEvidenceFile(evidenceId) {
  if (!editingId.value) return
  deletingEvidence.value = evidenceId
  try {
    await store.deleteEvidence(editingId.value, evidenceId)
    const { data } = await store.fetchEntry(editingId.value)
    editingEntry.value = data
  } catch (err) {
    editError.value = err.response?.data?.message || err.message || 'Gagal menghapus evidence'
  } finally {
    deletingEvidence.value = null
  }
}

function handleEditFileSelect(event) {
  const files = Array.from(event.target.files)
  editNewFiles.value.push(...files)
}

function handleEditDrop(event) {
  editDragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  editNewFiles.value.push(...files)
}

function handleEditPasteFiles(event) {
  const clipboardData = event.clipboardData || window.clipboardData
  if (!clipboardData) return
  const files = Array.from(clipboardData.files || [])
  if (files.length > 0) {
    editNewFiles.value.push(...files)
    showToast(`${files.length} file dari clipboard ditambahkan`, 'info', 2000)
  }
}

async function saveEdit() {
  if (!editingId.value) return

  if (editLocationMode.value === 'single' && !editForm.lokasi.trim()) {
    editForm.lokasi = userLocations.value[0]?.name || ''
  }

  savingEdit.value = true
  editError.value = ''
  const currentId = editingId.value
  const filesToUpload = editNewFiles.value.length > 0 ? [...editNewFiles.value] : []

  try {
    const payload = {}
    if (editForm.tanggal) payload.tanggal = editForm.tanggal
    if (editForm.jam_mulai) payload.jam_mulai = editForm.jam_mulai
    if (editForm.jam_selesai) payload.jam_selesai = editForm.jam_selesai
    if (editForm.lokasi !== undefined) payload.lokasi = editForm.lokasi
    if (editForm.rincian_tugas !== undefined) payload.rincian_tugas = editForm.rincian_tugas

    await store.updateEntry(currentId, payload)

    // Close modal immediately after basic data saved
    showEditModal.value = false
    editingId.value = null
    editingEntry.value = null
    editNewFiles.value = []
    showToast('Timesheet berhasil diupdate', 'success')

    // Upload evidence in background
    if (filesToUpload.length > 0) {
      store.addPendingUpload(currentId, filesToUpload)
      showToast(`Upload ${filesToUpload.length} evidence dimulai...`, 'info', 3000)
      // Process uploads asynchronously
      for (const upload of store.pendingUploads.filter(u => u.timesheetId === currentId && u.status === 'pending')) {
        await store.uploadPendingFile(upload.id)
      }
    }
  } catch (err) {
    editError.value = err.response?.data?.message || err.message || 'Gagal mengupdate timesheet'
    showToast(editError.value, 'error', 5000)
  } finally {
    savingEdit.value = false
  }
}

function confirmDelete(entry) {
  deleteTargetId.value = entry.id
  showDeleteModal.value = true
}

async function doDelete() {
  if (!deleteTargetId.value) return
  deleting.value = true
  try {
    await store.deleteEntry(deleteTargetId.value)
    showDeleteModal.value = false
    deleteTargetId.value = null
  } catch (err) {
    showDeleteModal.value = false
    deleteTargetId.value = null
  } finally {
    deleting.value = false
  }
}

function applyFilters() {
  const params = {}
  if (filters.date_from) params.date_from = filters.date_from
  if (filters.date_to) params.date_to = filters.date_to
  store.fetchEntries(params)
}

function resetFilters() {
  filters.date_from = ''
  filters.date_to = ''
  store.fetchEntries()
}

function formatMonthYear(dateStr) {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${months[parseInt(month) - 1]} ${year}`
}

function formatMonthYearFromDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

function computeDefaultPeriod(period, customConfig) {
  const today = new Date()
  const pad = n => String(n).padStart(2, '0')
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  if (period === 'all' || !period) return { from: '', to: '' }

  if (period === 'custom') {
    if (!customConfig) return { from: '', to: '' }
    const { fromDay, fromMonthOffset, toDay, toMonthOffset } = customConfig
    const fromDate = new Date(today.getFullYear(), today.getMonth() + (fromMonthOffset || 0), fromDay || 1)
    const toDate = new Date(today.getFullYear(), today.getMonth() + (toMonthOffset || 0), toDay || 1)
    return { from: fmt(fromDate), to: fmt(toDate) }
  }

  if (period === 'current_month') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1)
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { from: fmt(from), to: fmt(to) }
  }

  if (period === 'current_week') {
    const day = today.getDay()
    const diff = (day === 0 ? -6 : 1 - day)
    const from = new Date(today)
    from.setDate(today.getDate() + diff)
    const to = new Date(from)
    to.setDate(from.getDate() + 6)
    return { from: fmt(from), to: fmt(to) }
  }

  if (period === 'last_7_days') {
    const from = new Date(today)
    from.setDate(today.getDate() - 6)
    return { from: fmt(from), to: fmt(today) }
  }

  if (period === 'last_30_days') {
    const from = new Date(today)
    from.setDate(today.getDate() - 29)
    return { from: fmt(from), to: fmt(today) }
  }

  if (period === 'last_month') {
    const from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const to = new Date(today.getFullYear(), today.getMonth(), 0)
    return { from: fmt(from), to: fmt(to) }
  }

  return { from: '', to: '' }
}

function applyDefaultPeriod() {
  const period = authStore.user?.defaultHistoryPeriod || 'current_month'
  const { from, to } = computeDefaultPeriod(
    period,
    authStore.user?.defaultHistoryCustom,
  )
  filters.date_from = from
  filters.date_to = to

  const params = {}
  if (from) params.date_from = from
  if (to) params.date_to = to
  store.fetchEntries(params)
}

onMounted(() => {
  applyDefaultPeriod()
  fetchAbsenceEntries()
})

watch(
  () => authStore.user?.defaultHistoryPeriod,
  () => {
    applyDefaultPeriod()
  }
)

onUnmounted(() => {
  document.removeEventListener('click', onEditLocClickOutside)
})

// Absence
const showAbsenceModal = ref(false)
const savingAbsence = ref(false)
const absenceForm = reactive({
  entry_date: '',
  reason_id: '',
  notes: '',
})
const absenceEntries = ref([])
const absenceReasonOptions = ref([])
const absenceHolidayInfo = ref(null)

async function fetchAbsenceEntries() {
  try {
    const { data } = await api.get('/absence')
    const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    absenceEntries.value = (data.data || []).map(e => {
      const d = new Date(e.entryDate + 'T00:00:00')
      return {
        ...e,
        hari: hariList[d.getDay()],
        tanggalDisplay: `${d.getDate()}`,
        tanggalFull: `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`,
      }
    })
  } catch { /* ignore */ }
}

async function fetchAbsenceReasons() {
  try {
    const { data } = await api.get('/absence-reasons')
    absenceReasonOptions.value = data.data || []
  } catch { /* ignore */ }
}

async function openMarkAbsence() {
  absenceForm.entry_date = new Date().toISOString().split('T')[0]
  absenceForm.reason_id = ''
  absenceForm.notes = ''
  absenceHolidayInfo.value = null
  await fetchAbsenceReasons()
  showAbsenceModal.value = true
}

function closeAbsenceModal() {
  showAbsenceModal.value = false
}

async function saveAbsence() {
  savingAbsence.value = true
  try {
    await api.post('/absence', {
      entry_date: absenceForm.entry_date,
      reason_id: absenceForm.reason_id,
      notes: absenceForm.notes,
    })
    showAbsenceModal.value = false
    showToast('Berhasil ditandai tidak masuk', 'success')
    await fetchAbsenceEntries()
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal menyimpan', 'error')
  } finally {
    savingAbsence.value = false
  }
}

async function deleteAbsenceEntry(id) {
  try {
    await api.delete(`/absence/${id}`)
    absenceEntries.value = absenceEntries.value.filter(e => e.id !== id)
    showToast('Berhasil dihapus', 'success')
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal menghapus', 'error')
  }
}
</script>
