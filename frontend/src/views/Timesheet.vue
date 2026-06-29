<template>
  <div class="max-w-7xl mx-auto px-4 md:px-8">
    <div class="mb-5 md:mb-8">
      <h1
        class="text-xl md:text-2xl font-bold text-text-primary tracking-tight"
      >
        Input Timesheet
      </h1>
      <p class="text-text-tertiary text-sm mt-0.5 md:text-base">
        Catat aktivitas kerja Anda
      </p>
    </div>

    <!-- Upload Notifications -->
    <div v-if="pendingUploads.length > 0" class="mb-5 md:mb-8 space-y-2.5">
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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
      <div class="lg:col-span-2">
        <div class="glass rounded-2xl p-5 md:p-8 glow-orange">
      <form @submit.prevent="saveNow" class="space-y-4 md:space-y-5">
        <div>
          <label
            class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2"
            >Tanggal</label
          >
          <DatePicker v-model="form.tanggal" />
        </div>

        <div class="grid grid-cols-2 gap-3 md:gap-4">
          <div>
            <label
              class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2"
              >Jam Mulai</label
            >
            <input
              v-model="form.jam_mulai"
              type="time"
              required
              class="form-input"
            />
            <p
              v-if="settings.defaultStartTime"
              class="text-text-tertiary text-[10px] md:text-xs mt-1 leading-snug"
            >
              Default dari Settings: {{ settings.defaultStartTime }}
            </p>
          </div>
          <div>
            <label
              class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2"
              >Jam Selesai</label
            >
            <input
              v-model="form.jam_selesai"
              type="time"
              required
              class="form-input"
            />
            <p
              v-if="settings.defaultEndTime"
              class="text-text-tertiary text-[10px] md:text-xs mt-1 leading-snug"
            >
              Default dari Settings: {{ settings.defaultEndTime }}
            </p>
          </div>
        </div>
        <div v-if="durationPreview" class="flex items-center gap-2">
          <span class="text-accent text-xs md:text-sm font-medium">{{
            durationPreview
          }}</span>
          <span
            v-if="settings.defaultBreakMinutes > 0"
            class="text-text-tertiary text-[10px] md:text-xs"
          >
            (termasuk istirahat {{ settings.defaultBreakMinutes }} menit)
          </span>
        </div>
        <p
          v-if="!settings.defaultStartTime && !settings.defaultEndTime"
          class="text-text-tertiary text-[10px] md:text-xs -mt-2 leading-snug"
        >
          Tip: Set jam default di
          <router-link
            to="/settings"
            class="text-accent underline hover:text-accent-hover transition-colors"
            >Settings</router-link
          >
          agar otomatis terisi.
        </p>

        <!-- Location: dynamic based on settings -->
        <div>
          <label
            class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2"
            >Lokasi</label
          >

          <template v-if="locationMode === 'select'">
            <Select
              :model-value="selectedLocation"
              :options="locationOptions"
              placeholder="Pilih lokasi..."
              @update:model-value="selectLocation"
            />
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
              :placeholder="
                locationMode === 'single'
                  ? settings.locations[0]?.name
                  : 'Contoh: Kantor Pusat - Jakarta'
              "
              class="form-input"
            />
          </template>

          <p
            v-if="settings.locations.length === 0"
            class="text-text-tertiary text-[10px] md:text-xs mt-1 leading-snug"
          >
            Tip: Tambahkan daftar lokasi di
            <router-link
              to="/settings"
              class="text-accent underline hover:text-accent-hover transition-colors"
              >Settings</router-link
            >
            untuk kemudahan input.
          </p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1.5 md:mb-2">
            <label
              class="block text-xs md:text-sm font-medium text-text-secondary"
              >Task</label
            >
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="showBulk = !showBulk"
                class="inline-flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Paste daftar
              </button>
              <button
                type="button"
                @click="addTask"
                class="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors px-2 py-1 rounded-lg hover:bg-accent/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Task
              </button>
            </div>
          </div>

          <!-- Bulk paste -->
          <div v-if="showBulk" class="mb-3 glass rounded-xl p-3 space-y-2">
            <textarea
              v-model="bulkText"
              rows="4"
              placeholder="Tempel daftar task, satu per baris:&#10;HRSS-11   Menambah endpoint divisions&#10;HRSS-12   Menambahkan endpoint chart"
              class="form-input resize-y text-sm font-mono"
            ></textarea>
            <div class="flex justify-end gap-2">
              <button
                type="button"
                @click="showBulk = false; bulkText = ''"
                class="text-xs px-3 py-1.5 rounded-lg text-text-tertiary hover:bg-white/5"
              >
                Batal
              </button>
              <button
                type="button"
                @click="addBulk"
                class="text-xs px-3 py-1.5 rounded-lg bg-accent/15 text-accent font-medium hover:bg-accent/25"
              >
                Tambahkan
              </button>
            </div>
          </div>

          <!-- Task rows -->
          <div v-if="form.tasks.length" class="space-y-2.5">
            <div
              v-for="(task, i) in form.tasks"
              :key="i"
              class="rounded-xl p-3 bg-white/[0.02] border border-white/[0.08] space-y-2"
            >
              <div class="flex items-center gap-2">
                <input
                  v-model="task.code"
                  type="text"
                  placeholder="KODE"
                  class="form-input text-sm flex-shrink-0 uppercase"
                  style="width: 7rem; text-transform: uppercase"
                />
                <input
                  v-model="task.title"
                  type="text"
                  placeholder="Judul task..."
                  class="form-input text-sm flex-1 min-w-0"
                />
                <button
                  type="button"
                  @click="removeTask(i)"
                  class="p-2 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg flex-shrink-0 transition-all active:scale-90"
                  aria-label="Hapus task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div class="flex items-center gap-3">
                <Select
                  v-model="task.status"
                  :options="statusOptions"
                  class="flex-shrink-0"
                  style="width: auto; min-width: 9rem"
                />
                <button
                  type="button"
                  @click="addNote(task)"
                  class="inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-accent border border-white/10 hover:border-accent/40 transition-colors px-2.5 py-1 rounded-lg hover:bg-accent/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Catatan
                </button>
              </div>
              <div
                v-for="(note, ni) in task.notes"
                :key="ni"
                class="flex items-center gap-2 pl-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <input
                  v-model="task.notes[ni]"
                  type="text"
                  placeholder="Catatan tambahan (link, email)..."
                  class="form-input text-sm py-1.5 flex-1 min-w-0"
                />
                <button
                  type="button"
                  @click="removeNote(task, ni)"
                  class="p-1.5 text-text-tertiary hover:text-danger rounded-lg flex-shrink-0"
                  aria-label="Hapus catatan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div
            v-else
            class="border-2 border-dashed border-white/10 rounded-xl p-5 text-center"
          >
            <p class="text-text-tertiary text-sm">Belum ada task</p>
            <p class="text-text-tertiary text-xs mt-0.5">
              Klik <span class="text-accent">+ Task</span> atau
              <span class="text-accent">Paste daftar</span>
            </p>
          </div>

          <!-- Copy report -->
          <div v-if="form.tasks.length" class="grid grid-cols-2 gap-2.5 mt-3">
            <button
              type="button"
              @click="copyReport('standup')"
              class="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-white/[0.03] border border-white/10 hover:border-accent/40 text-text-secondary hover:text-accent transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Kopi Standup
            </button>
            <button
              type="button"
              @click="copyReport('wrapup')"
              class="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-white/[0.03] border border-white/10 hover:border-accent/40 text-text-secondary hover:text-accent transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Kopi Wrap Up
            </button>
          </div>
        </div>

        <!-- Evidence Files -->
        <div>
          <label
            class="block text-xs md:text-sm font-medium text-text-secondary mb-1.5 md:mb-2"
            >Evidence (Opsional)</label
          >

          <div v-if="existingEvidence.length > 0" class="mb-2.5 space-y-2">
            <a
              v-for="ev in existingEvidence"
              :key="ev.id"
              :href="ev.google_drive_url"
              target="_blank"
              rel="noopener"
              class="flex items-center justify-between p-2.5 glass rounded-xl hover:border-accent/40 transition-colors"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-success flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div class="min-w-0">
                  <p class="text-sm text-text-primary truncate">
                    {{ ev.file_name }}
                  </p>
                  <p class="text-xs text-text-tertiary">
                    {{ ev.file_size ? formatFileSize(ev.file_size) : "Tersimpan" }}
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-text-tertiary flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>

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
            @mouseenter="onDropZoneMouseEnter"
            @mouseleave="onDropZoneMouseLeave"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-7 h-7 mx-auto text-text-tertiary mb-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p class="text-text-secondary text-sm">
              Klik, drag, atau paste file di sini
            </p>
            <p class="text-text-tertiary text-xs mt-0.5">
              PDF, Gambar, Dokumen (Max 50MB)
            </p>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-accent flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div class="min-w-0">
                  <p class="text-sm text-text-primary truncate">
                    {{ file.name }}
                  </p>
                  <p class="text-xs text-text-tertiary">
                    {{ formatFileSize(file.size) }}
                  </p>
                </div>
              </div>
              <button
                @click="removeFile(index)"
                type="button"
                class="p-1 text-danger hover:bg-danger/10 rounded-lg flex-shrink-0 transition-all active:scale-90"
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
          </div>
        </div>

        <div
          v-if="error"
          class="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm"
        >
          {{ error }}
        </div>

        <!-- Auto-save status -->
        <div class="flex items-center justify-center gap-2 py-1 text-sm" aria-live="polite">
          <template v-if="submitting">
            <svg class="w-4 h-4 animate-spin text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-text-tertiary">Menyimpan...</span>
          </template>
          <template v-else-if="saveState === 'saved'">
            <svg class="w-4 h-4 text-success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-success">Tersimpan otomatis</span>
          </template>
          <template v-else-if="!canSave">
            <span class="text-text-tertiary text-xs text-center leading-snug">
              Lengkapi jam, lokasi &amp; minimal 1 task agar tersimpan otomatis
            </span>
          </template>
          <template v-else>
            <svg class="w-4 h-4 text-text-tertiary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-text-tertiary">Perubahan disimpan otomatis</span>
          </template>
        </div>
      </form>
        </div>
      </div>

      <!-- Preview Column -->
      <div class="hidden lg:block lg:col-span-1">
        <div class="sticky top-5">
          <div class="glass rounded-2xl p-5">
            <h2 class="text-sm font-semibold text-text-primary mb-4">Preview</h2>

            <!-- Date Badge -->
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-accent/10 flex flex-col items-center justify-center flex-shrink-0">
                <span class="text-accent text-[10px] font-bold uppercase leading-none">{{ previewDay }}</span>
                <span class="text-text-primary font-bold text-sm leading-tight">{{ previewDate }}</span>
                <span class="text-text-tertiary text-[8px] leading-none mt-0.5">{{ previewMonth }}</span>
              </div>
              <div v-if="durationPreview" class="text-right">
                <span class="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">{{ durationPreview }}</span>
              </div>
            </div>

            <!-- Time & Location -->
            <div class="space-y-2 mb-4">
              <div v-if="form.jam_mulai && form.jam_selesai" class="text-sm">
                <p class="text-text-tertiary text-xs mb-0.5">Waktu Kerja</p>
                <p class="text-text-secondary font-mono text-sm">{{ form.jam_mulai }} - {{ form.jam_selesai }}</p>
              </div>
              <div v-if="previewLocation" class="text-sm">
                <p class="text-text-tertiary text-xs mb-0.5">Lokasi</p>
                <p class="text-text-primary font-medium truncate">{{ previewLocation }}</p>
              </div>
            </div>

            <!-- Tasks -->
            <div v-if="form.tasks.length" class="text-text-tertiary text-xs space-y-0.5 mb-4">
              <p class="text-text-tertiary text-[10px] font-medium mb-2">Task ({{ form.tasks.length }})</p>
              <p v-for="(line, idx) in previewTasks" :key="idx" class="line-clamp-1">
                {{ line }}
              </p>
            </div>

            <!-- Evidence Count -->
            <div v-if="selectedFiles.length > 0" class="pt-3 border-t border-white/5">
              <p class="text-text-tertiary text-xs mb-2">Evidence</p>
              <p class="text-accent text-sm font-medium">{{ selectedFiles.length }} file</p>
            </div>

            <!-- Empty State -->
            <div v-if="!form.jam_mulai && !form.jam_selesai && !form.tasks.length" class="text-center py-6">
              <p class="text-text-tertiary text-xs">Isi form untuk melihat preview</p>
            </div>
          </div>
        </div>
      </div>
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
          <svg
            v-if="toast.type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 text-success flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg
            v-else-if="toast.type === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 text-danger flex-shrink-0"
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
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 text-accent flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-sm text-text-primary">{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import {
  reactive,
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from "vue";
import { useRouter } from "vue-router";
import { useTimesheetStore } from "../stores/timesheetStore.js";
import { useAuthStore } from "../stores/authStore.js";
import api from "../services/api.js";
import {
  DEFAULT_REPORT_CONFIG,
  makeTask,
  textToTasks,
  tasksToText,
  renderStandup,
  renderWrapup,
} from "../utils/report.js";
import DatePicker from "../components/Common/DatePicker.vue";
import Select from "../components/Common/Select.vue";

