<template>
  <div class="legal-page">
    <header class="legal-header">
      <router-link to="/" class="legal-brand">
        <span class="legal-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <span class="legal-brand-name">TimeShit</span>
      </router-link>
      <router-link to="/" class="legal-back">&larr; Kembali ke aplikasi</router-link>
    </header>

    <main class="legal-content">
      <h1>Syarat &amp; Ketentuan</h1>
      <p class="legal-meta">Terakhir diperbarui: 18 Juni 2026</p>

      <p>
        Dengan mengakses atau menggunakan <strong>TimeShit</strong> (selanjutnya
        disebut &ldquo;Aplikasi&rdquo;), sebuah produk yang dioperasikan oleh
        <strong>Enambelas</strong>, Anda menyetujui Syarat &amp; Ketentuan berikut.
        Jika Anda tidak setuju, mohon untuk tidak menggunakan Aplikasi.
      </p>

      <h2>1. Layanan</h2>
      <p>
        TimeShit adalah aplikasi timesheet untuk mencatat jam kerja beserta detail
        aktivitas, lokasi, dan berkas bukti, dengan dukungan ekspor Excel dan
        integrasi Google Drive. Aplikasi disediakan secara gratis.
      </p>

      <h2>2. Akun</h2>
      <p>
        Anda masuk menggunakan akun Google. Anda bertanggung jawab menjaga kerahasiaan
        akses ke akun tersebut serta seluruh aktivitas yang terjadi di bawah akun
        Anda.
      </p>

      <h2>3. Penggunaan yang Diperbolehkan</h2>
      <ul>
        <li>Gunakan Aplikasi hanya untuk tujuan yang sah dan sesuai hukum.</li>
        <li>
          Jangan menyalahgunakan, mengganggu, atau mencoba mengakses sistem secara
          tidak sah.
        </li>
        <li>
          Anda bertanggung jawab penuh atas keakuratan data dan konten yang Anda
          masukkan.
        </li>
      </ul>

      <h2>4. Konten Anda</h2>
      <p>
        Anda tetap menjadi pemilik seluruh data dan berkas yang Anda buat atau unggah.
        Berkas bukti disimpan pada Google Drive milik Anda. Anda memberi kami izin
        terbatas untuk memproses data tersebut semata-mata untuk menjalankan layanan.
      </p>

      <h2>5. Layanan Pihak Ketiga</h2>
      <p>
        Aplikasi bergantung pada layanan Google dan Firebase. Penggunaan layanan
        tersebut tunduk pula pada syarat dan kebijakan masing-masing penyedia.
      </p>

      <h2>6. Ketersediaan Layanan</h2>
      <p>
        Aplikasi disediakan &ldquo;sebagaimana adanya&rdquo; (as is) tanpa jaminan
        dalam bentuk apa pun. Kami tidak menjamin layanan akan selalu tersedia tanpa
        gangguan atau bebas dari kesalahan.
      </p>

      <h2>7. Batasan Tanggung Jawab</h2>
      <p>
        Sepanjang diizinkan oleh hukum yang berlaku, Enambelas tidak bertanggung jawab
        atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari
        penggunaan atau ketidakmampuan menggunakan Aplikasi, termasuk kehilangan data.
        Anda dianjurkan menyimpan cadangan data penting Anda sendiri.
      </p>

      <h2>8. Penghentian</h2>
      <p>
        Anda dapat berhenti menggunakan Aplikasi kapan saja dan meminta penghapusan
        akun. Kami berhak menangguhkan atau menghentikan akses yang melanggar Syarat
        &amp; Ketentuan ini.
      </p>

      <h2>9. Perubahan</h2>
      <p>
        Kami dapat memperbarui Syarat &amp; Ketentuan ini sewaktu-waktu. Versi terbaru
        akan dipublikasikan pada halaman ini disertai tanggal pembaruan.
      </p>

      <h2>10. Kontak</h2>
      <p>
        Untuk pertanyaan, masukan, atau laporan bug, hubungi kami di
        <a href="mailto:hello@enambelas.dev">hello@enambelas.dev</a>.
      </p>

      <footer class="legal-footer">
        <router-link to="/privacy">Kebijakan Privasi</router-link>
        <span>&copy; 2026 TimeShit by Enambelas</span>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  document.title = "Syarat & Ketentuan — TimeShit by Enambelas";
});
</script>

<style scoped>
.legal-page {
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  background: #ffffff;
  color: #1f2937;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial,
    sans-serif;
  line-height: 1.7;
}
.legal-header {
  max-width: 768px;
  margin: 0 auto;
  padding: 24px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.legal-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #111827;
}
.legal-logo {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.legal-logo svg {
  width: 18px;
  height: 18px;
}
.legal-brand-name {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.01em;
}
.legal-back {
  font-size: 14px;
  color: #6b7280;
  text-decoration: none;
}
.legal-back:hover {
  color: #111827;
}
.legal-content {
  max-width: 768px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}
.legal-content h1 {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 16px 0 4px;
}
.legal-content h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 32px 0 8px;
  color: #111827;
}
.legal-meta {
  color: #9ca3af;
  font-size: 14px;
  margin: 0 0 24px;
}
.legal-content p {
  margin: 0 0 14px;
}
.legal-content ul {
  margin: 0 0 14px;
  padding-left: 22px;
}
.legal-content li {
  margin-bottom: 8px;
}
.legal-content a {
  color: #ea580c;
  text-decoration: underline;
}
.legal-content code {
  background: #f3f4f6;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.9em;
}
.legal-footer {
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #9ca3af;
}
.legal-footer a {
  color: #6b7280;
  text-decoration: none;
}
.legal-footer a:hover {
  color: #111827;
}
</style>
