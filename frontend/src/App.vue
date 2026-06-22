<template>
  <div class="min-h-screen text-text-primary md:pb-0">
    <!-- Standalone routes (legal pages) render without app chrome -->
    <router-view v-if="isStandalone" />

    <!-- Unauthenticated User Layout (minimal header with home button) -->
    <div v-else-if="!authStore.isLoggedIn" class="flex flex-col min-h-screen">
      <!-- Minimal Header for Unauthenticated Users -->
      <header class="flex-shrink-0 z-40 glass border-b safe-area-top">
        <div class="max-w-4xl mx-auto px-4 min-h-14 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-lg font-bold text-text-primary tracking-tight">TimeShit</span>
          </div>
          <router-link to="/" class="text-sm font-medium px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors">
            Home
          </router-link>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto w-full">
        <router-view />
      </main>
    </div>

    <!-- Mobile Layout Wrapper (Authenticated Users) -->
    <div v-else-if="isMobile" class="flex flex-col fixed inset-0 z-0 overflow-hidden">
      <!-- Mobile Header -->
      <header class="flex-shrink-0 z-40 glass border-b-0 safe-area-top">
        <div
          class="max-w-4xl mx-auto px-4 min-h-14 flex items-center justify-between"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4.5 h-4.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span class="text-lg font-bold text-text-primary tracking-tight"
              >TimeShit</span
            >
          </div>

          <!-- Mobile Profile -->
          <div class="relative" ref="profileDropdown">
            <button
              @click="profileOpen = !profileOpen"
              class="flex items-center gap-1.5 p-1.5 rounded-xl transition-all active:scale-95"
            >
              <img
                v-if="authStore.user?.avatar && !mobileAvatarError"
                :src="authStore.user.avatar"
                :alt="authStore.user.name"
                class="w-7 h-7 rounded-full object-cover ring-2 ring-accent/30"
                @error="mobileAvatarError = true"
              />
              <div
                v-if="!authStore.user?.avatar || mobileAvatarError"
                class="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center ring-2 ring-accent/20"
              >
                <span class="text-accent font-bold text-xs">{{
                  (authStore.user?.name || "?")[0]?.toUpperCase()
                }}</span>
              </div>
            </button>

            <div
              v-if="profileOpen"
              class="absolute right-0 mt-2 w-48 glass-strong rounded-2xl shadow-2xl overflow-hidden z-50 animate-float-in"
            >
              <div class="px-3.5 py-2.5 border-b border-white/10">
                <p class="text-sm font-medium text-text-primary truncate">
                  {{ authStore.user?.name }}
                </p>
                <p class="text-xs text-text-tertiary truncate">
                  {{ authStore.user?.email }}
                </p>
              </div>
              <router-link
                to="/settings"
                @click="profileOpen = false"
                class="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text-secondary hover:bg-white/5 transition-colors"
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </router-link>
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Warning Banner -->
      <div
        v-if="authStore.isLoggedIn && !authStore.hasFolderId"
        class="flex-shrink-0 bg-warning/10 border-b border-warning/20 px-4 py-2.5"
      >
        <div class="max-w-4xl mx-auto flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 text-warning flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p class="text-xs text-warning">
            Google Drive folder belum diatur.
            <router-link to="/settings" class="underline font-semibold"
              >Atur di Settings</router-link
            >
          </p>
        </div>
      </div>

      <!-- Mobile Content Area -->
      <main class="flex-1 overflow-y-auto w-full">
        <div class="max-w-4xl mx-auto px-4 py-5 pb-28">
          <router-view />
        </div>
      </main>

      <!-- Mobile Bottom Navigation -->
      <nav class="flex-shrink-0 z-40 glass border-t-0">
        <div class="flex items-center justify-around h-16 max-w-4xl mx-auto">
          <router-link
            v-for="item in bottomNavItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-all duration-300 active:scale-90',
              $route.path === item.path ? 'text-accent' : 'text-text-tertiary',
            ]"
          >
            <component :is="item.icon" :active="$route.path === item.path" />
            <span class="text-[10px] font-medium">{{ item.label }}</span>
          </router-link>
        </div>
      </nav>
    </div>

    <!-- Desktop Layout: Floating Sidebar + Content (Authenticated Users) -->
    <div v-else-if="!isMobile && authStore.isLoggedIn" class="flex min-h-screen">
      <!-- Floating Sidebar -->
      <aside
        class="w-[72px] xl:w-20 flex-shrink-0 p-4 flex flex-col items-center gap-4 fixed h-screen z-40"
      >
        <!-- Logo Pill -->
        <div
          class="w-full aspect-square rounded-2xl glass-strong flex flex-col items-center justify-center gap-1 animate-glow-pulse"
        >
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg shadow-accent/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Nav Pills -->
        <nav class="flex flex-col items-center gap-2 w-full flex-1 py-2">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'group relative w-full py-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300',
              $route.path === item.path
                ? 'glass-strong text-accent shadow-lg shadow-accent/10'
                : 'glass glass-hover text-text-tertiary hover:text-text-primary',
            ]"
            :title="item.label"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              :active="$route.path === item.path"
            />
            <span
              class="text-[10px] font-medium leading-none whitespace-nowrap"
              >{{ item.shortLabel }}</span
            >
            <!-- Active indicator glow -->
            <div
              v-if="$route.path === item.path"
              class="absolute inset-0 rounded-2xl ring-2 ring-accent/30 pointer-events-none"
            ></div>
          </router-link>
        </nav>

        <!-- Profile / Bottom -->
        <div class="w-full flex flex-col items-center gap-2">
          <!-- Settings shortcut -->
          <router-link
            to="/settings"
            :class="[
              'w-full py-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-300',
              $route.path === '/settings'
                ? 'glass-strong text-accent'
                : 'glass glass-hover text-text-tertiary hover:text-text-primary',
            ]"
            title="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </router-link>

          <!-- Logout -->
          <button
            @click="handleLogout"
            class="w-full py-2.5 rounded-2xl glass glass-hover flex flex-col items-center justify-center text-danger border border-danger/30 hover:bg-danger/10 hover:border-danger/60 transition-all duration-300 gap-1"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span class="text-[9px] font-medium leading-none whitespace-nowrap"
              >Keluar</span
            >
          </button>
        </div>
      </aside>

      <!-- Desktop Content Area -->
      <main
        class="flex-1 ml-[72px] xl:ml-20 p-6 lg:p-8 xl:p-10 overflow-y-auto min-h-screen"
      >
        <!-- Desktop Warning Banner -->
        <div
          v-if="authStore.isLoggedIn && !authStore.hasFolderId"
          class="hidden md:flex items-center gap-3 glass rounded-2xl px-5 py-3.5 mb-6 border-l-4 border-l-warning"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 text-warning flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p class="text-sm text-warning">
            Google Drive folder belum diatur.
            <router-link
              to="/settings"
              class="underline font-semibold hover:text-text-primary transition-colors"
              >Atur di Settings</router-link
            >
          </p>
        </div>

        <div class="max-w-6xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Global PWA install affordances (rendered across all layouts) -->
    <InstallAppButton />
    <InstallInstructionsModal />
  </div>
