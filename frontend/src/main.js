import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Register PWA service worker
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onRegistered(swRegistration) {
          console.log('PWA Service Worker registered:', swRegistration?.scope)
        },
        onRegisterError(error) {
          console.error('PWA Service Worker registration failed:', error)
        },
      })
    })
    .catch((err) => {
      console.error('Failed to load PWA registration module:', err)
    })
}