const router = useRouter();
const store = useTimesheetStore();
const authStore = useAuthStore();
const submitting = ref(false);
const error = ref(null);
const selectedFiles = ref([]);
const dragOver = ref(false);
const selectedLocation = ref("");
const customLocation = ref("");
const showBulk = ref(false);
const bulkText = ref("");

const reportCfg = computed(
  () => authStore.user?.reportConfig || DEFAULT_REPORT_CONFIG,
);
const statuses = computed(() => reportCfg.value.wrapup?.statuses || []);
const defaultStatus = computed(
  () => reportCfg.value.wrapup?.defaultStatus || statuses.value[0]?.id || "",
);
const statusOptions = computed(() =>
  statuses.value.map((s) => ({ value: s.id, label: s.label })),
);
const locationOptions = computed(() => [
  ...settings.locations.map((l) => ({ value: l.name, label: l.name })),
  { value: "__custom__", label: "Lainnya (ketik manual)..." },
]);

function addTask() {
  form.tasks.push(makeTask({ status: defaultStatus.value }));
}

function removeTask(i) {
  form.tasks.splice(i, 1);
}

function addNote(task) {
  if (!task.notes) task.notes = [];
  task.notes.push("");
}

function removeNote(task, ni) {
  task.notes.splice(ni, 1);
}

