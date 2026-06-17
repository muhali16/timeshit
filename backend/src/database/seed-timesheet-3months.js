require('dotenv').config();

const { Pool } = require('pg');
const { getUserSelection } = require('./seed-utils');

// Sample activities untuk variasi
const activities = [
  'Meeting dengan stakeholder proyek A, diskusikan timeline dan resource allocation',
  'Development fitur authentication module, code review dengan tim',
  'Bug fixing pada API endpoint timesheet, testing integration dengan frontend',
  'Dokumentasi teknis dan update README, deploy ke staging environment',
  'Sprint planning mingguan, estimasi story points untuk tasks baru',
  'Presentasi progress proyek kepada klien, demo fitur dashboard analytics',
  'Gathering requirements untuk phase 2, diskusi teknis dengan tim klien',
  'Full day development: implementasi export Excel, integrasi Google Drive API',
  'Database optimization dan query performance tuning',
  'Unit testing dan integration testing untuk modul reporting',
  'Code review untuk PR dari tim junior developer',
  'Planning sesi untuk quarter next roadmap',
  'Troubleshooting production issue dan rollback preparation',
  'Training session untuk new team member onboarding',
  'Improvement dokumentasi dan knowledge sharing session',
];

const locations = [
  'Kantor Pusat - Jakarta',
  'Remote - Rumah',
  'Kantor Cabang - Surabaya',
  'Klien - Bandung',
  'Meeting Room B - Jakarta',
  'Coworking Space - Jakarta',
];

const absenceReasons = [
  { name: 'Cuti Tahunan', color: '#3b82f6' },
  { name: 'Sakit', color: '#ef4444' },
  { name: 'Izin Pribadi', color: '#f59e0b' },
  { name: 'Hari Libur Nasional', color: '#8b5cf6' },
];

// Fungsi untuk mendapatkan hari dalam minggu (0=Minggu, 1=Senin, dst)
function getDayOfWeek(date) {
  return date.getDay();
}

// Fungsi untuk cek apakah tanggal adalah weekend
function isWeekend(date) {
  const day = getDayOfWeek(date);
  return day === 0 || day === 6; // 0 = Minggu, 6 = Sabtu
}

