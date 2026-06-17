<template>
  <div class="space-y-5 md:space-y-0 md:grid md:grid-cols-12 md:gap-6">
    <!-- Left Column: Profile + Quick Info -->
    <div class="md:col-span-4 lg:col-span-3 space-y-5">
      <!-- Profile Card -->
      <div class="glass glass-hover rounded-2xl p-5 md:p-6 text-center">
        <div class="relative inline-block mb-3">
          <img
            v-if="authStore.user?.avatar && !settingsAvatarError"
            :src="authStore.user.avatar"
            :alt="authStore.user.name"
            class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover mx-auto ring-4 ring-accent/20"
            @error="settingsAvatarError = true"
          />
          <div
            v-if="!authStore.user?.avatar || settingsAvatarError"
            class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto ring-4 ring-accent/20"
          >
            <span class="text-accent font-bold text-2xl md:text-3xl">{{
              (authStore.user?.name || "?")[0]?.toUpperCase()
            }}</span>
          </div>
          <div
            class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-2 border-bg-primary flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <p class="font-bold text-text-primary text-lg">
          {{ authStore.user?.name }}
        </p>
        <p class="text-text-tertiary text-xs mt-0.5 truncate">
          {{ authStore.user?.email }}
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="glass rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-text-tertiary text-xs font-medium">Timezone</span>
          <span class="text-text-primary text-xs font-medium">{{
            form.timezone || "Asia/Jakarta"
          }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-text-tertiary text-xs font-medium"
            >Lokasi tersimpan</span
          >
          <span class="text-accent text-xs font-medium">{{
            form.locations.length
          }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-text-tertiary text-xs font-medium"
            >Member sejak</span
          >
          <span class="text-text-primary text-xs font-medium">{{
            memberSince
          }}</span>
        </div>
      </div>
    </div>

    <!-- Right Column: Settings -->
    <div class="md:col-span-8 lg:col-span-9 space-y-5">
      <div class="mb-2 md:mb-4">
        <h1
          class="text-xl md:text-2xl font-bold text-text-primary tracking-tight"
        >
          Settings
        </h1>
        <p class="text-text-tertiary text-sm mt-0.5">Profil & konfigurasi</p>
      </div>

      <!-- Sub Navigation Tabs -->
      <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="tab in settingTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'px-4 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all',
            activeTab === tab.key
              ? 'bg-accent/15 text-accent'
              : 'text-text-tertiary hover:text-text-primary hover:bg-white/5',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab: Umum & Preferensi -->
      <div v-if="activeTab === 'umum' || activeTab === 'preferensi'" class="space-y-5">
        <!-- Profile Edit -->
        <div v-if="activeTab === 'umum'" class="glass rounded-2xl p-5 md:p-6">
          <h2
            class="text-sm md:text-base font-semibold text-text-primary mb-4 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profil
          </h2>
          <div class="space-y-3.5 md:space-y-4 md:grid md:grid-cols-2 md:gap-4">
            <div class="md:col-span-2">
              <label
                class="block text-xs font-medium text-text-secondary mb-1.5"
                >Nama</label
              >
              <input v-model="form.name" type="text" class="form-input" />
            </div>
            <div class="relative" ref="tzWrapper">
              <label
                class="block text-xs font-medium text-text-secondary mb-1.5"
                >Timezone</label
              >
              <button
                type="button"
                @click="tzOpen = !tzOpen"
                class="form-input text-left flex items-center justify-between"
              >
                <span>{{ selectedTzLabel }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-text-tertiary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                v-if="tzOpen"
                class="absolute z-30 top-full left-0 right-0 mt-1 glass-strong rounded-xl shadow-2xl overflow-hidden"
              >
                <div class="p-2">
                  <input
                    v-model="tzSearch"
                    type="text"
                    placeholder="Cari timezone..."
                    class="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    @click.stop
                  />
                </div>
                <div class="max-h-40 overflow-y-auto">
                  <button
                    v-for="tz in filteredTimezones"
                    :key="tz.value"
                    type="button"
                    @click="selectTz(tz.value)"
                    :class="[
                      'w-full px-3.5 py-2.5 text-left text-sm transition-colors',
                      form.timezone === tz.value
                        ? 'bg-accent/15 text-accent font-medium'
                        : 'text-text-secondary hover:bg-white/5',
                    ]"
                  >
                    {{ tz.label }}
                  </button>
                  <p
                    v-if="filteredTimezones.length === 0"
                    class="px-3.5 py-2.5 text-text-tertiary text-sm"
                  >
                    Tidak ditemukan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Default History Period -->
        <div v-if="activeTab === 'preferensi'" class="glass rounded-2xl p-5 md:p-6">
          <h2
            class="text-sm md:text-base font-semibold text-text-primary mb-4 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Filter Periode Default Riwayat
          </h2>
          <p class="text-text-tertiary text-xs mb-4 leading-relaxed">
            Periode yang otomatis terpilih saat membuka halaman Riwayat.
          </p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              v-for="opt in historyPeriodOptions"
              :key="opt.value"
              type="button"
              @click="form.defaultHistoryPeriod = opt.value"
              :class="[
                'px-3 py-2.5 rounded-xl text-xs font-medium border transition-all',
                form.defaultHistoryPeriod === opt.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-white/10 text-text-secondary hover:bg-white/5',
              ]"
            >
              {{ opt.label }}
            </button>
          </div>
          <div
            v-if="form.defaultHistoryPeriod === 'custom'"
            class="mt-3 space-y-3"
          >
            <p class="text-text-tertiary text-[10px] leading-relaxed">
              Tentukan hari dan bulan relatif. Filter akan otomatis menyesuaikan setiap bulan.
              Contoh: tanggal 20 bulan lalu s/d tanggal 21 bulan ini.
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-text-secondary mb-1.5">Dari — Tanggal</label>
                <input
                  v-model.number="form.defaultHistoryCustom.fromDay"
                  type="number"
                  min="1"
                  max="31"
                  class="form-input"
                  placeholder="1–31"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-text-secondary mb-1.5">Dari — Bulan</label>
                <select v-model.number="form.defaultHistoryCustom.fromMonthOffset" class="form-input">
                  <option v-for="opt in monthOffsetOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-text-secondary mb-1.5">Sampai — Tanggal</label>
                <input
                  v-model.number="form.defaultHistoryCustom.toDay"
                  type="number"
                  min="1"
                  max="31"
                  class="form-input"
                  placeholder="1–31"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-text-secondary mb-1.5">Sampai — Bulan</label>
                <select v-model.number="form.defaultHistoryCustom.toMonthOffset" class="form-input">
                  <option v-for="opt in monthOffsetOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
            </div>
            <p v-if="customPeriodPreview" class="text-accent text-xs font-medium">
              Preview: {{ customPeriodPreview }}
            </p>
          </div>
        </div>

        <!-- Default Times -->
        <div v-if="activeTab === 'preferensi'" class="glass rounded-2xl p-5 md:p-6">
          <h2
            class="text-sm md:text-base font-semibold text-text-primary mb-4 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Jam Default Timesheet
          </h2>
          <p class="text-text-tertiary text-xs mb-4 leading-relaxed">
            Set jam mulai, selesai, dan istirahat default yang akan otomatis
            terisi saat membuat entri timesheet baru.
          </p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label
                class="block text-xs font-medium text-text-secondary mb-1.5"
                >Jam Mulai</label
              >
              <input
                v-model="form.defaultStartTime"
                type="time"
                class="form-input"
              />
            </div>
            <div>
              <label
                class="block text-xs font-medium text-text-secondary mb-1.5"
                >Jam Selesai</label
              >
              <input
                v-model="form.defaultEndTime"
                type="time"
                class="form-input"
              />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label
                class="block text-xs font-medium text-text-secondary mb-1.5"
                >Istirahat (menit)</label
              >
              <input
                v-model.number="form.defaultBreakMinutes"
                type="number"
                min="0"
                max="480"
                step="5"
                class="form-input"
              />
            </div>
          </div>
          <p
            class="text-text-tertiary text-[10px] md:text-xs mt-3 leading-snug"
          >
            Durasi kerja akan dikurangi dengan waktu istirahat saat menghitung
            total jam.
          </p>
        </div>

        <!-- Locations -->
        <div v-if="activeTab === 'preferensi'" class="glass rounded-2xl p-5 md:p-6">
          <h2
            class="text-sm md:text-base font-semibold text-text-primary mb-4 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Daftar Lokasi
          </h2>
          <p class="text-text-tertiary text-xs mb-4 leading-relaxed">
            Tambahkan lokasi yang sering digunakan. Jika ada lebih dari 1,
            lokasi default akan otomatis terpilih saat input timesheet.
          </p>

          <div class="space-y-2 mb-3">
            <div
              v-for="(loc, index) in form.locations"
              :key="index"
              class="flex items-center gap-2 p-2.5 md:p-3 glass rounded-xl"
            >
              <button
                type="button"
                @click="toggleDefault(index)"
                :class="[
                  'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                  loc.isDefault
                    ? 'border-accent bg-accent'
                    : 'border-white/20 hover:border-accent',
                ]"
                :title="loc.isDefault ? 'Default' : 'Set sebagai default'"
              >
                <svg
                  v-if="loc.isDefault"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <span class="text-sm text-text-primary flex-1 min-w-0 truncate">{{
                loc.name
              }}</span>
              <button
                @click="removeLocation(index)"
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

          <div class="flex gap-2">
            <input
              v-model="newLocation"
              type="text"
              placeholder="Nama lokasi baru..."
              class="form-input flex-1"
              @keydown.enter.prevent="addLocation"
            />
            <button
              @click="addLocation"
              :disabled="!newLocation.trim()"
              type="button"
              class="px-3.5 py-2 btn-primary rounded-xl text-sm font-medium disabled:opacity-50 flex-shrink-0"
            >
              Tambah
            </button>
          </div>
        </div>

        <!-- Text Filter -->
        <div v-if="activeTab === 'preferensi'" class="glass rounded-2xl p-5 md:p-6">
          <div class="flex items-center justify-between mb-4">
            <h2
              class="text-sm md:text-base font-semibold text-text-primary flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Smart Text Filter
            </h2>
            <button
              @click="form.textFilter.enabled = !form.textFilter.enabled"
              :class="[
                'w-11 h-6 rounded-full transition-colors relative',
                form.textFilter.enabled ? 'bg-accent' : 'bg-white/10',
              ]"
            >
              <span
                :class="[
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm',
                  form.textFilter.enabled ? 'left-[22px]' : 'left-0.5',
                ]"
              ></span>
            </button>
          </div>
          <p class="text-text-tertiary text-xs mb-4 leading-relaxed">
            Otomatis memparse teks panjang (misal dari Slack wrap-up) menjadi
            daftar tugas rapi saat paste di input Rincian Tugas.
          </p>

          <div
            class="space-y-3"
            :class="{
              'opacity-40 pointer-events-none': !form.textFilter.enabled,
            }"
          >
            <div>
              <label
                class="block text-xs font-medium text-text-secondary mb-1.5"
                >Task Marker</label
              >
              <input
                v-model="form.textFilter.taskMarker"
                type="text"
                placeholder="Contoh: ###, ##, * [ ]"
                class="form-input"
              />
              <p
                class="text-text-tertiary text-[10px] md:text-xs mt-1 leading-snug"
              >
                Baris yang dimulai dengan marker ini akan dianggap sebagai task.
              </p>
            </div>

            <!-- Categories -->
            <div class="space-y-3">
              <div
                v-for="(cat, cIdx) in form.textFilter.categories"
                :key="cIdx"
                class="glass rounded-xl p-3.5 md:p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-text-primary">{{
                      cat.name
                    }}</span>
                    <span
                      :class="[
                        'text-[10px] px-1.5 py-0.5 rounded-md font-medium',
                        cat.display === 'normal'
                          ? 'bg-accent/15 text-accent'
                          : 'bg-text-tertiary/20 text-text-tertiary',
                      ]"
                    >
                      {{ cat.display === "normal" ? "Normal" : "Muted" }}
                    </span>
                  </div>
                </div>

                <div class="mb-2">
                  <label
                    class="block text-[10px] font-medium text-text-tertiary mb-1 uppercase tracking-wide"
                    >Output Template</label
                  >
                  <input
                    v-model="cat.outputTemplate"
                    type="text"
                    placeholder="- {task}"
                    class="form-input text-sm"
                  />
                </div>

                <div class="mb-2">
                  <label
                    class="block text-[10px] font-medium text-text-tertiary mb-1 uppercase tracking-wide"
                    >Keywords</label
                  >
                  <div class="flex flex-wrap gap-1.5 mb-1.5">
                    <span
                      v-for="(kw, kIdx) in cat.keywords"
                      :key="kIdx"
                      class="inline-flex items-center gap-1 px-2 py-0.5 glass rounded-md text-xs text-text-secondary"
                    >
                      {{ kw }}
                      <button
                        type="button"
                        @click="removeKeyword(cIdx, kIdx)"
                        class="text-danger hover:text-danger/80 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2.5"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  </div>
                  <div class="flex gap-2">
                    <input
                      v-model="newKeyword[cIdx]"
                      type="text"
                      placeholder="Tambah keyword..."
                      class="form-input flex-1 text-sm"
                      @keydown.enter.prevent="addKeyword(cIdx)"
                    />
                    <button
                      @click="addKeyword(cIdx)"
                      :disabled="!newKeyword[cIdx]?.trim()"
                      type="button"
                      class="px-3 py-1.5 btn-primary rounded-lg text-xs font-medium disabled:opacity-50 flex-shrink-0"
                    >
                      Tambah
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    class="block text-[10px] font-medium text-text-tertiary mb-1 uppercase tracking-wide"
                    >Display Style</label
                  >
                  <div class="flex gap-2">
                    <button
                      type="button"
                      @click="cat.display = 'normal'"
                      :class="[
                        'flex-1 py-1.5 text-xs rounded-lg border transition-all active:scale-95',
                        cat.display === 'normal'
                          ? 'border-accent bg-accent/10 text-accent font-medium'
                          : 'border-white/10 text-text-secondary hover:bg-white/5',
                      ]"
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      @click="cat.display = 'muted'"
                      :class="[
                        'flex-1 py-1.5 text-xs rounded-lg border transition-all active:scale-95',
                        cat.display === 'muted'
                          ? 'border-text-tertiary bg-text-tertiary/10 text-text-tertiary font-medium'
                          : 'border-white/10 text-text-secondary hover:bg-white/5',
                      ]"
                    >
                      Muted
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Playground -->
        <div v-if="activeTab === 'preferensi'" class="glass rounded-2xl p-5 md:p-6">
          <h2
            class="text-sm md:text-base font-semibold text-text-primary mb-4 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Playground
          </h2>
          <p class="text-text-tertiary text-xs mb-4 leading-relaxed">
            Coba paste teks wrap-up di bawah untuk melihat hasil parse sebelum
            disimpan.
          </p>

          <div class="space-y-3">
            <div>
              <label
                class="block text-xs font-medium text-text-secondary mb-1.5"
                >Raw Text</label
              >
              <textarea
                v-model="playgroundRaw"
                rows="6"
                placeholder="Paste teks dari Slack/Teams di sini..."
                class="form-input resize-none text-sm font-mono"
              ></textarea>
            </div>

            <div class="flex gap-2">
              <button
                @click="runPlayground"
                type="button"
                class="flex-1 py-2 btn-primary rounded-xl text-sm font-medium"
              >
                Coba Parse
              </button>
              <button
                @click="
                  playgroundRaw = '';
                  playgroundResult = '';
                "
                type="button"
                class="px-3 py-2 text-text-tertiary border border-white/10 rounded-xl text-sm hover:bg-white/5 transition-all active:scale-95"
              >
                Reset
              </button>
            </div>

            <div v-if="playgroundResult">
              <label
                class="block text-xs font-medium text-text-secondary mb-1.5"
                >Hasil ({{ playgroundTaskCount }} task)</label
              >
              <div
                class="glass rounded-xl p-3 text-sm font-mono text-text-secondary whitespace-pre-wrap leading-relaxed"
              >
                {{ playgroundResult || "(Tidak ada task yang ditemukan)" }}
              </div>
            </div>
          </div>
        </div>

        <!-- Google Drive -->
        <div v-if="activeTab === 'umum'" class="glass rounded-2xl p-5 md:p-6">
          <h2
            class="text-sm md:text-base font-semibold text-text-primary mb-4 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
            Google Drive
          </h2>
          <div class="flex items-center gap-2 mb-3">
            <span
              :class="[
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-success' : 'bg-danger',
              ]"
            ></span>
            <span
              class="text-sm font-medium"
              :class="isConnected ? 'text-success' : 'text-danger'"
            >
              {{ isConnected ? "Terhubung" : "Belum terhubung" }}
            </span>
          </div>

          <p class="text-text-tertiary text-xs mb-4 leading-relaxed">
            Set folder Google Drive tempat evidence disimpan. File akan disimpan
            dalam subfolder per bulan.
          </p>

          <div class="flex gap-2">
            <input
              v-model="form.googleDriveFolderId"
              type="text"
              placeholder="Paste folder ID di sini"
              class="form-input flex-1"
            />
            <button
              @click="verifyFolder"
              :disabled="verifying || !form.googleDriveFolderId"
              class="px-4 py-2 btn-primary rounded-xl text-sm font-medium disabled:opacity-50 flex-shrink-0"
            >
              {{ verifying ? "Verif..." : "Verifikasi" }}
            </button>
          </div>
          <p
            v-if="folderMessage"
            class="mt-2 text-xs"
            :class="folderSuccess ? 'text-success' : 'text-danger'"
          >
            {{ folderMessage }}
          </p>
        </div>

        <!-- Notifications -->
        <div v-if="activeTab === 'umum'" class="glass rounded-2xl p-5 md:p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2
                class="text-sm md:text-base font-semibold text-text-primary flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                Reminder Timesheet
              </h2>
              <p class="text-text-tertiary text-xs mt-1">
                Reminder harian untuk mengisi timesheet
              </p>
            </div>
            <button
              @click="form.notificationEnabled = !form.notificationEnabled"
              :class="[
                'w-11 h-6 rounded-full transition-colors relative',
                form.notificationEnabled ? 'bg-accent' : 'bg-white/10',
              ]"
            >
              <span
                :class="[
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm',
                  form.notificationEnabled ? 'left-[22px]' : 'left-0.5',
                ]"
              ></span>
            </button>
          </div>
        </div>

        <!-- Install App -->
        <div
          v-if="activeTab === 'umum' && pwa.isInstallable.value && !pwa.isStandalone.value"
          class="glass rounded-2xl p-5 md:p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <h2
                class="text-sm md:text-base font-semibold text-text-primary flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-accent"
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
                Install Aplikasi
              </h2>
              <p class="text-text-tertiary text-xs mt-1">
                Pasang TimeShit ke perangkat untuk akses cepat
              </p>
            </div>
            <button
              @click="pwa.promptInstall"
              class="px-4 py-2 btn-primary rounded-xl text-sm font-medium"
            >
              Install
            </button>
          </div>
        </div>
      </div>

      <!-- Tab: Export -->
      <div v-if="activeTab === 'export'" class="space-y-5">
        <!-- Export Template -->
        <div class="glass rounded-2xl p-5 md:p-6 space-y-4">
          <div>
            <h2
              class="text-sm md:text-base font-semibold text-text-primary flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Format Export Excel
            </h2>
            <p class="text-text-tertiary text-xs mt-1">
              Upload template .xlsx untuk mengganti styling default export
            </p>
          </div>

          <div
            v-if="templateLoading"
            class="flex items-center gap-2 text-text-tertiary text-xs"
          >
            <svg
              class="w-4 h-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Memuat...
          </div>

          <div
            v-else-if="template"
            class="flex items-center justify-between p-3 glass rounded-xl"
          >
            <div class="flex items-center gap-2 min-w-0">
              <svg
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span class="text-sm text-text-primary truncate">{{
                template.fileName
              }}</span>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <button
                @click="downloadTemplate"
                type="button"
                class="p-1.5 text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                title="Download template"
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
              </button>
              <button
                @click="deleteTemplate"
                :disabled="templateDeleting"
                type="button"
                class="p-1.5 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                title="Hapus template"
              >
                <svg
                  v-if="templateDeleting"
                  class="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <svg
                  v-else
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            v-else
            @click="$refs.templateInput.click()"
            class="border-2 border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-accent/40 transition-colors"
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
              Klik untuk upload template .xlsx
            </p>
            <p class="text-text-tertiary text-xs mt-0.5">
              File template akan mengganti styling default export
            </p>
            <input
              ref="templateInput"
              type="file"
              accept=".xlsx,.xls"
              class="hidden"
              @change="handleTemplateUpload"
            />
          </div>

          <div
            v-if="templateUploading"
            class="flex items-center gap-2 text-text-tertiary text-xs"
          >
            <svg
              class="w-4 h-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Mengupload template...
          </div>

          <div class="text-text-tertiary text-[10px] leading-relaxed">
            <p>
              Tips: Template .xlsx dengan styling (warna, font, border) akan
              dipreserve saat export. Buat template dengan:
            </p>
            <ul class="list-disc ml-4 mt-1 space-y-0.5">
              <li>Row 1-4: area judul/logo perusahaan (opsional)</li>
              <li>Row 6: header kolom dengan styling yang diinginkan</li>
              <li>Row 7-8: contoh data rows dengan alternating colors</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Tab: Absensi & Libur -->
      <div v-if="activeTab === 'absensi'" class="space-y-5">
        <!-- Absence Reasons -->
        <div class="glass rounded-2xl p-5 md:p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2
                class="text-sm md:text-base font-semibold text-text-primary flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Alasan Tidak Masuk
              </h2>
              <p class="text-text-tertiary text-xs mt-1">
                Tambahkan alasan seperti Sakit, Izin, Cuti, dll.
              </p>
            </div>
            <button
              @click="addAbsenceReason"
              :disabled="!newReasonName.trim()"
              class="px-3 py-1.5 btn-primary rounded-lg text-xs font-medium disabled:opacity-50"
            >
              Tambah
            </button>
          </div>

          <div class="flex gap-2">
            <input
              v-model="newReasonName"
              type="text"
              placeholder="Nama alasan..."
              class="form-input flex-1 text-sm"
            />
            <input
              v-model="newReasonColor"
              type="color"
              class="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer"
            />
          </div>

          <div
            v-if="absenceReasons.length === 0"
            class="text-text-tertiary text-xs text-center py-3"
          >
            Belum ada alasan. Tambahkan di atas.
          </div>

          <div v-else class="flex flex-wrap gap-2">
            <div
              v-for="reason in absenceReasons"
              :key="reason.id"
              class="flex items-center gap-2 px-3 py-1.5 glass rounded-lg group"
            >
              <span
                class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: reason.color }"
              ></span>
              <span class="text-sm text-text-primary">{{ reason.name }}</span>
              <button
                @click="removeAbsenceReason(reason.id)"
                class="text-text-tertiary hover:text-danger transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
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

        <!-- National Holidays -->
        <div class="glass rounded-2xl p-5 md:p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2
                class="text-sm md:text-base font-semibold text-text-primary flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Hari Libur Nasional
              </h2>
              <p class="text-text-tertiary text-xs mt-1">
                Sinkronisasi dari API libur.deno.dev
              </p>
            </div>
            <button
              @click="syncHolidays"
              :disabled="syncingHolidays"
              class="px-3 py-1.5 btn-primary rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg
                v-if="syncingHolidays"
                class="w-3.5 h-3.5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ syncingHolidays ? "Sinkron..." : "Sync dari API" }}
            </button>
          </div>

          <div
            v-if="holidayMessage"
            class="p-2.5 glass rounded-lg text-xs"
            :class="
              holidayMessageType === 'success' ? 'text-accent' : 'text-danger'
            "
          >
            {{ holidayMessage }}
          </div>

          <div
            v-if="holidays.length === 0"
            class="text-text-tertiary text-xs text-center py-3"
          >
            Belum ada data hari libur. Klik "Sync dari API" untuk mengambil
            data.
          </div>

          <div v-else class="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            <div
              v-for="h in holidays"
              :key="h.id"
              class="flex items-center justify-between p-2.5 glass rounded-lg"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="text-xs font-mono text-text-tertiary w-24 flex-shrink-0"
                  >{{ h.date }}</span
                >
                <span class="text-sm text-text-primary truncate">{{
                  h.name
                }}</span>
                <span
                  v-if="h.isNationalHoliday"
                  class="px-1.5 py-0.5 rounded text-[10px] bg-accent/10 text-accent flex-shrink-0"
                  >Nasional</span
                >
                <span
                  v-else
                  class="px-1.5 py-0.5 rounded text-[10px] bg-text-tertiary/10 text-text-tertiary flex-shrink-0"
                  >Cuti</span
                >
              </div>
              <button
                @click="deleteHoliday(h.id)"
                class="p-1 text-text-tertiary hover:text-danger transition-colors flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
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
      </div>

      <!-- Logout -->
      <div class="glass rounded-2xl p-5">
        <button
          @click="logout"
          class="w-full py-3 text-danger text-sm font-medium border border-danger/20 rounded-xl hover:bg-danger/10 active:bg-danger/10 transition-all active:scale-98"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Floating Save Button -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-20 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-20 opacity-0"
    >
      <div
        v-if="isDirty"
        class="fixed inset-x-4 md:left-auto md:right-6 md:max-w-sm z-50 md:bottom-6 bottom-[4.5rem]"
      >
        <div
          class="glass-strong rounded-2xl p-3 shadow-2xl flex items-center gap-3"
        >
          <div class="flex-1 min-w-0">
            <p class="text-xs text-text-secondary truncate">
              Ada perubahan yang belum disimpan
            </p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              @click="resetForm"
              type="button"
              class="px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Batal
            </button>
            <button
              @click="saveSettings"
              :disabled="saving"
              class="px-4 py-2 btn-primary rounded-xl text-xs font-medium disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg
                v-if="saving"
                class="w-3.5 h-3.5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ saving ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api.js";
