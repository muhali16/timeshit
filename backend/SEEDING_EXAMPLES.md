# Seeding Examples

## Kasus 1: Interactive Mode (Default)

```bash
cd backend
npm run db:seed:3months
```

Output (Pilih user #2):
```
📋 Database User Selection

Existing users:
  1. admin@timeflow.app (Admin User)
  2. muhammadali55214@gmail.com (Muhammad Ali Mustaqim)
  3. muhammadali55214.mri@gmail.com (Muhammad Ali Mustaqim MRI)

Select user number (or press Enter to create new): 2

✓ Selected: muhammadali55214@gmail.com

Found 25 national holidays
Total working dates: 54 hari
Inserted 54 timesheet entries
Inserted 26 absence entries

✅ Seed data inserted successfully!
```

---

## Kasus 2: Non-Interactive dengan Environment Variable

Berguna untuk automation/CI/CD scripts.

```bash
# Get available users
npm run db:seed:3months
# Output: a90113a9-546e-4f17-a18c-af200840b054 - muhammadali55214@gmail.com

# Seed dengan environment variable
SEED_USER_ID=a90113a9-546e-4f17-a18c-af200840b054 npm run db:seed:3months
```

---

## Kasus 3: Non-Interactive dengan CLI Argument

```bash
npm run db:seed:3months -- --user-id=a90113a9-546e-4f17-a18c-af200840b054
```

---

## Kasus 4: Create New User (Interactive Mode)

```bash
cd backend
npm run db:seed:3months
```

Output (Tekan Enter atau input invalid):
```
📋 Database User Selection

Existing users:
  1. admin@timeflow.app (Admin User)
  2. muhammadali55214@gmail.com (Muhammad Ali Mustaqim)

Select user number (or press Enter to create new): 

Creating new user...
Email: newuser@example.com
Name (optional): New Test User

✓ Created: newuser@example.com

Found 25 national holidays
Total working dates: 54 hari
Inserted 54 timesheet entries
...
```

---

## Kasus 5: Basic Seed with User Selection

```bash
# Interactive
npm run db:seed

# Non-interactive
SEED_USER_ID=a90113a9-546e-4f17-a18c-af200840b054 npm run db:seed
npm run db:seed -- --user-id=a90113a9-546e-4f17-a18c-af200840b054
```

---

## Quick Reference

| Use Case | Command |
|----------|---------|
| Interactive user selection | `npm run db:seed:3months` |
| With env var | `SEED_USER_ID=<id> npm run db:seed:3months` |
| With CLI arg | `npm run db:seed:3months -- --user-id=<id>` |
| List users | `npm run db:seed:3months` |
| Basic seed | `npm run db:seed -- --user-id=<id>` |

---

## Environment Variables

```bash
# Set user ID
export SEED_USER_ID=a90113a9-546e-4f17-a18c-af200840b054

# Now run any seed command
npm run db:seed:3months
npm run db:seed
```

---

## Troubleshooting

### "Non-interactive mode detected. Please specify a user:"
**Solusi:** 
- Gunakan env var: `SEED_USER_ID=<id> npm run db:seed:3months`
- Atau CLI arg: `npm run db:seed:3months -- --user-id=<id>`
- Atau jalankan di terminal interaktif (bukan piped input)

### "User ID not found"
**Solusi:**
- Copy paste user ID dari list yang ditampilkan
- Pastikan tidak ada spasi atau karakter tambahan

### Terlalu banyak data?
Edit `seed-timesheet-3months.js`:
```javascript
// Baris ~165 - kurangi absence probability
.filter(() => Math.random() > 0.95) // Change 0.95 ke 0.98 untuk lebih sedikit
```

### Ubah date range?
Edit `seed-timesheet-3months.js`:
```javascript
// Baris ~127 - ubah date range
const today = new Date('2026-06-17'); // Ubah ini
const threeMonthsAgo = new Date(today);
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3); // Ubah -3 ke -6 untuk 6 bulan
```