// Fungsi untuk generate tanggal dalam range
function generateWorkingDates(startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    if (!isWeekend(current)) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Fungsi untuk format tanggal ke YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Fungsi untuk generate time sheets - satu hari satu row
function generateTimesheetEntries(workingDates) {
  const entries = [];

  workingDates.forEach((date) => {
    const dateStr = formatDate(date);
    const location = locations[Math.floor(Math.random() * locations.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];

    // Satu entry per hari - full day
    entries.push({
      entry_date: dateStr,
      start_time: '08:00',
      end_time: '17:00',
      location: location,
      activity: activity,
      break_minutes: 60,
    });
  });

  return entries;
}

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    // Get user selection dari user
    const userId = await getUserSelection(client);

    await client.query('BEGIN');

    // Get national holidays dari database
    const holidayResult = await client.query(
      `SELECT date::text as date FROM national_holidays ORDER BY date`
    );
    const nationalHolidayDates = new Set(
      holidayResult.rows.map((row) => row.date)
    );
    console.log(`Found ${nationalHolidayDates.size} national holidays`);

    // Generate working dates: 3 bulan ke belakang dari hari ini (17 Juni 2026)
    const today = new Date('2026-06-17');
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    console.log(
      `Generating working dates from ${formatDate(threeMonthsAgo)} to ${formatDate(today)}`
    );

    const workingDates = generateWorkingDates(threeMonthsAgo, today).filter(
      (date) => !nationalHolidayDates.has(formatDate(date))
    );

    console.log(`Total working dates (excluding weekends and holidays): ${workingDates.length}`);

    // Insert or skip absence reasons
    const reasonMap = {};
    for (const reason of absenceReasons) {
      const reasonResult = await client.query(
        `INSERT INTO absence_reasons (user_id, name, color)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [userId, reason.name, reason.color]
      );

      if (reasonResult.rows.length > 0) {
        reasonMap[reason.name] = reasonResult.rows[0].id;
        console.log(`Created absence reason: ${reason.name}`);
      } else {
        // Jika sudah ada, ambil ID-nya
        const existingReason = await client.query(
          `SELECT id FROM absence_reasons WHERE user_id = $1 AND name = $2`,
          [userId, reason.name]
        );
        if (existingReason.rows.length > 0) {
          reasonMap[reason.name] = existingReason.rows[0].id;
        }
      }
    }

    // Insert timesheet entries
    const timesheetEntries = generateTimesheetEntries(workingDates);
    console.log(`Inserting ${timesheetEntries.length} timesheet entries...`);

    let timesheetCount = 0;
    for (const entry of timesheetEntries) {
      const tsResult = await client.query(
        `INSERT INTO timesheets (user_id, entry_date, start_time, end_time, location, activity, break_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          userId,
          entry.entry_date,
          entry.start_time,
          entry.end_time,
          entry.location,
          entry.activity,
          entry.break_minutes,
        ]
      );

      if (tsResult.rows.length > 0) {
        timesheetCount++;
        // Occasional evidence files (30% dari entries)
        if (Math.random() > 0.7) {
          const fileTypes = [
            { name: 'meeting-notes.pdf', type: 'application/pdf' },
            { name: 'screenshot.png', type: 'image/png' },
            { name: 'progress-report.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
          ];
          const file = fileTypes[Math.floor(Math.random() * fileTypes.length)];

          await client.query(
            `INSERT INTO evidence_files (timesheet_id, file_name, file_size, file_type, google_drive_url)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              tsResult.rows[0].id,
              file.name,
              Math.floor(Math.random() * 500000) + 50000,
              file.type,
              `https://drive.google.com/file/d/dummy-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            ]
          );
        }
      }
    }
    console.log(`Inserted ${timesheetCount} timesheet entries`);

    // Insert absence entries untuk tanggal yang bukan working day dan bukan holiday
    // Plus beberapa absence di working days untuk variasi
    const allDates = [];
    let current = new Date(threeMonthsAgo);
    while (current <= today) {
      allDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    console.log('Inserting absence entries for holidays and some random working days...');
    let absenceCount = 0;

    // 1. Insert absence untuk national holidays
    for (const dateStr of nationalHolidayDates) {
      const holidayDetails = await client.query(
        `SELECT name FROM national_holidays WHERE date = $1`,
        [dateStr]
      );

      if (holidayDetails.rows.length > 0) {
        const absResult = await client.query(
          `INSERT INTO absence_entries (user_id, entry_date, is_national_holiday, holiday_name)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [userId, dateStr, true, holidayDetails.rows[0].name]
        );

        if (absResult.rows.length > 0) {
          absenceCount++;
        }
      }
    }

    // 2. Insert absence untuk beberapa working days (simulating sick leave, annual leave)
    const absenceWorkingDates = workingDates
      .filter(() => Math.random() > 0.95) // 5% dari working days
      .slice(0, Math.floor(workingDates.length * 0.02)); // Max 2% dari total

    for (const date of absenceWorkingDates) {
      const dateStr = formatDate(date);
      const reasonNames = Object.keys(reasonMap).filter((r) => r !== 'Hari Libur Nasional');
      const selectedReason =
        reasonNames[Math.floor(Math.random() * reasonNames.length)];
      const reasonId = reasonMap[selectedReason];

      const absResult = await client.query(
        `INSERT INTO absence_entries (user_id, entry_date, reason_id, notes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [userId, dateStr, reasonId, `${selectedReason}`]
      );

      if (absResult.rows.length > 0) {
        absenceCount++;
      }
    }

    console.log(`Inserted ${absenceCount} absence entries`);

    await client.query('COMMIT');
    console.log('\n✅ Seed data inserted successfully!');
    console.log(`Summary:`);
    console.log(`  - User ID: ${userId}`);
    console.log(`  - Timesheet entries: ${timesheetCount}`);
    console.log(`  - Absence entries: ${absenceCount}`);
    console.log(`  - National holidays: ${nationalHolidayDates.size}`);
    console.log(`  - Working days covered: ${workingDates.length}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
