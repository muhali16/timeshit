<template>
  <div class="relative" ref="wrapper">
    <button
      type="button"
      @click="open = !open"
      class="form-input text-left flex items-center justify-between"
      :class="{ 'text-text-tertiary': selectedLabel === placeholder }"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 text-text-tertiary flex-shrink-0 ml-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div
      v-if="open"
      class="absolute z-30 top-full left-0 right-0 mt-1 glass-strong rounded-xl shadow-2xl overflow-hidden"
    >
      <div class="max-h-48 overflow-y-auto">
        <button
          v-for="opt in normalized"
          :key="opt.value"
          type="button"
          @click="select(opt.value)"
          :class="[
            'w-full px-3.5 py-2.5 text-left text-sm transition-colors',
            modelValue === opt.value
              ? 'bg-accent/15 text-accent font-medium'
              : 'text-text-secondary hover:bg-white/5',
          ]"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  options: { type: Array, default: () => [] }, // [{ value, label }] or [string]
  placeholder: { type: String, default: "Pilih..." },
});
const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const wrapper = ref(null);

const normalized = computed(() =>
  props.options.map((o) =>
    typeof o === "object" ? o : { value: o, label: String(o) },
  ),
);

const selectedLabel = computed(() => {
  const match = normalized.value.find((o) => o.value === props.modelValue);
  return match ? match.label : props.placeholder;
});

function select(val) {
  emit("update:modelValue", val);
  open.value = false;
}

function onClickOutside(e) {
  if (wrapper.value && !wrapper.value.contains(e.target)) open.value = false;
}

onMounted(() => document.addEventListener("click", onClickOutside));
onUnmounted(() => document.removeEventListener("click", onClickOutside));
</script>
