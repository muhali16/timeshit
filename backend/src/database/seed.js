require('dotenv').config();

const { Pool } = require('pg');

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert dummy user
    const userResult = await client.query(
      `INSERT INTO users (email, name, timezone)
       VALUES ('admin@timeflow.app', 'Admin User', 'Asia/Jakarta')
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
    );
    const userId = userResult.rows[0].id;
    console.log('User ID:', userId);

    // Insert dummy timesheet entries
    const entries = [
      {
        entry_date: '2026-05-12',
        start_time: '08:00',
        end_time: '12:00',
        location: 'Kantor Pusat - Jakarta',
        activity: 'Meeting dengan stakeholder proyek A, diskusikan timeline dan resource allocation',
        duration_minutes: 240,
      },
      {
        entry_date: '2026-05-12',
        start_time: '13:00',
        end_time: '17:00',
        location: 'Kantor Pusat - Jakarta',
        activity: 'Development fitur authentication module, code review dengan tim',
        duration_minutes: 240,
      },
      {
        entry_date: '2026-05-13',
        start_time: '09:00',
        end_time: '12:30',
        location: 'Remote - Rumah',
        activity: 'Bug fixing pada API endpoint timesheet, testing integration dengan frontend',
        duration_minutes: 210,
      },
      {
        entry_date: '2026-05-13',
        start_time: '14:00',
        end_time: '18:00',
        location: 'Remote - Rumah',
        activity: 'Dokumentasi teknis dan update README, deploy ke staging environment',
        duration_minutes: 240,
      },
      {
        entry_date: '2026-05-14',
        start_time: '08:30',
        end_time: '12:00',
        location: 'Kantor Pusat - Jakarta',
        activity: 'Sprint planning mingguan, estimasi story points untuk tasks baru',
        duration_minutes: 210,
      },
      {
        entry_date: '2026-05-15',
        start_time: '09:00',
        end_time: '11:00',
        location: 'Klien - Surabaya',
        activity: 'Presentasi progress proyek kepada klien, demo fitur dashboard analytics',
        duration_minutes: 120,
      },
      {
        entry_date: '2026-05-15',
        start_time: '13:00',
        end_time: '16:30',
        location: 'Klien - Surabaya',
        activity: 'Gathering requirements untuk phase 2, diskusi teknis dengan tim klien',
        duration_minutes: 210,
      },
      {
        entry_date: '2026-05-16',
        start_time: '08:00',
        end_time: '17:00',
        location: 'Kantor Pusat - Jakarta',
        activity: 'Full day development: implementasi export Excel, integrasi Google Drive API',
        duration_minutes: 540,
      },
    ];

    for (const entry of entries) {
      const tsResult = await client.query(
        `INSERT INTO timesheets (user_id, entry_date, start_time, end_time, location, activity, duration_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [userId, entry.entry_date, entry.start_time, entry.end_time, entry.location, entry.activity, entry.duration_minutes]
      );

      if (tsResult.rows.length > 0) {
        const timesheetId = tsResult.rows[0].id;

        // Insert dummy evidence files for some entries
        if (entry.entry_date === '2026-05-12') {
          await client.query(
            `INSERT INTO evidence_files (timesheet_id, file_name, file_size, file_type, google_drive_url)
             VALUES ($1, $2, $3, $4, $5)`,
            [timesheetId, 'meeting-notes.pdf', 102400, 'application/pdf', 'https://drive.google.com/file/d/dummy1']
          );
          await client.query(
            `INSERT INTO evidence_files (timesheet_id, file_name, file_size, file_type, google_drive_url)
             VALUES ($1, $2, $3, $4, $5)`,
            [timesheetId, 'screenshot-discussion.png', 204800, 'image/png', 'https://drive.google.com/file/d/dummy2']
          );
        }

        if (entry.entry_date === '2026-05-15') {
          await client.query(
            `INSERT INTO evidence_files (timesheet_id, file_name, file_size, file_type, google_drive_url)
             VALUES ($1, $2, $3, $4, $5)`,
            [timesheetId, 'presentasi-slide.pptx', 512000, 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'https://drive.google.com/file/d/dummy3']
          );
        }

        console.log(`Created timesheet ${entry.entry_date} with ID ${timesheetId}`);
      }
    }

    await client.query('COMMIT');
    console.log('Seed data inserted successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
