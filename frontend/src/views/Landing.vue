<template>
    <div
        class="landing-root bg-bg-primary text-text-primary"
    >
        <!-- Top bar -->
        <header
            class="max-w-5xl mx-auto px-5 py-5 flex items-center justify-between"
        >
            <div
                class="flex items-center gap-2.5"
            >
                <span class="logo-badge">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        stroke-width="2.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </span>
                <span
                    class="text-lg font-bold tracking-tight"
                    >TimeShit</span
                >
            </div>
            <button
                @click="login"
                :disabled="loading"
                class="text-sm font-medium px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
                {{
                    loading
                        ? "Mengalihkan..."
                        : "Login"
                }}
            </button>
        </header>

        <!-- Hero -->
        <section
            class="max-w-3xl mx-auto px-5 pt-12 pb-16 text-center"
        >
            <span
                class="inline-block text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-6"
            >
                Aplikasi timesheet · oleh
                Enambelas
            </span>
            <h1
                class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight"
            >
                Catat jam kerja, lengkap dengan
                bukti.
            </h1>
            <p
                class="text-text-secondary text-base sm:text-lg mt-5 max-w-2xl mx-auto leading-relaxed"
            >
                TimeShit adalah aplikasi timesheet
                untuk mencatat jam kerja harian
                Anda — beserta detail aktivitas,
                lokasi, dan berkas bukti yang
                otomatis tersimpan ke Google Drive
                Anda. Ekspor ke Excel dan dapatkan
                pengingat harian.
            </p>
            <div
                class="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
            >
                <button
                    @click="login"
                    :disabled="loading"
                    class="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-gray-800 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <svg
                        class="w-5 h-5"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    <span>{{
                        loading
                            ? "Mengalihkan..."
                            : "Mulai dengan Google"
                    }}</span>
                </button>
                <a
                    href="/#/#fitur"
                    class="text-sm text-text-tertiary hover:text-text-secondary transition-colors px-4 py-3"
                >
                    Lihat fitur &darr;
                </a>
            </div>
            <p
                class="text-text-tertiary text-xs mt-4"
            >
                Gratis · Bisa dipasang sebagai
                aplikasi (PWA)
            </p>
        </section>

        <!-- Features -->
        <section
            id="fitur"
            class="max-w-5xl mx-auto px-5 pb-16"
        >
            <h2
                class="text-center text-xl sm:text-2xl font-bold mb-2"
            >
                Apa yang bisa Anda lakukan
            </h2>
            <p
                class="text-center text-text-tertiary text-sm mb-10"
            >
                Semua yang dibutuhkan untuk
                mencatat dan membuktikan jam
                kerja.
            </p>
            <div
                class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                <div
                    v-for="f in features"
                    :key="f.title"
                    class="glass rounded-2xl p-5 text-left"
                >
                    <div
                        class="feature-icon"
                        v-html="f.icon"
                    ></div>
                    <h3
                        class="font-semibold mt-3 mb-1.5"
                    >
                        {{ f.title }}
                    </h3>
                    <p
                        class="text-text-tertiary text-sm leading-relaxed"
                    >
                        {{ f.desc }}
                    </p>
                </div>
            </div>
        </section>

        <!-- How it works -->
        <section
            class="max-w-4xl mx-auto px-5 pb-16"
        >
            <h2
                class="text-center text-xl sm:text-2xl font-bold mb-10"
            >
                Cara kerja
            </h2>
            <div
                class="grid sm:grid-cols-3 gap-4"
            >
                <div
                    v-for="(s, i) in steps"
                    :key="s.title"
                    class="glass rounded-2xl p-5 text-left"
                >
                    <span class="step-num">{{
                        i + 1
                    }}</span>
                    <h3
                        class="font-semibold mt-3 mb-1.5"
                    >
                        {{ s.title }}
                    </h3>
                    <p
                        class="text-text-tertiary text-sm leading-relaxed"
                    >
                        {{ s.desc }}
                    </p>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section
            class="max-w-3xl mx-auto px-5 pb-16"
        >
            <div
                class="glass-strong rounded-3xl p-8 sm:p-10 text-center"
            >
                <h2
                    class="text-2xl font-bold mb-2"
                >
                    Siap mulai mencatat?
                </h2>
                <p
                    class="text-text-secondary text-sm mb-6"
                >
                    Masuk dengan akun Google Anda.
                    Tidak perlu kartu kredit.
                </p>
                <button
                    @click="login"
                    :disabled="loading"
                    class="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                    {{
                        loading
                            ? "Mengalihkan..."
                            : "Login dengan Google"
                    }}
                </button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="border-t border-border">
            <div
                class="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
            >
                <span class="text-text-tertiary"
                    >&copy; 2026 TimeShit by
                    Enambelas</span
                >
                <div
                    class="flex items-center gap-5 text-text-tertiary"
                >
                    <router-link
                        to="/privacy"
                        class="hover:text-text-secondary transition-colors"
                        >Kebijakan
                        Privasi</router-link
                    >
                    <router-link
                        to="/terms"
                        class="hover:text-text-secondary transition-colors"
                        >Syarat &amp;
                        Ketentuan</router-link
                    >
                    <a
                        href="mailto:hello@enambelas.dev"
                        class="hover:text-text-secondary transition-colors"
                        >Kontak</a
                    >
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore.js";

