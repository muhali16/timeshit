# Timesheet App Project Brief

**Project Name:** TimeFlow  
**Status:** MVP Development  
**Stack:** Vue.js 3 + Fastify + PostgreSQL + Drizzle ORM + Firebase Cloud Messaging (FCM)  
**Timeline:** 6-8 weeks  
**Scope:** Personal use (single user) with PWA support for mobile installation and future native mobile expansion via Capacitor

---

## 📋 Executive Summary

TimeFlow adalah aplikasi timesheet modern yang memungkinkan user untuk mencatat jam kerja dengan detail aktivitas, lokasi, dan bukti (evidence) berupa file yang auto-upload ke Google Drive. Aplikasi ini dilengkapi dengan dashboard real-time untuk melihat insights jam kerja per hari, export ke Excel dengan format tertentu, dan notifikasi push untuk reminder mengisi timesheet.

**Key Differentiator:** Full-stack solution dengan modern UX (Vue.js dark mode) + robust backend (Fastify) + scalable ke mobile app (Capacitor) nanti.

---

## 🎯 Core Features

### 1. **Timesheet Entry Form**
- **Input Fields:**
  - Tanggal (date picker)
  - Waktu mulai (time picker)
  - Waktu akhir (time picker)
  - Lokasi (text input dengan autocomplete)
  - Aktivitas/Deskripsi (textarea)
  - Evidence files (multiple file upload - supports PDF, images, documents)

- **Behavior:**
  - Form bisa di-submit kapan saja (same day atau past dates)
  - Validasi otomatis: end_time > start_time, semua field required
  - Multiple files bisa di-upload sekaligus
  - Progress indicator untuk upload proses
  - Success notification setelah berhasil submit

- **UI/UX:**
  - Dark mode by default (Tailwind CSS)
  - Responsive design untuk mobile (90% width pada mobile)
  - Clear visual hierarchy dengan icons
  - Smooth transitions dan loading states
  - Error messages yang helpful

### 2. **Dashboard & Insights**
- **Daily View:**
  - Total jam kerja hari ini (calculated realtime)
  - Breakdown per aktivitas (bar chart atau list)
  - Lokasi yang paling sering dikunjungi
  - Evidence count per hari

- **Weekly/Monthly View:**
  - Chart menunjukkan total jam per hari (line/bar chart)
  - Weekly total hours
  - Monthly statistics
  - Trend analysis (avg hours per day)

- **Visualization:**
  - Use Recharts library untuk charts
  - Color-coded activities
  - Smooth animations saat data update
  - Responsive chart sizing

### 3. **Excel Export Functionality**
- **Export Format:**
  - Sheet dengan columns: Date, Start Time, End Time, Duration, Location, Activity, Evidence Count
  - Header dengan summary: Total Hours, Average Daily Hours, Date Range
  - Formatting: Bold headers, alternating row colors, frozen header row
  - Font: Arial 11, proper date/time formatting

- **Triggers:**
  - Export button di dashboard (generate untuk date range tertentu)
  - Default: export current month
  - Option untuk custom date range
  - Download otomatis sebagai .xlsx file

### 4. **Push Notifications (FCM)**
- **Reminder Logic:**
  - Scheduler job setiap hari pada jam tertentu (default: 5 PM)
  - Check apakah user sudah input timesheet hari ini
  - Jika belum: kirim FCM notification

- **Notification Content:**
  - Title: "Timesheet Reminder"
  - Body: "Jangan lupa catat jam kerja hari ini!"
  - Action: Click → buka app ke timesheet form
  - Badge count menunjukkan pending reminders

- **User Registration:**
  - Saat pertama kali buka app: request FCM permission
  - Store device token di database
  - Option di settings untuk disable notifications

### 5. **Google Drive Integration**
- **File Upload:**
  - Evidence files di-upload langsung ke Google Drive folder khusus
  - Folder structure: /TimeFlow/Timesheet/YYYY/MM/DD/
  - Simpan file URL di database untuk reference

