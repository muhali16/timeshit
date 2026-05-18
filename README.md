# TimeFlow - Timesheet App

Aplikasi timesheet modern berbasis PWA (Progressive Web App) untuk pencatatan jam kerja harian dengan fitur upload evidence ke Google Drive, dashboard analytics, export Excel, dan push notification reminder.

**Tech Stack:** Vue.js 3 + Fastify + PostgreSQL + Drizzle ORM + PWA + Firebase Cloud Messaging

---

## 📑 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Prerequisites](#prerequisites)
- [Setup Server (Ubuntu)](#setup-server-ubuntu)
- [Database Setup](#database-setup)
- [Application Deployment](#application-deployment)
- [Konfigurasi Nginx](#konfigurasi-nginx)
- [SSL dengan Let's Encrypt](#ssl-dengan-lets-encrypt)
- [Menjalankan Backend sebagai Service](#menjalankan-backend-sebagai-service)
- [Konfigurasi Google OAuth & Drive](#konfigurasi-google-oauth--drive)
- [Konfigurasi Firebase FCM](#konfigurasi-firebase-fcm)
- [PWA & Instalasi Mobile](#pwa--instalasi-mobile)
- [Variabel Environment](#variabel-environment)
- [Troubleshooting](#troubleshooting)
- [Maintenance & Update](#maintenance--update)

---

## Fitur Utama

- **Timesheet Entry** — Form input tanggal, waktu mulai/akhir, lokasi, aktivitas, dan upload multiple file evidence.
- **Dashboard & Insights** — Real-time daily/weekly/monthly breakdown dengan chart.
- **Export Excel** — Generate file `.xlsx` dengan format profesional.
- **Google Drive Integration** — File evidence auto-upload ke folder terstruktur (`/TimeFlow/Timesheet/YYYY/MM/DD/`).
- **Push Notification (FCM)** — Daily reminder via Firebase Cloud Messaging.
- **PWA Support** — Dapat di-install di home screen Android/iOS, berjalan offline dengan caching.
- **Dark Mode UI** — Modern interface dengan Tailwind CSS, responsive untuk desktop & mobile.

---

## Arsitektur Sistem

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Browser  │────▶│   Nginx (80/443)│────▶│ Fastify Backend │
│  (PWA - Vue.js) │     │  Reverse Proxy  │     │   (Port 3000)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐        ┌──────────────┐
                        │  Static PWA  │        │  PostgreSQL  │
                        │   (dist/)    │        │   (Local)    │
                        └──────────────┘        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Google Drive │
                        │ (Evidence)   │
                        └──────────────┘
```

---

## Prerequisites

- **OS:** Ubuntu 22.04 LTS (atau lebih baru)
- **Domain:** Domain aktif yang pointing ke IP server (contoh: `timeflow.yourdomain.com`)
- **Akses:** SSH root/sudo privileges
- **Akun Google:** Untuk OAuth login & Google Drive API
- **Akun Firebase:** Untuk Cloud Messaging (FCM)

---

## Setup Server (Ubuntu)

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js (via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # v22.x
npm -v
```

### 3. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 4. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. Install PM2 (Process Manager untuk Node.js)

```bash
sudo npm install -g pm2
```

### 6. Install Certbot (Let's Encrypt SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Database Setup

### 1. Buat Database & User

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE timeflow_db;
CREATE USER timeflow_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE timeflow_db TO timeflow_user;
\q
```

### 2. (Opsional) Enable UUID Extension

```bash
sudo -u postgres psql -d timeflow_db
```

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

### 3. Test Koneksi

```bash
psql postgresql://timeflow_user:your_secure_password@localhost:5432/timeflow_db -c "\dt"
```

---

## Application Deployment

### 1. Clone Repository

```bash
cd /var/www
git clone https://github.com/username/timeflow.git
cd timeflow
```

Atau jika deploy dari local:

```bash
scp -r ./timeshit user@server:/var/www/timeflow
```

### 2. Setup Backend

```bash
cd /var/www/timeflow/backend
npm install --production
```

### 3. Konfigurasi Environment Backend

```bash
cp .env.example .env
nano .env
```

Isi dengan konfigurasi production:

```env
# Database
DATABASE_URL=postgresql://timeflow_user:your_secure_password@localhost:5432/timeflow_db

# Google OAuth (WAJIB untuk login & Google Drive)
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=https://timeflow.yourdomain.com/api/auth/google/callback

# Google Drive
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id

# Firebase/FCM (opsional untuk push notification)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com

# Application
NODE_ENV=production
API_PORT=3000
API_HOST=127.0.0.1
API_URL=https://timeflow.yourdomain.com/api
FRONTEND_URL=https://timeflow.yourdomain.com
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend static files (PWA)
FRONTEND_DIST_PATH=/var/www/timeflow/frontend/dist

# Logging
LOG_LEVEL=info

# FCM Scheduler
FCM_SCHEDULER_ENABLED=true
FCM_REMINDER_HOUR=17
FCM_REMINDER_MINUTE=0

# Swagger / API Docs (opsional, recommended untuk dev only)
SWAGGER_USERNAME=admin
SWAGGER_PASSWORD=your-secure-password
```

### 4. Run Database Migrations

```bash
cd /var/www/timeflow/backend
npm run db:migrate
```

> Jika belum ada migrate script, jalankan seed atau buat tabel manual berdasarkan schema di `src/database/schema.js`.

### 5. Setup Frontend

```bash
cd /var/www/timeflow/frontend
npm install
```

Buat environment frontend:

```bash
cp .env.example .env.production
nano .env.production
```

```env
VITE_API_URL=https://timeflow.yourdomain.com/api
```

Build untuk production:

```bash
npm run build
```

Hasil build akan berada di `/var/www/timeflow/frontend/dist`.

### 6. Jalankan Backend dengan PM2

```bash
cd /var/www/timeflow/backend
pm2 start src/server.js --name timeflow-api
pm2 save
pm2 startup
```

Verifikasi backend berjalan:

```bash
curl http://127.0.0.1:3000/health
# Expected: {"status":"ok"}
```

---

## Konfigurasi Nginx

### 1. Buat Nginx Config

```bash
sudo nano /etc/nginx/sites-available/timeflow
```

```nginx
server {
    listen 80;
    server_name timeflow.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API Proxy ke Fastify backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }

    # Uploads proxy ke backend
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;
    }

    # Swagger docs (opsional, recommended disable di production)
    location /internal/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Service Worker dan Manifest (PWA critical files)
    location ~ ^/(sw\.js|manifest\.webmanifest|workbox-.*\.js)$ {
        root /var/www/timeflow/frontend/dist;
        add_header Cache-Control "no-cache";
        add_header Service-Worker-Allowed "/";
        try_files $uri =404;
    }

    # Static assets
    location /assets/ {
        root /var/www/timeflow/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location /icons/ {
        root /var/www/timeflow/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Favicon & static root files
    location ~ ^/(favicon\.svg|icons\.svg)$ {
        root /var/www/timeflow/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA Fallback — semua route lain ke index.html
    location / {
        root /var/www/timeflow/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

### 2. Aktifkan Site

```bash
sudo ln -s /etc/nginx/sites-available/timeflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL dengan Let's Encrypt

```bash
sudo certbot --nginx -d timeflow.yourdomain.com
```

Ikuti instruksi interaktif. Certbot akan otomatis:
- Buat SSL certificate
- Update Nginx config untuk listen 443 dengan SSL
- Setup auto-renewal

Verifikasi auto-renewal:

```bash
sudo certbot renew --dry-run
```

Setelah SSL aktif, update environment variables backend & frontend agar menggunakan `https://`.

---

## Menjalankan Backend sebagai Service

Jika tidak menggunakan PM2, gunakan systemd:

```bash
sudo nano /etc/systemd/system/timeflow.service
```

```ini
[Unit]
Description=TimeFlow API Server
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/timeflow/backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/var/www/timeflow/backend/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable timeflow
sudo systemctl start timeflow
sudo systemctl status timeflow
```

---

## Konfigurasi Google OAuth & Drive

### 1. Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih existing project
3. Enable APIs:
   - Google Drive API
   - Google OAuth 2.0
4. Buat OAuth 2.0 Credentials (Web Application)
5. Tambahkan authorized redirect URI:
   - `https://timeflow.yourdomain.com/api/auth/google/callback`
6. Copy **Client ID** dan **Client Secret** ke `.env`

### 2. Google Drive Folder

1. Buat folder di Google Drive (contoh: `TimeFlow Evidence`)
2. Ambil **Folder ID** dari URL: `https://drive.google.com/drive/folders/{FOLDER_ID}`
3. Masukkan ke `.env` sebagai `GOOGLE_DRIVE_FOLDER_ID`

### 3. Generate Refresh Token (untuk server-side upload)

```bash
cd /var/www/timeflow/backend
npm run gdrive:auth
```

Ikuti URL yang muncul di terminal, login dengan Google account, copy authorization code, paste kembali ke terminal. Refresh token akan tersimpan otomatis ke `.env`.

> **Note:** Pastikan akun Google memiliki permission write access ke folder Drive tersebut.

---

## Konfigurasi Firebase FCM

### 1. Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru
3. Pergi ke **Project Settings > Service Accounts**
4. Klik **Generate New Private Key**
5. Download JSON file, extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (ganti newline dengan `\n`)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 2. Web Push Certificates (untuk frontend)

1. Firebase Console > Project Settings > Cloud Messaging
2. Scroll ke **Web Push Certificates**
3. Klik **Generate Key Pair**
4. Copy **Public Key** (VAPID key) — digunakan di frontend untuk subscribe push notification

### 3. Frontend FCM Setup

Tambahkan konfigurasi Firebase di frontend (jika belum ada):

```javascript
// src/services/fcm.js
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export async function requestNotificationPermission() {
  try {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_PUBLIC_KEY',
    })
    if (token) {
      // Kirim token ke backend
      await api.post('/fcm/register', { token })
      return token
    }
  } catch (err) {
    console.error('FCM permission denied:', err)
  }
}

onMessage(messaging, (payload) => {
  console.log('Message received:', payload)
})
```

---

## PWA & Instalasi Mobile

### Fitur PWA

- **Installable** — Bisa di-add ke home screen Android/iOS
- **Offline Support** — Precache assets via Workbox service worker
- **Standalone Mode** — Berjalan fullscreen tanpa browser chrome
- **Auto-Update** — Service worker auto-update saat ada versi baru

### Cara Install di Android (Chrome)

1. Buka `https://timeflow.yourdomain.com` di Chrome
2. Tap menu (⋮) → **Add to Home screen**
3. Tap **Install**
4. Aplikasi akan muncul di launcher dengan icon TimeFlow

### Cara Install di iOS (Safari)

1. Buka `https://timeflow.yourdomain.com` di Safari
2. Tap **Share** (ikon kotak dengan panah ke atas)
3. Scroll ke bawah, tap **Add to Home Screen**
4. Tap **Add**

### Cara Install di Desktop (Chrome/Edge)

1. Buka website
2. Klik icon **install** (monitor dengan panah) di address bar
3. Klik **Install**

---

## Variabel Environment

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Connection string PostgreSQL |
| `GOOGLE_OAUTH_CLIENT_ID` | Yes | Google OAuth Client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Yes | Google OAuth Client Secret |
| `GOOGLE_OAUTH_REDIRECT_URI` | Yes | OAuth callback URL (https) |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | Yes | Refresh token untuk server-side Drive upload |
| `GOOGLE_DRIVE_FOLDER_ID` | Yes | Target folder di Google Drive |
| `FIREBASE_PROJECT_ID` | No | Firebase project ID (untuk FCM) |
| `FIREBASE_PRIVATE_KEY` | No | Firebase service account private key |
| `FIREBASE_CLIENT_EMAIL` | No | Firebase service account email |
| `NODE_ENV` | Yes | `production` |
| `API_PORT` | Yes | Port backend (3000) |
| `API_HOST` | Yes | Bind address (`127.0.0.1`) |
| `JWT_SECRET` | Yes | Secret key untuk JWT signing |
| `FRONTEND_DIST_PATH` | Yes | Path ke folder `frontend/dist` |
| `FCM_SCHEDULER_ENABLED` | No | Aktifkan daily reminder (`true`/`false`) |
| `FCM_REMINDER_HOUR` | No | Jam pengiriman reminder (default: 17) |
| `FCM_REMINDER_MINUTE` | No | Menit pengiriman reminder (default: 0) |

### Frontend (`frontend/.env.production`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Base URL backend API (https://domain/api) |

---

## Troubleshooting

### Backend tidak bisa start

```bash
# Check log
pm2 logs timeflow-api
# atau
sudo journalctl -u timeflow -f
```

### Database connection error

```bash
# Test koneksi
psql postgresql://timeflow_user:password@localhost/timeflow_db

# Check PostgreSQL status
sudo systemctl status postgresql

# Check listen address
sudo -u postgres psql -c "SHOW listen_addresses;"
```

### Nginx 502 Bad Gateway

```bash
# Check backend running
curl http://127.0.0.1:3000/health

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Verify Nginx config
sudo nginx -t
```

### Google Drive upload gagal

1. Pastikan `GOOGLE_DRIVE_REFRESH_TOKEN` valid
2. Jalankan ulang `npm run gdrive:auth` untuk refresh token baru
3. Verifikasi folder ID benar dan akun memiliki write access
4. Check quota Google Drive API di Google Cloud Console

### PWA tidak bisa install

1. Pastikan manifest.webmanifest accessible: `curl https://yourdomain.com/manifest.webmanifest`
2. Pastikan service worker registered (cek di DevTools > Application > Service Workers)
3. Pastikan HTTPS aktif (PWA requires HTTPS kecuali localhost)
4. Cek Lighthouse audit di Chrome DevTools

### CORS error di frontend

Pastikan `FRONTEND_URL` di backend `.env` sesuai dengan domain yang diakses:

```env
FRONTEND_URL=https://timeflow.yourdomain.com
```

---

## Maintenance & Update

### Update Aplikasi

```bash
cd /var/www/timeflow
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart timeflow-api

# Update frontend
cd ../frontend
npm install
npm run build

# Clear browser cache (user harus refresh 2x untuk dapat PWA update terbaru)
```

### Backup Database

```bash
# Manual backup
sudo -u postgres pg_dump timeflow_db > /backups/timeflow_$(date +%Y%m%d_%H%M%S).sql

# Auto backup via cron (daily)
0 2 * * * sudo -u postgres pg_dump timeflow_db | gzip > /backups/timeflow_$(date +\%Y\%m\%d).sql.gz
```

### Backup File Uploads (jika ada local uploads)

```bash
rsync -avz /var/www/timeflow/backend/uploads/ /backups/uploads/
```

### Monitoring

```bash
# PM2 status
pm2 status
pm2 monit

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL log
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Restart Services

```bash
# Restart backend
pm2 restart timeflow-api
# atau
sudo systemctl restart timeflow

# Restart Nginx
sudo systemctl reload nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 📄 License

Private / Personal Use

## 👤 Author

Development Team

---

**Catatan:** Jangan lupa mengganti semua placeholder (`yourdomain.com`, password, secret key, token) dengan nilai aktual sebelum deploy ke production.