function addBulk() {
  const parsed = textToTasks(bulkText.value).map((t) => ({
    ...t,
    status: defaultStatus.value,
  }));
  if (parsed.length) form.tasks.push(...parsed);
  bulkText.value = "";
  showBulk.value = false;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

async function copyReport(type) {
  const text =
    type === "standup"
      ? renderStandup(form.tasks, reportCfg.value)
      : renderWrapup(form.tasks, reportCfg.value);
  const ok = await copyText(text);
  const label = type === "standup" ? "standup" : "wrap up";
  showToast(
    ok ? `Laporan ${label} disalin ke clipboard` : "Gagal menyalin laporan",
    ok ? "success" : "error",
    2500,
  );
}

// Toast notifications
const toasts = ref([]);

// Evidence upload queue
const pendingUploads = computed(() => store.pendingUploads);
watch(
  pendingUploads,
  async (uploads) => {
    for (const upload of uploads) {
      if (upload.status === "pending") {
        await store.uploadPendingFile(upload.id);
      }
    }
  },
  { deep: true, immediate: true },
);

function showToast(message, type = "success", duration = 4000) {
  const id = Date.now() + Math.random();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
}

function selectLocation(val) {
  selectedLocation.value = val;
  if (val !== "__custom__") {
    form.lokasi = val;
    customLocation.value = "";
  } else {
    form.lokasi = "";
  }
}

const settings = reactive({
  defaultStartTime: "",
  defaultEndTime: "",
  defaultBreakMinutes: 0,
  locations: [],
});

const locationMode = computed(() => {
  if (settings.locations.length > 1) return "select";
  if (settings.locations.length === 1) return "single";
  return "text";
});

const durationPreview = computed(() => {
  if (!form.jam_mulai || !form.jam_selesai) return "";
  const [sh, sm] = form.jam_mulai.split(":").map(Number);
  const [eh, em] = form.jam_selesai.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  let duration = endMinutes - startMinutes - settings.defaultBreakMinutes;
  if (endMinutes < startMinutes || duration <= 0) return "";
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  if (mins === 0) return `${hours} jam`;
  return `${hours} jam ${mins} menit`;
});

const previewDay = computed(() => {
  if (!form.tanggal) return "";
  const date = new Date(form.tanggal + "T00:00:00");
  const days = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  return days[date.getDay()];
});

const previewDate = computed(() => {
  if (!form.tanggal) return "";
  const date = new Date(form.tanggal + "T00:00:00");
  return String(date.getDate()).padStart(2, "0");
});

const previewMonth = computed(() => {
  if (!form.tanggal) return "";
  const date = new Date(form.tanggal + "T00:00:00");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[date.getMonth()];
});

const previewLocation = computed(() => {
  if (selectedLocation.value === "__custom__") {
    return customLocation.value;
  }
  return form.lokasi;
});

const previewTasks = computed(() =>
  form.tasks
    .filter((t) => t.code || t.title)
    .slice(0, 5)
    .map((t) => (t.code ? `[${t.code}] ${t.title}` : t.title)),
);

const form = reactive({
  tanggal: new Date().toISOString().split("T")[0],
  jam_mulai: "",
  jam_selesai: "",
  lokasi: "",
  tasks: [],
});

watch(customLocation, (val) => {
  if (selectedLocation.value === "__custom__") {
    form.lokasi = val;
  }
});

// ---- Auto-save ----
const saveState = ref("idle"); // idle | saving | saved | error
let suppressSave = false;
let saveTimer = null;

const cleanTasks = computed(() =>
  form.tasks
    .filter((t) => t.code || t.title)
    .map((t) => ({
      code: (t.code || "").trim(),
      title: (t.title || "").trim(),
      status: t.status,
      notes: (t.notes || []).map((n) => n.trim()).filter(Boolean),
    })),
);

const validTimes = computed(() => {
  if (!form.jam_mulai || !form.jam_selesai) return false;
  const [sh, sm] = form.jam_mulai.split(":").map(Number);
  const [eh, em] = form.jam_selesai.split(":").map(Number);
  return eh * 60 + em > sh * 60 + sm;
});

const effectiveLokasi = computed(() => {
  if (form.lokasi?.trim()) return form.lokasi.trim();
  if (locationMode.value === "single") return settings.locations[0]?.name || "";
  return "";
});

const canSave = computed(
  () => validTimes.value && !!effectiveLokasi.value && cleanTasks.value.length > 0,
);

function scheduleSave() {
  if (suppressSave) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 900);
}

