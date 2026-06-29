<template>
  <div class="max-w-7xl mx-auto px-4 md:px-8">
    <div class="mb-5 md:mb-8">
      <h1 class="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
        Tools
      </h1>
      <p class="text-text-tertiary text-sm mt-0.5 md:text-base">
        Kumpulan tools penunjang aktivitas developer
      </p>
    </div>

    <div class="space-y-3">
      <!-- Accordion: Ubah Task Jadi PR -->
      <div class="glass rounded-2xl overflow-hidden">
        <button
          type="button"
          @click="open = !open"
          class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-sm md:text-base font-semibold text-text-primary">Generator Daftar PR</p>
              <p class="text-text-tertiary text-xs">Parsing daftar task jadi daftar kode &amp; bullet PR</p>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 text-text-tertiary flex-shrink-0 transition-transform"
            :class="{ 'rotate-180': open }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="open" class="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs md:text-sm font-medium text-text-secondary">
                Daftar task
              </label>
              <button
                v-if="input"
                type="button"
                @click="reset"
                class="inline-flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-danger transition-colors px-2 py-1 rounded-lg hover:bg-danger/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus semua
              </button>
            </div>
            <textarea
              v-model="input"
              rows="6"
              placeholder="Tempel daftar task, satu per baris:&#10;HRSS-68    Menambahkan field urutan pada menu group&#10;HRSS-69    Memperbaiki endpoint data user"
              class="form-input resize-y text-sm font-mono"
            ></textarea>
          </div>

          <template v-if="tasks.length">
            <!-- Codes line -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs md:text-sm font-medium text-text-secondary">Daftar kode</label>
                <button
                  type="button"
                  @click="copy(codesLine, 'codes')"
                  class="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors px-2 py-1 rounded-lg hover:bg-accent/10"
                >
                  <svg v-if="copied === 'codes'" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {{ copied === 'codes' ? 'Tersalin!' : 'Salin' }}
                </button>
              </div>
              <pre class="form-input text-sm font-mono whitespace-pre-wrap break-words">{{ codesLine }}</pre>
            </div>

            <!-- Bullet list -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs md:text-sm font-medium text-text-secondary">Daftar PR</label>
                <button
                  type="button"
                  @click="copy(bulletList, 'bullets')"
                  class="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors px-2 py-1 rounded-lg hover:bg-accent/10"
                >
                  <svg v-if="copied === 'bullets'" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {{ copied === 'bullets' ? 'Tersalin!' : 'Salin' }}
                </button>
              </div>
              <pre class="form-input text-sm font-mono whitespace-pre-wrap break-words">{{ bulletList }}</pre>
            </div>
          </template>
          <p v-else class="text-text-tertiary text-sm">Tempel daftar task untuk melihat hasil.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { textToTasks } from "../utils/report.js";

const STORAGE_KEY = "tools.prGenerator.input";
const open = ref(true);
const input = ref(localStorage.getItem(STORAGE_KEY) || "");
const copied = ref("");

watch(input, (val) => localStorage.setItem(STORAGE_KEY, val));

function reset() {
  input.value = "";
}

const tasks = computed(() => textToTasks(input.value));
const codesLine = computed(() =>
  tasks.value.filter((t) => t.code).map((t) => `[${t.code}]`).join(", "),
);
const bulletList = computed(() =>
  tasks.value
    .map((t) => (t.code ? `* [${t.code}] ${t.title}` : `* ${t.title}`))
    .join("\n"),
);

async function copy(text, key) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  copied.value = key;
  setTimeout(() => (copied.value = ""), 1500);
}
</script>