import { useAuthStore } from "../stores/authStore.js";
import { parseWrapUpText } from "../utils/textFilter.js";
import { usePWAInstall } from "../composables/usePWAInstall.js";

const router = useRouter();
const authStore = useAuthStore();
const pwa = usePWAInstall();

const saving = ref(false);
const verifying = ref(false);
const folderMessage = ref("");
const folderSuccess = ref(false);
const tzOpen = ref(false);
const tzSearch = ref("");
const tzWrapper = ref(null);
const newLocation = ref("");
const newKeyword = ref([]);
const playgroundRaw = ref("");
const playgroundResult = ref("");
const playgroundTaskCount = ref(0);
const settingsAvatarError = ref(false);

// Template management
const template = ref(null);
const templateLoading = ref(false);
const templateUploading = ref(false);
const templateDeleting = ref(false);
const templateInput = ref(null);

// Tabs
const activeTab = ref("umum");
const settingTabs = [
  { key: "umum", label: "Umum" },
  { key: "preferensi", label: "Preferensi" },
  { key: "absensi", label: "Absensi & Libur" },
  { key: "export", label: "Export" },
];

// Absence
const absenceReasons = ref([]);
const newReasonName = ref("");
const newReasonColor = ref("#ef4444");

// Holidays
const holidays = ref([]);
const syncingHolidays = ref(false);
const holidayMessage = ref("");
const holidayMessageType = ref("success");

