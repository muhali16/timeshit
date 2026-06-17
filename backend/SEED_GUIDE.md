# Database Seeding Guide

## Overview
Repository ini memiliki dua script seeding:
1. **`db:seed`** - Basic seed dengan beberapa entries sample
2. **`db:seed:3months`** - Comprehensive seed dengan 3 bulan data realistische

## Quick Start

### User Selection
Kedua script membutuhkan Anda untuk memilih user yang akan di-seed:

#### Option 1: Interactive Mode (Terminal/TTY)
```bash
cd backend
npm run db:seed:3months
```
Akan menampilkan list user yang tersedia dan Anda bisa pilih nomor atau buat user baru.

#### Option 2: Environment Variable (Non-Interactive)
```bash
cd backend
SEED_USER_ID=<user-id> npm run db:seed:3months
```
Contoh:
```bash
SEED_USER_ID=a90113a9-546e-4f17-a18c-af200840b054 npm run db:seed:3months
```

#### Option 3: CLI Argument (Non-Interactive)
```bash
cd backend
npm run db:seed:3months -- --user-id=<user-id>
```
Contoh:
```bash
npm run db:seed:3months -- --user-id=a90113a9-546e-4f17-a18c-af200840b054
```

### Run Basic Seed
```bash
npm run db:seed -- --user-id=<user-id>
# atau
SEED_USER_ID=<user-id> npm run db:seed
```
Menghasilkan:
- ~8 timesheet entries untuk demo
- Evidence files untuk beberapa entries

### Run 3-Month Comprehensive Seed
```bash
npm run db:seed:3months -- --user-id=<user-id>
# atau
SEED_USER_ID=<user-id> npm run db:seed:3months
```
Menghasilkan data untuk 3 bulan ke belakang dari hari ini (17 Juni 2026):
- Timesheet entries untuk setiap working day (exclude weekend)
- National holidays & absence entries
- Absence reasons (Cuti Tahunan, Sakit, Izin Pribadi)
- Some evidence files (30% dari entries)

## Daftar Available Users

Jalankan script tanpa `--user-id` untuk melihat daftar user yang tersedia:
```bash
npm run db:seed:3months
```
Output:
```
Available users:
  3ad53b35-501c-495b-b614-df5d74710964 - admin@timeflow.app (Admin User)
  a90113a9-546e-4f17-a18c-af200840b054 - muhammadali55214@gmail.com (Muhammad Ali Mustaqim)
  51262948-e5b3-4172-9f7c-33c9a22c0024 - muhammadali55214.mri@gmail.com (Muhammad Ali Mustaqim MRI)
```

## Features dari `seed-timesheet-3months.js`

### ✅ Smart Date Generation
- **Excludes Weekends**: Hanya generate data untuk hari Senin-Jumat
- **Excludes National Holidays**: Otomatis check `national_holidays` table
- **3 Month Range**: Dari 17 Maret 2026 hingga 17 Juni 2026

### ✅ Realistic Data
- Multiple activities untuk variasi
- Multiple locations (Jakarta, Remote, Surabaya, Bandung, etc)
- Satu hari = satu row entry (08:00 - 17:00 dengan 60 menit break)
- Random evidence files (30% dari entries)

### ✅ Absence Management
- Automatic absence entries untuk semua national holidays
- Random absence entries (Cuti/Sakit/Izin) untuk 2% working days
- Proper absence reasons tracking

### ✅ Database Safety
- Uses `ON CONFLICT DO NOTHING` untuk prevent duplicates
- Transaction-based dengan ROLLBACK on error
- Proper error handling dan logging

## Database Schema Impact

### Tables Modified
- `users` - Creates test user if doesn't exist
- `timesheets` - Inserts 90 entries (approx)
- `absence_entries` - Inserts 26 entries (approx)
- `absence_reasons` - Creates 4 absence types

### Sample Output
```
Generating working dates from 2026-03-17 to 2026-06-17
Total working dates (excluding weekends and holidays): 54
Inserted 90 timesheet entries
Inserted 26 absence entries
National holidays: 25
```

## Customization

Edit `seed-timesheet-3months.js` untuk mengubah:

### Activities (baris ~10)
```javascript
const activities = [
  'Your custom activity...',
  // ...
];
```

### Locations (baris ~20)
```javascript
const locations = [
  'Your location...',
  // ...
];
```

### Absence Reasons (baris ~30)
```javascript
const absenceReasons = [
  { name: 'Custom Reason', color: '#hexcolor' },
  // ...
];
```

### Absence Probability (baris ~165)
```javascript
.filter(() => Math.random() > 0.95) // Change 0.95 untuk mengubah frequency
```

## Data Distribution

Typical output untuk 3 bulan:
- **Working Days**: ~54 hari (excludes 25+ holidays + weekends)
- **Timesheet Entries**: ~54 (satu per hari)
- **Evidence Files**: ~16 (30% dari entries)
- **Absence Entries**: ~26 (25 holidays + 1-2 manual absences)

## Note

- User email: `admin@timeflow.app` (default)
- National holidays dari database `national_holidays` table
- Timezone default: `Asia/Jakarta`
- All dates: `YYYY-MM-DD` format (PostgreSQL DATE type)

## Troubleshooting

### "database connection failed"
Pastikan `.env` sudah setup dengan `DATABASE_URL` yang benar:
```bash
cat backend/.env
```

### "national_holidays table is empty"
Script masih berjalan (akan membuat absence entries kosong untuk holidays). 
Pastikan sudah run migrations terlebih dahulu:
```bash
npm run db:migrate
```

### Data tidak terlihat di app
- Pastikan backend sudah restart: `npm run dev`
- Check network tab di DevTools
- Verifikasi user ID matches between seed output dan app