- **Permissions:**
  - Use Google Service Account (recommended untuk server-side upload)
  - Atau OAuth 2.0 jika ingin user access

### 6. **Settings & User Profile**
- **Settings Options:**
  - Timezone preference
  - Notification schedule (on/off, time)
  - Dark mode toggle (optional, set to always on untuk MVP)
  - Working hours default (untuk validasi)
  - Google Drive folder selection

- **Profile:**
  - User name
  - Email
  - Avatar (optional)
  - Account creation date

---

## 🏗️ Technical Architecture

### **Frontend (Vue.js 3)**
```
src/
├── components/
│   ├── Timesheet/
│   │   ├── TimesheetForm.vue (main entry form)
│   │   ├── FileUploadZone.vue (drag-drop file upload)
│   │   └── TimeValidation.vue (time input component)
│   ├── Dashboard/
│   │   ├── DailyInsights.vue (today's summary)
│   │   ├── WeeklyChart.vue (week overview)
│   │   ├── MonthlyChart.vue (month overview)
│   │   └── ActivityBreakdown.vue (activity list/chart)
│   ├── Common/
│   │   ├── Navigation.vue (top nav)
│   │   ├── Sidebar.vue (if needed)
│   │   ├── LoadingSpinner.vue
│   │   └── ErrorNotification.vue
│   └── Settings/
│       └── SettingsPanel.vue
├── views/
│   ├── Home.vue (dashboard)
│   ├── Timesheet.vue (form page)
│   ├── History.vue (past entries list)
│   ├── Export.vue (export interface)
│   └── Settings.vue
├── stores/
│   ├── timesheetStore.js (pinia)
│   ├── authStore.js
│   └── notificationStore.js
├── services/
│   ├── api.js (axios instance)
│   ├── fileUpload.js (handle file uploads)
│   ├── fcm.js (FCM registration)
│   └── utils.js (helpers)
├── styles/
│   ├── globals.css (tailwind + custom)
│   └── variables.css (theme colors)
├── App.vue
└── main.js
```

**Dependencies:**
- `vue@3`
- `vue-router@4` (hash history for PWA offline support)
- `pinia` (state management)
- `axios` (HTTP client)
- `tailwindcss` (styling)
- `recharts` (charts)
- `firebase/app` + `firebase/messaging` (FCM)
- `vite` (build tool)
- `vite-plugin-pwa` (PWA support: service worker, manifest, offline caching)

### **Backend (Fastify + Node.js)**
```
src/
├── routes/
│   ├── auth.js (register, login - optional untuk MVP)
│   ├── timesheet.js (CRUD timesheet entries)
│   ├── export.js (generate & download excel)
│   ├── upload.js (handle file uploads to GDrive)
│   ├── fcm.js (register device tokens, send notifications)
│   └── dashboard.js (analytics endpoints)
├── controllers/
│   ├── timesheetController.js
│   ├── exportController.js
│   ├── uploadController.js
│   └── dashboardController.js
├── services/
│   ├── timesheetService.js
│   ├── excelService.js (generate xlsx)
│   ├── googleDriveService.js (handle GDrive upload)
│   ├── fcmService.js (send notifications)
│   └── schedulerService.js (cron jobs)
├── middleware/
│   ├── errorHandler.js
│   ├── auth.js (JWT verification)
│   ├── validation.js (input validation)
│   └── cors.js
├── database/
│   ├── schema.js (Drizzle schema)
│   ├── migrations/ (database migrations)
│   └── connection.js (DB setup)
├── utils/
│   ├── logger.js
│   ├── constants.js
│   └── helpers.js
├── jobs/
│   └── notificationScheduler.js (cron for FCM reminders)
├── config/
│   ├── database.js
│   ├── firebase.js
│   ├── googleDrive.js
│   └── env.example
├── app.js (main Fastify setup)
└── server.js (entry point)
```