const memberSince = computed(() => {
  if (!authStore.user?.createdAt) return "-";
  const date = new Date(authStore.user.createdAt);
  return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
});

const defaultTextFilter = {
  enabled: false,
  taskMarker: "###",
  categories: [
    {
      name: "Selesai",
      keywords: [
        "sudah saya kerjakan",
        "sudah dikerjakan",
        "sudah selesai",
        "done",
        "completed",
        "merged",
        "di PR",
      ],
      outputTemplate: "- {task}",
      display: "normal",
    },
    {
      name: "Sedang Dikerjakan",
      keywords: [
        "sedang dikerjakan",
        "sedang saya kerjakan",
        "in progress",
        "ongoing",
        "WIP",
      ],
      outputTemplate: "- {task}",
      display: "normal",
    },
    {
      name: "Belum Dikerjakan",
      keywords: [
        "belum dikerjakan",
        "not started",
        "pending",
        "todo",
        "belum mulai",
      ],
      outputTemplate: "~ {task} (pending)",
      display: "muted",
    },
  ],
  defaultCategory: "Belum Dikerjakan",
};

function runPlayground() {
  const result = parseWrapUpText(playgroundRaw.value, form.value.textFilter);
  playgroundResult.value = result.output;
  playgroundTaskCount.value = result.tasks.length;
}

