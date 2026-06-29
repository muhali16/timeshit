<template>
  <div class="relative" ref="wrapper">
    <button
      ref="trigger"
      type="button"
      @click="toggle"
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
    <!-- teleported so backdrop-filter ancestors don't clip it -->
    <Teleport to="body">
      <div
        v-if="open"
        ref="menu"
        class="fixed z-50 glass-strong rounded-xl shadow-2xl overflow-hidden"
        :style="menuStyle"
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
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, onMounted, onUnmounted } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  options: { type: Array, default: () => [] }, // [{ value, label }] or [string]
  placeholder: { type: String, default: "Pilih..." },
});
const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const wrapper = ref(null);
const trigger = ref(null);
const menu = ref(null);
const menuStyle = reactive({ top: "0px", left: "0px", width: "0px" });

const normalized = computed(() =>
  props.options.map((o) =>
    typeof o === "object" ? o : { value: o, label: String(o) },
  ),
);

const selectedLabel = computed(() => {
  const match = normalized.value.find((o) => o.value === props.modelValue);
  return match ? match.label : props.placeholder;
});

function position() {
  if (!trigger.value) return;
  const r = trigger.value.getBoundingClientRect();
  menuStyle.top = `${r.bottom + 4}px`;
  menuStyle.left = `${r.left}px`;
  menuStyle.width = `${r.width}px`;
}

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    await nextTick();
    position();
  }
}

function select(val) {
  emit("update:modelValue", val);
  open.value = false;
}

function onClickOutside(e) {
  if (
    wrapper.value && !wrapper.value.contains(e.target) &&
    menu.value && !menu.value.contains(e.target)
  )
    open.value = false;
}

function onReflow() {
  if (open.value) position();
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("scroll", onReflow, true);
  window.addEventListener("resize", onReflow);
});
onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("scroll", onReflow, true);
  window.removeEventListener("resize", onReflow);
});
</script>
