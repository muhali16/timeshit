import { ref, computed, onMounted, onUnmounted } from "vue";

// Module-level singleton state shared across all consumers (floating button,
// Settings, Login, instructions modal all read/write the same refs).
const isStandalone = ref(false);
const deferredPrompt = ref(null);
const instructionsOpen = ref(false);
const dismissed = ref(false);
let listenersBound = false;

function detectPlatform() {
  const ua = navigator.userAgent || navigator.vendor || "";
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+ reports as Mac; detect via touch points
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  const isSafari = /^((?!chrome|crios|fxios|android).)*safari/i.test(ua);
  const isFirefox = /firefox|fxios/i.test(ua);
  return { isIOS, isAndroid, isSafari, isFirefox };
}

const platform = detectPlatform();

function checkStandalone() {
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  ) {
    isStandalone.value = true;
  }
}

function beforeInstallHandler(e) {
  e.preventDefault();
  deferredPrompt.value = e;
}

function appInstalledHandler() {
  deferredPrompt.value = null;
  isStandalone.value = true;
  instructionsOpen.value = false;
}

export function usePWAInstall() {
  // Native install prompt available (Chrome/Edge/Android Chrome/desktop Chromium)
  const canPromptNative = computed(() => !!deferredPrompt.value);

  // Offer install at all? Hide once installed. iOS has no native prompt but
  // supports manual "Add to Home Screen", so still installable there.
  const isInstallable = computed(() => {
    if (isStandalone.value) return false;
    return canPromptNative.value || platform.isIOS;
  });

  async function promptInstall() {
    if (deferredPrompt.value) {
      deferredPrompt.value.prompt();
      const { outcome } = await deferredPrompt.value.userChoice;
      deferredPrompt.value = null;
      if (outcome === "accepted") instructionsOpen.value = false;
      return;
    }
    // No native prompt (iOS / Firefox / unsupported) → show manual steps.
    instructionsOpen.value = true;
  }

  function openInstructions() {
    instructionsOpen.value = true;
  }
  function closeInstructions() {
    instructionsOpen.value = false;
  }
  function dismiss() {
    dismissed.value = true;
  }

  onMounted(() => {
    checkStandalone();
    if (!listenersBound) {
      window.addEventListener("beforeinstallprompt", beforeInstallHandler);
      window.addEventListener("appinstalled", appInstalledHandler);
      listenersBound = true;
    }
  });

  // Listeners are bound once for the app lifetime (singleton); never removed.
  onUnmounted(() => {});

  return {
    platform,
    isStandalone,
    isInstallable,
    canPromptNative,
    instructionsOpen,
    dismissed,
    promptInstall,
    openInstructions,
    closeInstructions,
    dismiss,
  };
}
