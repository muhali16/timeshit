const { eq, and, gte, lte, desc } = require('drizzle-orm');
const { db } = require('../database/connection');
const { absenceReasons, absenceEntries, nationalHolidays } = require('../database/schema');

class AbsenceController {
  // === Absence Reasons ===
  async listReasons(req, reply) {
    const userId = req.userId;
    const rows = await db.select().from(absenceReasons)
      .where(eq(absenceReasons.userId, userId))
      .orderBy(absenceReasons.name);
    return reply.send({ success: true, data: rows });
  }

  async createReason(req, reply) {
    const userId = req.userId;
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return reply.status(400).send({ success: false, message: 'Nama alasan wajib diisi' });
    }
    const [record] = await db.insert(absenceReasons).values({
      userId,
      name: name.trim(),
      color: color || '#ef4444',
    }).returning();
    return reply.status(201).send({ success: true, data: record });
  }

  async updateReason(req, reply) {
    const userId = req.userId;
    const { id } = req.params;
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return reply.status(400).send({ success: false, message: 'Nama alasan wajib diisi' });
    }
    const [record] = await db.update(absenceReasons)
      .set({ name: name.trim(), color: color || '#ef4444' })
      .where(and(eq(absenceReasons.id, id), eq(absenceReasons.userId, userId)))
      .returning();
    if (!record) {
      return reply.status(404).send({ success: false, message: 'Alasan tidak ditemukan' });
    }
    return reply.send({ success: true, data: record });
  }

  async deleteReason(req, reply) {
    const userId = req.userId;
    const { id } = req.params;
    await db.delete(absenceReasons)
      .where(and(eq(absenceReasons.id, id), eq(absenceReasons.userId, userId)));
    return reply.send({ success: true, message: 'Alasan berhasil dihapus' });
  }

  // === Absence Entries ===
  async listEntries(req, reply) {
    const userId = req.userId;
    const { date_from, date_to } = req.query;
    let conditions = [eq(absenceEntries.userId, userId)];
    if (date_from) conditions.push(gte(absenceEntries.entryDate, date_from));
    if (date_to) conditions.push(lte(absenceEntries.entryDate, date_to));
    const rows = await db.query.absenceEntries.findMany({
      where: and(...conditions),
      with: { reason: true },
      orderBy: [desc(absenceEntries.entryDate)],
    });
    return reply.send({ success: true, data: rows });
  }

  async createEntry(req, reply) {
    const userId = req.userId;
    const { entry_date, reason_id, notes, is_national_holiday, holiday_name } = req.body;
    if (!entry_date) {
      return reply.status(400).send({ success: false, message: 'Tanggal wajib diisi' });
    }
    const [record] = await db.insert(absenceEntries).values({
      userId,
      entryDate: entry_date,
      reasonId: reason_id || null,
      notes: notes || null,
      isNationalHoliday: is_national_holiday || false,
      holidayName: holiday_name || null,
    }).returning();
    return reply.status(201).send({ success: true, data: record });
  }

  async updateEntry(req, reply) {
    const userId = req.userId;
    const { id } = req.params;
    const { reason_id, notes } = req.body;
    const [record] = await db.update(absenceEntries)
      .set({ reasonId: reason_id || null, notes: notes || null })
      .where(and(eq(absenceEntries.id, id), eq(absenceEntries.userId, userId)))
      .returning();
    if (!record) {
      return reply.status(404).send({ success: false, message: 'Entri tidak ditemukan' });
    }
    return reply.send({ success: true, data: record });
  }

  async deleteEntry(req, reply) {
    const userId = req.userId;
    const { id } = req.params;
    await db.delete(absenceEntries)
      .where(and(eq(absenceEntries.id, id), eq(absenceEntries.userId, userId)));
    return reply.send({ success: true, message: 'Entri berhasil dihapus' });
  }

  async getByDate(req, reply) {
    const userId = req.userId;
    const { date } = req.query;
    if (!date) {
      return reply.status(400).send({ success: false, message: 'Tanggal wajib diisi' });
    }
    const rows = await db.select().from(absenceEntries)
      .where(and(eq(absenceEntries.userId, userId), eq(absenceEntries.entryDate, date)))
      .limit(1);
    const holiday = await db.select().from(nationalHolidays)
      .where(eq(nationalHolidays.date, date))
      .limit(1);
    return reply.send({
      success: true,
      data: {
        absence: rows[0] || null,
        holiday: holiday[0] || null,
      },
    });
  }
}

module.exports = new AbsenceController();
