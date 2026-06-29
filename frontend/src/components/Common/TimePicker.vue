<template>
  <div class="relative" ref="wrapper">
    <button
      type="button"
      @click="toggle"
      class="form-input text-left flex items-center justify-between gap-2"
      :class="{ 'text-text-tertiary': !modelValue }"
    >
      <span class="truncate">{{ modelValue || placeholder }}</span>
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="popup"
        class="fixed z-[60] glass-strong rounded-xl shadow-2xl p-3 w-[13rem]"
        :style="{ top: pos.top + 'px', left: pos.left + 'px' }"
      >
        <div class="grid grid-cols-2 gap-2">
          <div>
            <p class="text-center text-[10px] font-medium text-text-tertiary mb-1">Jam</p>
            <div ref="hourCol" class="h-44 overflow-y-auto pr-1 space-y-0.5 scrollbar-hide">
              <button
                v-for="h in hours"
                :key="h"
                type="button"
                :data-h="h"
                @click="pickHour(h)"
                :class="[
                  'w-full h-8 rounded-lg text-sm transition-colors',
                  h === hour
                    ? 'bg-accent text-white font-semibold'
                    : 'text-text-secondary hover:bg-white/5',
                ]"
              >
                {{ h }}
              </button>
            </div>
          </div>
          <div>
            <p class="text-center text-[10px] font-medium text-text-tertiary mb-1">Menit</p>
            <div ref="minCol" class="h-44 overflow-y-auto pr-1 space-y-0.5 scrollbar-hide">
              <button
                v-for="m in minutes"
                :key="m"
                type="button"
                :data-m="m"
                @click="pickMinute(m)"
                :class="[
                  'w-full h-8 rounded-lg text-sm transition-colors',
                  m === minute
                    ? 'bg-accent text-white font-semibold'
                    : 'text-text-secondary hover:bg-white/5',
                ]"
              >
                {{ m }}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="pickNow"
          class="w-full mt-2 py-1.5 text-xs text-accent font-medium hover:bg-white/5 rounded-lg transition-colors"
        >
          Sekarang
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from "vue";

const modelValue = defineModel({ type: String, default: "" });
defineProps({
  placeholder: { type: String, default: "Pilih jam" },
});

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const open = ref(false);
const wrapper = ref(null);
const popup = ref(null);
const hourCol = ref(null);
const minCol = ref(null);
const pos = reactive({ top: 0, left: 0 });
const POPUP_WIDTH = 208; // w-[13rem]

const hour = computed(() => modelValue.value.split(":")[0] || "");
const minute = computed(() => modelValue.value.split(":")[1] || "");

function updatePos() {
  if (!wrapper.value) return;
  const r = wrapper.value.getBoundingClientRect();
  let left = r.left;
  if (left + POPUP_WIDTH > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - POPUP_WIDTH - 8);
  }
  pos.top = r.bottom + 4;
  pos.left = left;
}

function set(h, m) {
  modelValue.value = `${h}:${m}`;
}
function pickHour(h) {
  set(h, minute.value || "00");
}
function pickMinute(m) {
  set(hour.value || "00", m);
}
function pickNow() {
  const d = new Date();
  set(String(d.getHours()).padStart(2, "0"), String(d.getMinutes()).padStart(2, "0"));
  open.value = false;
}

function scrollToSelected() {
  hourCol.value?.querySelector(`[data-h="${hour.value}"]`)?.scrollIntoView({ block: "center" });
  minCol.value?.querySelector(`[data-m="${minute.value}"]`)?.scrollIntoView({ block: "center" });
}

function toggle() {
  open.value = !open.value;
  if (open.value) nextTick(() => { updatePos(); scrollToSelected(); });
}

function onClickOutside(e) {
  if (
    wrapper.value &&
    !wrapper.value.contains(e.target) &&
    popup.value &&
    !popup.value.contains(e.target)
  ) {
    open.value = false;
  }
}
function onReposition() {
  if (open.value) updatePos();
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("scroll", onReposition, true);
  window.addEventListener("resize", onReposition);
});
onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("scroll", onReposition, true);
  window.removeEventListener("resize", onReposition);
});
</script>
