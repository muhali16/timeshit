import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

// Hide PWA loading screen after mount
const hideLoading = () => {
  const loader = document.getElementById("app-loading");
  if (loader) {
    loader.classList.add("done");
    setTimeout(() => {
      loader.remove();
    }, 600);
  }
};

// Wait for router initial navigation + small delay to ensure DOM paint
if (router.isReady) {
  router.isReady().then(() => setTimeout(hideLoading, 200));
} else {
  window.addEventListener("load", () => setTimeout(hideLoading, 400));
}

// Register PWA service worker
if ("serviceWorker" in navigator) {
  import("virtual:pwa-register")
    .then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onRegistered(swRegistration) {
          console.log("PWA Service Worker registered:", swRegistration?.scope);
        },
        onRegisterError(error) {
          console.error("PWA Service Worker registration failed:", error);
        },
      });
    })
    .catch((err) => {
      console.error("Failed to load PWA registration module:", err);
    });
}