const timezones = [
  { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB, UTC+7)" },
  { value: "Asia/Makassar", label: "Asia/Makassar (WITA, UTC+8)" },
  { value: "Asia/Jayapura", label: "Asia/Jayapura (WIT, UTC+9)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, UTC+8)" },
  { value: "Asia/Kuala_Lumpur", label: "Asia/Kuala_Lumpur (MYT, UTC+8)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (ICT, UTC+7)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST, UTC+9)" },
  { value: "Asia/Seoul", label: "Asia/Seoul (KST, UTC+9)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST, UTC+8)" },
  { value: "Asia/Hong_Kong", label: "Asia/Hong_Kong (HKT, UTC+8)" },
  { value: "Asia/Taipei", label: "Asia/Taipei (CST, UTC+8)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+4)" },
  { value: "America/New_York", label: "America/New_York (EST, UTC-5)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST, UTC-8)" },
  { value: "Europe/London", label: "Europe/London (GMT, UTC+0)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET, UTC+1)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST, UTC+10)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST, UTC+12)" },
  { value: "UTC", label: "UTC (UTC+0)" },
];

const filteredTimezones = computed(() => {
  if (!tzSearch.value) return timezones;
  const q = tzSearch.value.toLowerCase();
  return timezones.filter(
    (tz) =>
      tz.label.toLowerCase().includes(q) || tz.value.toLowerCase().includes(q),
  );
});

