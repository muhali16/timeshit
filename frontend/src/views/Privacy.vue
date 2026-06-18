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
      <h1>Kebijakan Privasi</h1>
      <p class="legal-meta">Terakhir diperbarui: 18 Juni 2026</p>

      <p>
        Kebijakan Privasi ini menjelaskan bagaimana <strong>TimeShit</strong>
        (selanjutnya disebut &ldquo;Aplikasi&rdquo;, &ldquo;kami&rdquo;), sebuah produk
        yang dioperasikan oleh <strong>Enambelas</strong>, mengumpulkan, menggunakan,
        dan melindungi data Anda saat menggunakan layanan kami.
      </p>

      <h2>1. Data yang Kami Kumpulkan</h2>
      <ul>
        <li>
          <strong>Informasi akun Google.</strong> Saat Anda masuk menggunakan Google,
          kami menerima nama, alamat email, dan foto profil Anda untuk membuat dan
          mengidentifikasi akun Anda.
        </li>
        <li>
          <strong>Data timesheet.</strong> Catatan jam kerja yang Anda buat: tanggal,
          waktu mulai/selesai, lokasi, deskripsi aktivitas, durasi istirahat, serta
          data absensi.
        </li>
        <li>
          <strong>Berkas bukti (evidence).</strong> Berkas yang Anda unggah dan
          disimpan ke Google Drive Anda sendiri.
        </li>
        <li>
          <strong>Token notifikasi.</strong> Token perangkat untuk mengirim
          pengingat melalui Firebase Cloud Messaging, jika Anda mengaktifkannya.
        </li>
      </ul>

      <h2>2. Akses Google Drive</h2>
      <p>
        Dengan izin Anda, Aplikasi mengakses Google Drive Anda semata-mata untuk
        membuat folder dan mengunggah berkas bukti yang Anda kirim. Berkas disimpan
        di Drive milik Anda pada folder
        <code>/TimeShit/Timesheet/YYYY/MM/DD/</code>. Kami tidak membaca, mengubah,
        atau menghapus berkas lain di Google Drive Anda.
      </p>
      <p>
        Penggunaan dan transfer informasi yang diterima dari Google API oleh Aplikasi
        mematuhi
        <a href="https://developers.google.com/terms/api-services-user-data-policy"
           target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>,
        termasuk persyaratan Limited Use.
      </p>

      <h2>3. Bagaimana Kami Menggunakan Data</h2>
      <ul>
        <li>Menyediakan dan menjalankan fitur pencatatan jam kerja.</li>
        <li>Menyimpan bukti ke Google Drive Anda dan menampilkannya kembali.</li>
        <li>Mengirim pengingat harian sesuai preferensi Anda.</li>
        <li>Mengekspor data Anda ke format Excel atas permintaan Anda.</li>
      </ul>
      <p>Kami <strong>tidak menjual</strong> data pribadi Anda kepada pihak ketiga.</p>

      <h2>4. Penyimpanan &amp; Keamanan</h2>
      <p>
        Data akun dan timesheet disimpan pada basis data kami. Berkas bukti disimpan
        pada Google Drive Anda. Kami menerapkan langkah keamanan yang wajar untuk
        melindungi data, namun tidak ada metode transmisi atau penyimpanan yang
        sepenuhnya aman secara mutlak.
      </p>

      <h2>5. Berbagi dengan Pihak Ketiga</h2>
      <p>
        Kami menggunakan layanan pihak ketiga berikut: Google (autentikasi &amp;
        Drive) dan Firebase (autentikasi &amp; notifikasi). Data hanya dibagikan
        sejauh diperlukan agar layanan tersebut berfungsi.
      </p>

      <h2>6. Hak Anda</h2>
      <p>
        Anda dapat meminta akses, koreksi, atau penghapusan data Anda, serta mencabut
        akses Google kapan saja melalui
        <a href="https://myaccount.google.com/permissions" target="_blank"
           rel="noopener noreferrer">pengaturan izin akun Google</a> Anda. Untuk
        penghapusan akun beserta seluruh datanya, hubungi kami.
      </p>

      <h2>7. Anak-anak</h2>
      <p>Aplikasi tidak ditujukan untuk pengguna di bawah usia 13 tahun.</p>

      <h2>8. Perubahan Kebijakan</h2>
      <p>
        Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan
        akan dipublikasikan pada halaman ini disertai tanggal pembaruan.
      </p>

      <h2>9. Kontak</h2>
      <p>
        Pertanyaan terkait privasi, permintaan data, atau laporan bug dapat dikirim ke
        <a href="mailto:hello@enambelas.dev">hello@enambelas.dev</a>.
      </p>

      <footer class="legal-footer">
        <router-link to="/terms">Syarat &amp; Ketentuan</router-link>
        <span>&copy; 2026 TimeShit by Enambelas</span>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  document.title = "Kebijakan Privasi — TimeShit by Enambelas";
});
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
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