**Dependencies:**
- `fastify@4.x`
- `@fastify/jwt` (authentication)
- `@fastify/cors` (CORS handling)
- `@fastify/multipart` (file upload)
- `@fastify/helmet` (security headers)
- `@fastify/static` (serve built frontend PWA files)
- `drizzle-orm` (ORM)
- `pg` (PostgreSQL driver)
- `node-cron` (scheduler)
- `googleapis` (Google Drive API)
- `firebase-admin` (FCM)
- `exceljs` (generate Excel)
- `zod` (validation)
- `dotenv` (env variables)

### **Database (PostgreSQL + Drizzle ORM)**
```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  notification_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '17:00:00',
  fcm_token VARCHAR(500),
  google_drive_folder_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timesheets Table
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  activity VARCHAR(500),
  duration_minutes INT GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time))::INT / 60
  ) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entry_date, start_time, end_time)
);

-- Evidence Files Table
CREATE TABLE evidence_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  file_type VARCHAR(50),
  google_drive_file_id VARCHAR(255),
  google_drive_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FCM Tokens Table
CREATE TABLE fcm_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_token VARCHAR(500) UNIQUE NOT NULL,
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **API Endpoints**

**Base URL:** `http://localhost:3000/api`

**Timesheet Endpoints:**
- `POST /timesheet` - Create new entry
  - Body: `{ entry_date, start_time, end_time, location, activity, files[] }`
  - Response: `{ success: true, data: { id, duration_minutes, ... } }`

- `GET /timesheet?date_from=&date_to=&limit=50` - List entries
  - Query params: date range, pagination
  - Response: `{ success: true, data: [...], total: N, page: 1 }`

- `PUT /timesheet/:id` - Update entry
  - Body: `{ start_time?, end_time?, location?, activity? }`
  - Response: `{ success: true, data: { ... } }`

- `DELETE /timesheet/:id` - Delete entry
  - Response: `{ success: true, message: "Deleted" }`

**Dashboard Endpoints:**
- `GET /dashboard/daily` - Today's summary
  - Response: `{ total_hours, entries_count, activity_breakdown: {} }`

- `GET /dashboard/weekly` - Weekly overview
  - Response: `{ daily_breakdown: [...], total_hours, avg_hours }`

- `GET /dashboard/monthly` - Monthly statistics
  - Response: `{ daily_breakdown: [...], total_hours, avg_hours, trend: [...] }`

**Export Endpoint:**
- `GET /export/excel?date_from=&date_to=` - Generate Excel
  - Response: Excel file (binary)
  - Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Upload Endpoint:**
- `POST /upload` - Upload evidence files
  - Body: FormData dengan files[] array
  - Response: `{ success: true, files: [{ file_id, url, ... }] }`

**FCM Endpoints:**
- `POST /fcm/register` - Register device token
  - Body: `{ token, device_name? }`
  - Response: `{ success: true, registered: true }`

- `POST /fcm/unregister` - Unregister device token
  - Body: `{ token }`
  - Response: `{ success: true, unregistered: true }`

---

## 🎨 UI/UX Design Guidelines

### **Color Palette (Tailwind CSS)**
```css
/* Dark Mode (Default) */
--bg-primary: #0f172a (slate-950)
--bg-secondary: #1e293b (slate-900)
--bg-tertiary: #334155 (slate-700)
--text-primary: #f1f5f9 (slate-100)
--text-secondary: #cbd5e1 (slate-300)
--text-tertiary: #94a3b8 (slate-400)
--accent: #3b82f6 (blue-500)
--accent-hover: #2563eb (blue-600)
--success: #10b981 (emerald-500)
--warning: #f59e0b (amber-500)
--danger: #ef4444 (red-500)
--border: #475569 (slate-600)
```

### **Typography**
- **Display/Headings:** -
- **Body:** Tailwind default (sans-serif)
- **Monospace:** For timestamps, duration displays