async function saveNow() {
  if (suppressSave || !canSave.value) return;
  if (submitting.value) {
    scheduleSave();
    return;
  }
  submitting.value = true;
  saveState.value = "saving";
  try {
    const tasks = cleanTasks.value;
    const payload = {
      tanggal: form.tanggal,
      jam_mulai: form.jam_mulai,
      jam_selesai: form.jam_selesai,
      lokasi: effectiveLokasi.value,
      rincian_tugas: tasksToText(tasks),
      tasks,
    };
    const response = loadedEntryId.value
      ? await store.updateEntry(loadedEntryId.value, payload)
      : await store.createEntry(payload);
    loadedEntryId.value = response.data?.id || loadedEntryId.value;
    if (selectedFiles.value.length && loadedEntryId.value) {
      store.addPendingUpload(loadedEntryId.value, selectedFiles.value);
      selectedFiles.value = [];
    }
    error.value = null;
    saveState.value = "saved";
  } catch (err) {
    error.value =
      err.response?.data?.message || err.message || "Gagal menyimpan timesheet";
    saveState.value = "error";
  } finally {
    submitting.value = false;
  }
}

watch(
  () => [form.jam_mulai, form.jam_selesai, form.lokasi, form.tasks],
  scheduleSave,
  { deep: true },
);
watch(selectedFiles, scheduleSave, { deep: true });

