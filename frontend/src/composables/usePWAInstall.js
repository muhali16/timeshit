import { ref, onMounted, onUnmounted } from "vue";

const isInstallable = ref(false);
const isStandalone = ref(false);
const deferredPrompt = ref(null);

export function usePWAInstall() {
  function beforeInstallHandler(e) {
    e.preventDefault();
    deferredPrompt.value = e;
    isInstallable.value = true;
  }

  function appInstalledHandler() {
    deferredPrompt.value = null;
    isInstallable.value = false;
    isStandalone.value = true;
  }

  function checkStandalone() {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      isStandalone.value = true;
    }
    if (window.navigator.standalone === true) {
      isStandalone.value = true;
    }
  }

  async function promptInstall() {
    if (!deferredPrompt.value) return;
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    deferredPrompt.value = null;
    if (outcome === "accepted") {
      isInstallable.value = false;
    }
  }

  onMounted(() => {
    checkStandalone();
    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", appInstalledHandler);
  });

  onUnmounted(() => {
    window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
    window.removeEventListener("appinstalled", appInstalledHandler);
  });

  return {
    isInstallable,
    isStandalone,
    promptInstall,
  };
}
