<template>
  <div class="relative" ref="wrapper">
    <button
      type="button"
      @click="toggle"
      class="form-input text-left flex items-center justify-between gap-2"
      :class="{ 'text-text-tertiary': !modelValue }"
    >
      <span class="truncate">{{ modelValue ? displayLabel : placeholder }}</span>
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
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </button>

    <Teleport to="body">
    <div
      v-if="open"
      ref="popup"
      class="fixed z-[60] glass-strong rounded-xl shadow-2xl p-3 w-[17rem]"
      :style="{ top: pos.top + 'px', left: pos.left + 'px' }"
    >
      <!-- Month nav -->
      <div class="flex items-center justify-between mb-2">
        <button
          type="button"
          @click="shiftMonth(-1)"
          class="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="text-sm font-semibold text-text-primary">
          {{ months[viewMonth] }} {{ viewYear }}
        </span>
        <button
          type="button"
          @click="shiftMonth(1)"
          class="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Weekday header -->
      <div class="grid grid-cols-7 gap-0.5 mb-1">
        <span
          v-for="d in weekdays"
          :key="d"
          class="text-center text-[10px] font-medium text-text-tertiary py-1"
        >{{ d }}</span>
      </div>

      <!-- Days -->
      <div class="grid grid-cols-7 gap-0.5">
        <span v-for="b in leading" :key="'b' + b"></span>
        <button
          v-for="day in daysInMonth"
          :key="day"
          type="button"
          @click="pick(day)"
          :class="[
            'h-8 rounded-lg text-sm transition-colors',
            isSelected(day)
              ? 'bg-accent text-white font-semibold'
              : isToday(day)
                ? 'text-accent font-medium hover:bg-white/5'
                : 'text-text-secondary hover:bg-white/5',
          ]"
        >
          {{ day }}
        </button>
      </div>

      <button
        type="button"
        @click="pickToday"
        class="w-full mt-2 py-1.5 text-xs text-accent font-medium hover:bg-white/5 rounded-lg transition-colors"
      >
        Hari ini
      </button>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

const modelValue = defineModel({ type: String, default: "" });
defineProps({
  placeholder: { type: String, default: "Pilih tanggal" },
});

const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const open = ref(false);
const wrapper = ref(null);
const popup = ref(null);
const pos = reactive({ top: 0, left: 0 });
const POPUP_WIDTH = 272; // w-[17rem]

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

// Currently displayed month/year
const today = new Date();
const viewMonth = ref(today.getMonth());
const viewYear = ref(today.getFullYear());

function syncViewToValue() {
  if (modelValue.value) {
    const [y, m] = modelValue.value.split("-").map(Number);
    viewYear.value = y;
    viewMonth.value = m - 1;
  }
}
watch(modelValue, syncViewToValue, { immediate: true });

const displayLabel = computed(() => {
  if (!modelValue.value) return "";
  const [y, m, d] = modelValue.value.split("-").map(Number);
  return `${d} ${months[m - 1]} ${y}`;
});

const daysInMonth = computed(() =>
  new Date(viewYear.value, viewMonth.value + 1, 0).getDate(),
);
const leading = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).getDay(),
);

function fmt(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function isSelected(day) {
  return modelValue.value === fmt(viewYear.value, viewMonth.value, day);
}
function isToday(day) {
  return (
    today.getFullYear() === viewYear.value &&
    today.getMonth() === viewMonth.value &&
    today.getDate() === day
  );
}

function shiftMonth(delta) {
  let m = viewMonth.value + delta;
  let y = viewYear.value;
  if (m < 0) { m = 11; y--; }
  if (m > 11) { m = 0; y++; }
  viewMonth.value = m;
  viewYear.value = y;
}

function pick(day) {
  modelValue.value = fmt(viewYear.value, viewMonth.value, day);
  open.value = false;
}
function pickToday() {
  viewMonth.value = today.getMonth();
  viewYear.value = today.getFullYear();
  pick(today.getDate());
}

function toggle() {
  open.value = !open.value;
  if (open.value) {
    syncViewToValue();
    nextTick(updatePos);
  }
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