function setLocation(lokasi) {
  if (!lokasi) return;
  form.lokasi = lokasi;
  if (locationMode.value === "select") {
    const known = settings.locations.find((l) => l.name === lokasi);
    if (known) {
      selectedLocation.value = lokasi;
      customLocation.value = "";
    } else {
      selectedLocation.value = "__custom__";
      customLocation.value = lokasi;
    }
  }
}

let skipDateLoad = false;
const loadedEntryId = ref(null);
const existingEvidence = ref([]);

async function loadEntryForDate(date) {
  if (!date) return;
  suppressSave = true;
  clearTimeout(saveTimer);
  loadedEntryId.value = null;
  existingEvidence.value = [];
  try {
    const res = await store.fetchEntries({
      date_from: date,
      date_to: date,
      limit: 1,
    });
    const entry = res.data?.[0];
    if (entry) {
      loadedEntryId.value = entry.id;
      existingEvidence.value = entry.evidence || [];
      form.jam_mulai = entry.jam_mulai || settings.defaultStartTime || "";
      form.jam_selesai = entry.jam_selesai || settings.defaultEndTime || "";
      form.tasks =
        entry.tasks?.length > 0
          ? entry.tasks.map((t) => ({ ...makeTask(), ...t }))
          : textToTasks(entry.rincian_tugas).map((t) => ({
              ...t,
              status: defaultStatus.value,
            }));
      setLocation(entry.lokasi);
    } else {
      form.jam_mulai = settings.defaultStartTime || "";
      form.jam_selesai = settings.defaultEndTime || "";
      form.tasks = [];
    }
  } catch {
    // ignore
  } finally {
    saveState.value = loadedEntryId.value ? "saved" : "idle";
    await nextTick();
    suppressSave = false;
  }
}