### **Component Styling**
- **Form Inputs:** Rounded corners (rounded-lg), subtle border, focus ring blue
- **Buttons:** Primary (blue), Secondary (slate), Danger (red)
- **Cards:** Rounded corners, subtle shadow, hover effect
- **Charts:** Recharts default colors, adapts to dark mode
- **Transitions:** All 200ms ease-in-out

### **Layout**
- **Desktop:** Max-width 1200px, sidebar or top nav
- **Mobile:** Full width, bottom nav, single column
- **Spacing:** Use Tailwind spacing scale (px-4, py-2, etc.)

### **Accessibility**
- WCAG 2.1 AA compliant
- Proper alt text untuk images
- Color contrast ratio ≥ 4.5:1
- Keyboard navigation support
- ARIA labels untuk interactive elements

---

## 🔐 Security & Authentication

### **MVP Phase (Simple Auth):**
- Single user mode dengan API key atau simple token
- Environment variable untuk credentials
- No user management (skip untuk MVP)

### **Future Phase:**
- JWT-based authentication
- User registration/login
- Rate limiting per user
- Data encryption at rest

### **Google Drive & FCM:**
- Use Service Account para sa server-side operations
- Store credentials sa secure environment variables
- Validate file types sebelum upload (whitelist)
- Implement file size limits (max 50MB per file)

---

## 📱 PWA Configuration

### **PWA Setup (vite-plugin-pwa)**
- **Manifest:** Auto-generated `manifest.webmanifest` dengan icons multi-size (72x72 sampai 512x512) termasuk maskable icons untuk Android adaptive icons.
- **Service Worker:** `generateSW` mode menggunakan Workbox untuk precache assets dan runtime caching.
- **Router:** Menggunakan `createWebHashHistory` untuk kompatibilitas offline dan static file serving.
- **Backend Serving:** Fastify dilengkapi `@fastify/static` untuk serve built frontend files dari `dist/` folder dengan SPA fallback (index.html untuk semua non-API routes).