</template>

<script setup>
import { h, ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "./stores/authStore.js";
import InstallAppButton from "./components/Common/InstallAppButton.vue";
import InstallInstructionsModal from "./components/Common/InstallInstructionsModal.vue";

const $route = useRoute();

// Routes that render standalone, without the app navigation chrome
const isStandalone = computed(() =>
  ["Landing", "Privacy", "Terms"].includes($route.name)
);
const router = useRouter();
const authStore = useAuthStore();
const profileOpen = ref(false);
const profileDropdown = ref(null);
const mobileAvatarError = ref(false);

const isMobile = ref(window.matchMedia("(max-width: 767px)").matches);
const mq = window.matchMedia("(max-width: 767px)");
function onMQChange(e) { isMobile.value = e.matches; }

async function handleLogout() {
  profileOpen.value = false;
  await authStore.logout();
  router.push("/login");
}

function onClickOutside(e) {
  if (profileDropdown.value && !profileDropdown.value.contains(e.target)) {
    profileOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  mq.addEventListener("change", onMQChange);
});
onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  mq.removeEventListener("change", onMQChange);
});

// Nav icons (render functions)
const DashboardIcon = {
  props: ["active"],
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        class: this.active ? "w-5 h-5 text-accent" : "w-5 h-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        "stroke-width": 2,
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
        }),
      ],
    );
  },
};

const InputIcon = {
  props: ["active"],
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        class: this.active ? "w-5 h-5 text-accent" : "w-5 h-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        "stroke-width": 2,
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M12 4v16m8-8H4",
        }),
      ],
    );
  },
};

const HistoryIcon = {
  props: ["active"],
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        class: this.active ? "w-5 h-5 text-accent" : "w-5 h-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        "stroke-width": 2,
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        }),
      ],
    );
  },
};

const SettingsIcon = {
  props: ["active"],
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        class: this.active ? "w-5 h-5 text-accent" : "w-5 h-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        "stroke-width": 2,
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
        }),
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
        }),
      ],
    );
  },
};

const navItems = [
  { path: "/app", label: "Dashboard", shortLabel: "Home", icon: DashboardIcon },
  { path: "/timesheet", label: "Input", shortLabel: "Input", icon: InputIcon },
  {
    path: "/history",
    label: "Riwayat",
    shortLabel: "History",
    icon: HistoryIcon,
  },
];

const bottomNavItems = [
  { path: "/app", label: "Home", icon: DashboardIcon },
  { path: "/timesheet", label: "Input", icon: InputIcon },
  { path: "/history", label: "Riwayat", icon: HistoryIcon },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];
</script>