watch(
  () => form.tanggal,
  (date) => {
    if (skipDateLoad) {
      skipDateLoad = false;
      return;
    }
    loadEntryForDate(date);
  },
);

function applySettings() {
  const user = authStore.user;
  if (!user) return;

  settings.defaultStartTime = user.defaultStartTime || "";
  settings.defaultEndTime = user.defaultEndTime || "";
  settings.defaultBreakMinutes = user.defaultBreakMinutes || 0;
  settings.locations = (user.locations || []).map((l) => ({ ...l }));

  if (settings.defaultStartTime) {
    form.jam_mulai = settings.defaultStartTime;
  }
  if (settings.defaultEndTime) {
    form.jam_selesai = settings.defaultEndTime;
  }

  if (settings.locations.length === 1) {
    form.lokasi = settings.locations[0].name;
  } else if (settings.locations.length > 1) {
    const defaultLoc = settings.locations.find((l) => l.isDefault);
    if (defaultLoc) {
      selectedLocation.value = defaultLoc.name;
      form.lokasi = defaultLoc.name;
    }
  }
}

onMounted(async () => {
  suppressSave = true;
  if (authStore.user) {
    applySettings();
  } else {
    try {
      await authStore.fetchUser();
      applySettings();
    } catch {
      // ignore
    }
  }
  await loadEntryForDate(form.tanggal);
});

onUnmounted(() => {
  document.removeEventListener("paste", handleGlobalPasteFiles);
});

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  selectedFiles.value.push(...files);
}

function handleDrop(event) {
  dragOver.value = false;
  const files = Array.from(event.dataTransfer.files);
  selectedFiles.value.push(...files);
}

function handlePasteFiles(event) {
  const clipboardData = event.clipboardData || window.clipboardData;
  if (!clipboardData) return;
  const files = Array.from(clipboardData.files || []);
  if (files.length > 0) {
    selectedFiles.value.push(...files);
    showToast(`${files.length} file dari clipboard ditambahkan`, "info", 2000);
  }
}

function handleGlobalPasteFiles(event) {
  // Don't hijack paste while editing a text field (task code/title/notes, bulk box).
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  event.preventDefault();
  handlePasteFiles(event);
}

function onDropZoneMouseEnter() {
  document.addEventListener("paste", handleGlobalPasteFiles);
}

function onDropZoneMouseLeave() {
  document.removeEventListener("paste", handleGlobalPasteFiles);
}

function removeFile(index) {
  selectedFiles.value.splice(index, 1);
}

</script>