### **PWA Meta Tags (index.html)**
- `theme-color`: `#0f172a` (dark mode)
- `apple-mobile-web-app-capable`: yes
- `apple-mobile-web-app-status-bar-style`: `black-translucent`
- `viewport`: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`
- `apple-touch-icon`: `/icons/icon-192x192.png`

### **Offline Support**
- Precache: Semua JS, CSS, HTML, SVG, PNG, WOFF2, dan JSON files di-precache oleh service worker.
- Runtime Caching: Google Fonts (api + gstatic) di-cache dengan `CacheFirst` strategy (1 tahun expiration).
- Navigation Fallback: Semua non-API navigation requests fallback ke `index.html` (SPA behavior).
- Denylist: `/api/*`, `/uploads/*`, `/internal/docs/*` tidak di-cache oleh service worker.

---

## 📊 Implementation Phases

### **Phase 1: Foundation (Week 1-2)**
- ✅ Project setup (Vue.js + Fastify + PostgreSQL)
- ✅ Database schema + migrations
- ✅ Basic API endpoints (create, list timesheet)
- ✅ Basic form component (without file upload)
- ✅ Authentication skeleton

**Deliverables:**
- Working backend server
- Basic frontend structure
- Database populated with test data

---

### **Phase 2: Core Features (Week 3-4)**
- ✅ Complete timesheet form (with file upload)
- ✅ Google Drive integration
- ✅ Basic dashboard (daily view)
- ✅ History/list view

**Deliverables:**
- Working timesheet entry flow
- Files uploaded to GDrive
- Basic dashboard with insights

---

### **Phase 3: Analytics & Export (Week 5)**
- ✅ Dashboard completion (weekly/monthly views)
- ✅ Excel export functionality
- ✅ Charts integration (Recharts)

**Deliverables:**
- Full dashboard with all views
- Excel export working

---

### **Phase 4: Notifications & Polish (Week 6)**
- ✅ FCM integration
- ✅ Notification scheduler (cron jobs)
- ✅ UI refinements
- ✅ Error handling & edge cases

**Deliverables:**
- Push notifications working
- Polish & bug fixes

---

### **Phase 5: Testing & Deployment (Week 7-8)**
- ✅ Unit tests (backend)
- ✅ E2E tests (critical flows)
- ✅ Performance optimization
- ✅ Deployment setup

**Deliverables:**
- Ready for production
- Deployment documentation

---

## 🔧 Development Guidelines

### **Code Style & Standards**
- **Frontend:** ESLint + Prettier (Vue)
- **Backend:** ESLint + Prettier (Node.js)
- **Git:** Conventional commits (feat:, fix:, docs:, etc.)
- **Branches:** feature/*, bugfix/*, release/*

### **Error Handling**
- Frontend: User-friendly error messages
- Backend: Detailed error logging, consistent error responses
- Database: Transaction handling, constraint violations

### **Performance Targets**
- Frontend load time: < 2s (initial)
- API response time: < 200ms (p95)
- Database queries: < 100ms (p95)
- Chart rendering: < 500ms

### **Testing Strategy**
- **Backend:** Unit tests untuk critical functions (50%+ coverage)
- **Frontend:** Component tests untuk form & charts
- **E2E:** Critical user flows (form submission, export)

---

## 📱 Future Enhancements (Post-MVP)

### **Mobile App (Capacitor)**
- Native mobile app wrapper untuk iOS/Android
- Offline mode dengan local storage
- Native file picker integration
- Push notification handling

### **Advanced Features**
- Multiple users/team timesheet tracking
- Approval workflows
- Detailed reporting & analytics
- Bulk import/export
- Time tracking automation
- Integration dengan Google Calendar
- Multiple timesheet templates

### **Infrastructure**
- Docker containerization
- CI/CD pipeline (GitHub Actions)
- Monitoring & logging
- Performance analytics

---

## 📚 Resources & References

### **Documentation:**
- [Vue.js 3 Documentation](https://vuejs.org/)
- [Fastify Documentation](https://www.fastify.io/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Google Drive API](https://developers.google.com/drive)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts Documentation](https://recharts.org/)

### **Libraries Reference:**
- [ExcelJS NPM Package](https://www.npmjs.com/package/exceljs)
- [Node-cron](https://www.npmjs.com/package/node-cron)
- [Zod Validation](https://zod.dev/)
- [Pinia State Management](https://pinia.vuejs.org/)

---

## 🚀 Getting Started

### **Quick Start Commands:**
```bash
# Clone repository
git clone <repo-url>
cd timeflow

# Backend setup
cd backend
npm install
cp .env.example .env
npx drizzle-kit push:pg
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api
```

### **Environment Variables (.env):**
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/timeflow

# Google Drive
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Firebase/FCM
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com

# App
NODE_ENV=development
API_PORT=3000
API_HOST=localhost
```

---

## ✅ Success Criteria

- ✅ Timesheet entries can be created dengan file upload
- ✅ Dashboard menunjukkan accurate daily/weekly/monthly insights
- ✅ Excel export works dengan proper formatting
- ✅ Push notifications terkirim & tested
- ✅ Files tersimpan di Google Drive dengan proper structure
- ✅ Dark mode UI smooth & responsive
- ✅ No major performance issues
- ✅ Error handling comprehensive

---

## 📝 Notes & Assumptions

1. **Single User MVP:** Tidak ada user registration/login untuk MVP phase
2. **Google Drive:** Menggunakan Service Account untuk upload (simpler setup)
3. **FCM:** Firebase Cloud Messaging untuk push notifications
4. **Database:** PostgreSQL locally untuk development, scalable untuk production
5. **Mobile:** Capacitor integration di future phase
6. **Timezone:** Default Asia/Jakarta, customizable di settings

---

**Last Updated:** May 2026  
**Author:** Development Team  
**Status:** Draft - Ready for Implementation