const fetch = require('node-fetch');
const { eq, and, desc } = require('drizzle-orm');
const { db } = require('../database/connection');
const { nationalHolidays } = require('../database/schema');

const LIBUR_API_URL = 'https://libur.deno.dev/api';

class HolidayController {
  async listHolidays(req, reply) {
    const { year } = req.query;
    let conditions = [];
    if (year) {
      conditions.push(eq(nationalHolidays.year, parseInt(year)));
    }
    const rows = conditions.length > 0
      ? await db.select().from(nationalHolidays).where(and(...conditions)).orderBy(desc(nationalHolidays.date))
      : await db.select().from(nationalHolidays).orderBy(desc(nationalHolidays.date));
    return reply.send({ success: true, data: rows });
  }

  async syncFromApi(req, reply) {
    try {
      const response = await fetch(LIBUR_API_URL, { timeout: 15000 });
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const holidays = await response.json();

      let inserted = 0;
      let skipped = 0;

      for (const h of holidays) {
        if (!h.date || !h.name) continue;
        const year = parseInt(h.date.split('-')[0]);
        const exists = await db.select().from(nationalHolidays)
          .where(eq(nationalHolidays.date, h.date))
          .limit(1);

        if (exists.length === 0) {
          await db.insert(nationalHolidays).values({
            date: h.date,
            name: h.name,
            isNationalHoliday: h.is_national_holiday !== false,
            year,
            source: 'api',
          });
          inserted++;
        } else {
          skipped++;
        }
      }

      return reply.send({
        success: true,
        message: `Sinkronisasi selesai: ${inserted} ditambahkan, ${skipped} dilewati (sudah ada)`,
        data: { inserted, skipped, total: holidays.length },
      });
    } catch (err) {
      return reply.status(500).send({
        success: false,
        message: 'Gagal sinkronisasi dari API: ' + err.message,
      });
    }
  }

  async uploadExcel(req, reply) {
    return reply.status(501).send({
      success: false,
      message: 'Upload Excel hari libur belum diimplementasikan. Gunakan tombol Sync dari API.',
    });
  }

  async deleteHoliday(req, reply) {
    const { id } = req.params;
    await db.delete(nationalHolidays).where(eq(nationalHolidays.id, id));
    return reply.send({ success: true, message: 'Hari libur berhasil dihapus' });
  }
}

module.exports = new HolidayController();
