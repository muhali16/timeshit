# Panduan SEO TimeShit — Langkah Setelah Deploy

Dokumen ini berisi langkah yang **harus Anda lakukan secara manual** setelah perubahan SEO di-deploy ke produksi (`https://timeshit.enambelas.dev`). Perubahan kode hanya menyiapkan fondasi; agar muncul di Google dan ranking #1 untuk kata kunci bermerek, langkah di bawah ini wajib dijalankan.

---

## 0. Prasyarat deploy

1. Pastikan domain produksi sudah mengarah ke server: **`timeshit.enambelas.dev`** (DNS A/CNAME).
2. Pasang HTTPS (sertifikat SSL). Google tidak akan meranking baik tanpa HTTPS.
3. Set environment variable backend agar konsisten dengan domain:
   - `FRONTEND_URL=https://timeshit.enambelas.dev`
   - Tambahkan domain ini ke daftar `origin` CORS di `backend/src/app.js` bila perlu.
4. Di **Google Cloud Console → OAuth consent screen / Credentials**:
   - Authorized JavaScript origins: `https://timeshit.enambelas.dev`
   - Authorized redirect URIs: sesuaikan dengan callback Anda di domain tersebut
   - Isi **App homepage**: `https://timeshit.enambelas.dev/`
   - Isi **Privacy policy URL**: `https://timeshit.enambelas.dev/#/privacy`
   - Isi **Terms of service URL**: `https://timeshit.enambelas.dev/#/terms`

---

## 1. Google Search Console (paling penting)

1. Buka https://search.google.com/search-console dan tambahkan properti.
   - Pilih tipe **Domain** (`enambelas.dev`) bila bisa mengubah DNS TXT, atau
   - **URL prefix**: `https://timeshit.enambelas.dev/`.
2. Verifikasi kepemilikan (DNS TXT record direkomendasikan).
3. Menu **Sitemaps** → submit: `https://timeshit.enambelas.dev/sitemap.xml`
4. Menu **URL Inspection** → tempel `https://timeshit.enambelas.dev/` → klik **Request Indexing**.
5. Tunggu 1–7 hari untuk indexing pertama. Cek tab **Pages** untuk status.

## 2. Bing Webmaster Tools (bonus, mudah)

1. https://www.bing.com/webmasters → tambahkan situs, bisa impor dari Search Console.
2. Submit sitemap yang sama.

---

## 3. Verifikasi tampilan saat link dibagikan (Open Graph)

Setelah live, uji preview kartu link:

- Facebook / umum: https://developers.facebook.com/tools/debug/ → tempel URL → **Scrape Again**
- Twitter/X: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/
- WhatsApp: cukup kirim link ke chat sendiri; bila gambar tak muncul, scrape ulang via Facebook Debugger (WhatsApp memakai cache OG Facebook).

Gambar preview: `https://timeshit.enambelas.dev/og-image.png` (1200×630, logo jam oranye + "TimeShit").

> Jika gambar lama masih muncul, itu karena cache platform — gunakan tombol "Scrape Again"/"Refresh" di tool di atas.

---

## 4. Ranking untuk "timeshit enambelas" / "timeshit enambelas dev"

Kata kunci ini **bermerek (branded)** dan rendah persaingan, jadi relatif mudah ranking #1 setelah terindeks. Yang membantu:

1. **Konsistensi nama (NAP/brand):** selalu tulis "TimeShit by Enambelas" di profil-profil publik.
2. **Backlink awal** (sangat membantu indexing & otoritas):
   - Tautkan dari situs utama Anda `https://enambelas.dev` ke `https://timeshit.enambelas.dev`.
   - Tambahkan link di bio GitHub, README repo publik, LinkedIn, Twitter/X, Product Hunt, dll.
3. **Google Business / direktori** (opsional) bila relevan.
4. **Konten:** halaman utama sudah punya judul & deskripsi mengandung "TimeShit", "Enambelas". Pertahankan kata-kata ini di teks yang terlihat (mis. heading di landing/login).

> Catatan teknis: aplikasi ini SPA berbasis **hash routing**. Google mengindeks `index.html` (judul, deskripsi, data terstruktur) dengan baik untuk query bermerek. Bila nanti ingin SEO konten yang lebih dalam (mis. halaman fitur/blog terindeks terpisah), pertimbangkan pindah ke **history mode** + pre-render/SSR.

---

## 5. Checklist verifikasi cepat (setelah deploy)

- [ ] `https://timeshit.enambelas.dev/robots.txt` bisa diakses & menyebut sitemap.
- [ ] `https://timeshit.enambelas.dev/sitemap.xml` bisa diakses.
- [ ] `https://timeshit.enambelas.dev/og-image.png` tampil.
- [ ] Favicon muncul di tab browser (logo jam oranye).
- [ ] `https://timeshit.enambelas.dev/#/privacy` & `/#/terms` terbuka tanpa login.
- [ ] Rich Results Test lolos: https://search.google.com/test/rich-results (tempel URL).
- [ ] Sitemap sudah di-submit di Search Console.
- [ ] URL utama sudah di-"Request Indexing".

---

## 6. Pemeliharaan

- Setiap kali konten utama berubah signifikan, perbarui `lastmod` di `frontend/public/sitemap.xml`.
- Pantau Search Console: **Performance** (query yang membawa klik) dan **Pages** (error indexing).
- Jaga kecepatan situs (Core Web Vitals) — sudah terbantu PWA + caching.

---

## Ringkasan aset yang sudah dibuat

| Aset | Lokasi |
|---|---|
| Favicon SVG (logo jam oranye) | `frontend/public/favicon.svg` |
| Logo SVG | `frontend/public/logo.svg` |
| favicon.ico (16/32/48) | `frontend/public/favicon.ico` |
| Favicon PNG 16/32/48 | `frontend/public/icons/favicon-*.png` |
| Apple touch icon 180 | `frontend/public/icons/apple-touch-icon.png` |
| Icon PWA 72→512 + maskable | `frontend/public/icons/icon-*.png` |
| Gambar Open Graph 1200×630 | `frontend/public/og-image.png` |
| robots.txt | `frontend/public/robots.txt` |
| sitemap.xml | `frontend/public/sitemap.xml` |
| Meta SEO + structured data | `frontend/index.html` |
| Halaman Privacy | `frontend/src/views/Privacy.vue` → `/#/privacy` |
| Halaman Terms | `frontend/src/views/Terms.vue` → `/#/terms` |

Kontak laporan bug: **hello@enambelas.dev**