const selectedTzLabel = computed(() => {
  return (
    timezones.find((tz) => tz.value === form.value.timezone)?.label ||
    form.value.timezone
  );
});

const isConnected = computed(() => {
  return !!form.value.googleDriveFolderId;
});

const historyPeriodOptions = [
  { value: "all", label: "Semua" },
  { value: "current_week", label: "Minggu Ini" },
  { value: "current_month", label: "Bulan Ini" },
  { value: "last_7_days", label: "7 Hari Terakhir" },
  { value: "last_30_days", label: "30 Hari Terakhir" },
  { value: "last_month", label: "Bulan Lalu" },
  { value: "custom", label: "Custom" },
];

const monthOffsetOptions = [
  { value: -6, label: "6 Bulan Lalu" },
  { value: -5, label: "5 Bulan Lalu" },
  { value: -4, label: "4 Bulan Lalu" },
  { value: -3, label: "3 Bulan Lalu" },
  { value: -2, label: "2 Bulan Lalu" },
  { value: -1, label: "Bulan Lalu" },
  { value: 0, label: "Bulan Ini" },
  { value: 1, label: "Bulan Depan" },
  { value: 2, label: "2 Bulan Ke Depan" },
];

const customPeriodPreview = computed(() => {
  if (form.value.defaultHistoryPeriod !== "custom") return "";
  const c = form.value.defaultHistoryCustom;
  if (!c.fromDay || !c.toDay) return "";
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const today = new Date();
  const fromDate = new Date(today.getFullYear(), today.getMonth() + c.fromMonthOffset, c.fromDay);
  const toDate = new Date(today.getFullYear(), today.getMonth() + c.toMonthOffset, c.toDay);
  const fmt = (d) => `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  return `${fmt(fromDate)} — ${fmt(toDate)}`;
});

const form = ref({
  name: "",
  timezone: "Asia/Jakarta",
  googleDriveFolderId: "",
  notificationEnabled: true,
  defaultStartTime: "",
  defaultEndTime: "",
  defaultBreakMinutes: 0,
  defaultHistoryPeriod: "current_month",
  defaultHistoryCustom: { fromDay: 1, fromMonthOffset: -1, toDay: 1, toMonthOffset: 0 },
  locations: [],
  textFilter: { ...defaultTextFilter },
});

function selectTz(value) {
  form.value.timezone = value;
  tzOpen.value = false;
  tzSearch.value = "";
}

function addLocation() {
  const name = newLocation.value.trim();
  if (!name) return;
  form.value.locations.push({
    name,
    isDefault: form.value.locations.length === 0,
  });
  newLocation.value = "";
}

function removeLocation(index) {
  const wasDefault = form.value.locations[index].isDefault;
  form.value.locations.splice(index, 1);
  if (wasDefault && form.value.locations.length > 0) {
    form.value.locations[0].isDefault = true;
  }
}

function toggleDefault(index) {
  form.value.locations.forEach((loc, i) => {
    loc.isDefault = i === index;
  });
}

function addKeyword(catIdx) {
  const kw = newKeyword.value[catIdx]?.trim();
  if (!kw) return;
  if (!form.value.textFilter.categories[catIdx].keywords.includes(kw)) {
    form.value.textFilter.categories[catIdx].keywords.push(kw);
  }
  newKeyword.value[catIdx] = "";
}

function removeKeyword(catIdx, kwIdx) {
  form.value.textFilter.categories[catIdx].keywords.splice(kwIdx, 1);
}

function onClickOutside(e) {
  if (tzWrapper.value && !tzWrapper.value.contains(e.target)) {
    tzOpen.value = false;
    tzSearch.value = "";
  }
}

const initialForm = ref(null);

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const isDirty = computed(() => {
  if (!initialForm.value) return false;
  return !deepEqual(form.value, initialForm.value);
});

function resetForm() {
  if (initialForm.value) {
    form.value = deepClone(initialForm.value);
    newKeyword.value = form.value.textFilter?.categories?.map(() => "") || [];
    playgroundRaw.value = "";
    playgroundResult.value = "";
    playgroundTaskCount.value = 0;
    folderMessage.value = "";
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  const user = authStore.user;
  if (user) {
    form.value.name = user.name || "";
    form.value.timezone = user.timezone || "Asia/Jakarta";
    form.value.googleDriveFolderId = user.googleDriveFolderId || "";
    form.value.notificationEnabled = user.notificationEnabled !== false;
    form.value.defaultStartTime = user.defaultStartTime || "";
    form.value.defaultEndTime = user.defaultEndTime || "";
    form.value.defaultBreakMinutes = user.defaultBreakMinutes || 0;
    form.value.defaultHistoryPeriod = user.defaultHistoryPeriod || "current_month";
    form.value.defaultHistoryCustom = user.defaultHistoryCustom
      ? { ...user.defaultHistoryCustom }
      : { fromDay: 1, fromMonthOffset: -1, toDay: 1, toMonthOffset: 0 };
    form.value.locations = (user.locations || []).map((l) => ({ ...l }));
    const tf = user.textFilter;
    if (tf && typeof tf === "object") {
      form.value.textFilter = {
        enabled: !!tf.enabled,
        taskMarker: tf.taskMarker || "###",
        categories: (tf.categories || defaultTextFilter.categories).map(
          (c) => ({
            name: c.name,
            keywords: [...(c.keywords || [])],
            outputTemplate: c.outputTemplate || "- {task}",
            display: c.display === "muted" ? "muted" : "normal",
          }),
        ),
        defaultCategory: tf.defaultCategory || "Belum Dikerjakan",
      };
    }
    newKeyword.value = form.value.textFilter.categories.map(() => "");
    initialForm.value = deepClone(form.value);
  }
  fetchTemplate();
  fetchAbsenceReasons();
  fetchHolidays();
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});

async function verifyFolder() {
  verifying.value = true;
  folderMessage.value = "";
  try {
    const { data } = await api.post("/settings/verify-folder", {
      folderId: form.value.googleDriveFolderId,
    });
    folderMessage.value = data.message;
    folderSuccess.value = true;
    authStore.user = {
      ...authStore.user,
      googleDriveFolderId: form.value.googleDriveFolderId,
    };
  } catch (err) {
    folderMessage.value =
      err.response?.data?.message || "Gagal memverifikasi folder";
    folderSuccess.value = false;
  } finally {
    verifying.value = false;
  }
}

async function saveSettings() {
  saving.value = true;
  try {
    const { data } = await api.put("/settings", form.value);
    authStore.user = { ...authStore.user, ...data.data };
    initialForm.value = deepClone(form.value);
    folderMessage.value = "Settings berhasil disimpan";
    folderSuccess.value = true;
  } catch (err) {
    folderMessage.value = err.response?.data?.message || "Gagal menyimpan";
    folderSuccess.value = false;
  } finally {
    saving.value = false;
  }
}

async function logout() {
  await authStore.logout();
  router.push("/login");
}

async function fetchTemplate() {
  templateLoading.value = true;
  try {
    const { data } = await api.get("/export/template");
    template.value = data.data;
  } catch (err) {
    console.error("Failed to fetch template", err);
  } finally {
    templateLoading.value = false;
  }
}

async function handleTemplateUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    folderMessage.value = "Format file harus .xlsx";
    folderSuccess.value = false;
    return;
  }

  templateUploading.value = true;
  const formData = new FormData();
  formData.append("template", file);

  try {
    const { data } = await api.post("/export/template", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    template.value = data.data;
    folderMessage.value = "Template berhasil diupload";
    folderSuccess.value = true;
  } catch (err) {
    folderMessage.value =
      err.response?.data?.message || "Gagal upload template";
    folderSuccess.value = false;
  } finally {
    templateUploading.value = false;
    if (templateInput.value) templateInput.value.value = "";
  }
}

async function downloadTemplate() {
  try {
    const response = await api.get("/export/template/download", {
      responseType: "blob",
    });
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = template.value?.fileName || "template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    folderMessage.value =
      err.response?.data?.message || "Gagal download template";
    folderSuccess.value = false;
  }
}

async function deleteTemplate() {
  templateDeleting.value = true;
  try {
    await api.delete("/export/template");
    template.value = null;
    folderMessage.value = "Template berhasil dihapus";
    folderSuccess.value = true;
  } catch (err) {
    folderMessage.value = err.response?.data?.message || "Gagal hapus template";
    folderSuccess.value = false;
  } finally {
    templateDeleting.value = false;
  }
}

async function fetchAbsenceReasons() {
  try {
    const { data } = await api.get("/absence-reasons");
    absenceReasons.value = data.data || [];
  } catch {
    /* ignore */
  }
}

async function addAbsenceReason() {
  if (!newReasonName.value.trim()) return;
  try {
    const { data } = await api.post("/absence-reasons", {
      name: newReasonName.value.trim(),
      color: newReasonColor.value,
    });
    absenceReasons.value.push(data.data);
    newReasonName.value = "";
  } catch (err) {
    folderMessage.value =
      err.response?.data?.message || "Gagal menambah alasan";
    folderSuccess.value = false;
  }
}

async function removeAbsenceReason(id) {
  try {
    await api.delete(`/absence-reasons/${id}`);
    absenceReasons.value = absenceReasons.value.filter((r) => r.id !== id);
  } catch (err) {
    folderMessage.value =
      err.response?.data?.message || "Gagal menghapus alasan";
    folderSuccess.value = false;
  }
}

async function fetchHolidays() {
  try {
    const { data } = await api.get("/holidays");
    holidays.value = data.data || [];
  } catch {
    /* ignore */
  }
}

async function syncHolidays() {
  syncingHolidays.value = true;
  holidayMessage.value = "";
  try {
    const { data } = await api.post("/holidays/sync");
    holidayMessage.value = data.message;
    holidayMessageType.value = "success";
    await fetchHolidays();
  } catch (err) {
    holidayMessage.value = err.response?.data?.message || "Gagal sinkronisasi";
    holidayMessageType.value = "error";
  } finally {
    syncingHolidays.value = false;
  }
}

async function deleteHoliday(id) {
  try {
    await api.delete(`/holidays/${id}`);
    holidays.value = holidays.value.filter((h) => h.id !== id);
  } catch (err) {
    holidayMessage.value = err.response?.data?.message || "Gagal menghapus";
    holidayMessageType.value = "error";
  }
}
</script>