const authStore = useAuthStore();
const loading = ref(false);

function login() {
    loading.value = true;
    authStore.loginWithGoogle();
}

onMounted(() => {
    document.title =
        "TimeShit by Enambelas — Aplikasi Timesheet & Catat Jam Kerja";
});

const features = [
    {
        title: "Catat jam kerja harian",
        desc: "Waktu mulai & selesai, lokasi, deskripsi aktivitas, dan durasi istirahat dalam satu entri.",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    },
    {
        title: "Bukti otomatis ke Google Drive",
        desc: "Unggah foto atau dokumen bukti; berkas tersimpan rapi ke folder Google Drive Anda sendiri.",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15a4 4 0 004 4h11a3 3 0 100-6 5 5 0 00-9.6-1.5A4 4 0 003 15z"/></svg>',
    },
    {
        title: "Ekspor ke Excel",
        desc: "Hasilkan laporan timesheet dalam format .xlsx siap kirim, sesuai template Anda.",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17v-2m3 2v-4m3 4v-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>',
    },
    {
        title: "Pengingat harian",
        desc: "Notifikasi agar Anda tidak lupa mengisi timesheet, dengan jadwal yang bisa diatur.",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
    },
    {
        title: "Absensi & hari libur",
        desc: "Catat cuti dan jenis absensi khusus, lengkap dengan kalender hari libur nasional.",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>',
    },
    {
        title: "Pasang sebagai aplikasi",
        desc: "TimeShit adalah PWA — pasang di ponsel atau desktop dan gunakan layaknya aplikasi native.",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>',
    },
];

const steps = [
    {
        title: "Masuk dengan Google",
        desc: "Login aman memakai akun Google Anda dan hubungkan Google Drive.",
    },
    {
        title: "Catat jam kerja",
        desc: "Isi waktu, lokasi, aktivitas, dan lampirkan bukti setiap hari.",
    },
    {
        title: "Ekspor & laporkan",
        desc: "Unduh laporan Excel kapan pun Anda membutuhkannya.",
    },
];
</script>

<style scoped>
.landing-root {
    height: 100vh;
    height: 100dvh;
    overflow-y: auto;
    scroll-behavior: smooth;
}
.logo-badge {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: linear-gradient(
        135deg,
        #f97316 0%,
        #ea580c 100%
    );
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.logo-badge svg {
    width: 18px;
    height: 18px;
}
.feature-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(249, 115, 22, 0.12);
    color: #f97316;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.feature-icon :deep(svg) {
    width: 20px;
    height: 20px;
}
.step-num {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: linear-gradient(
        135deg,
        #f97316 0%,
        #ea580c 100%
    );
    color: #fff;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
</style>
