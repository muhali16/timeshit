const { eq, gte, lte, and, desc, count } = require('drizzle-orm');
const { db } = require('../database/connection');
const { timesheets, evidenceFiles } = require('../database/schema');

class TimesheetService {
  async createTimesheet({
    userId,
    entryDate,
    startTime,
    endTime,
    location,
    activity,
    durationMinutes,
    breakMinutes,
  }) {
    const result = await db
      .insert(timesheets)
      .values({
        userId,
        entryDate,
        startTime,
        endTime,
        location,
        activity,
        durationMinutes,
        breakMinutes: breakMinutes || 0,
      })
      .returning();

    const inserted = result[0];
    if (!inserted?.id) {
      throw new Error('Insert timesheet gagal: tidak ada ID yang dikembalikan');
    }

    // Ambil ulang data lengkap agar konsisten dengan findMany
    return this.getTimesheetById(inserted.id) || { ...inserted, evidenceFiles: [] };
  }

  async addEvidenceToTimesheet(timesheetId, files = []) {
    if (files.length === 0) return [];

    const evidenceValues = files.map((file) => ({
      timesheetId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      googleDriveUrl: file.googleDriveUrl || file.url || null,
      googleDriveFileId: file.googleDriveFileId || null,
    }));

    const evResult = await db
      .insert(evidenceFiles)
      .values(evidenceValues)
      .returning();

    return evResult;
  }

  async getTimesheetById(id, userId) {
    const conditions = [eq(timesheets.id, id)];
    if (userId) {
      conditions.push(eq(timesheets.userId, userId));
    }

    const rows = await db.query.timesheets.findMany({
      where: conditions.length === 1 ? conditions[0] : and(...conditions),
      with: { evidenceFiles: true },
      limit: 1,
    });

    return rows[0] || null;
  }

  async listTimesheets({ userId, dateFrom, dateTo, limit = 50, offset = 0 }) {
    const conditions = [eq(timesheets.userId, userId)];

    if (dateFrom) {
      conditions.push(gte(timesheets.entryDate, dateFrom));
    }
    if (dateTo) {
      conditions.push(lte(timesheets.entryDate, dateTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db.query.timesheets.findMany({
      where: whereClause,
      with: {
        evidenceFiles: true,
      },
      orderBy: [desc(timesheets.createdAt)],
      limit,
      offset,
    });

    const countResult = await db
      .select({ count: count() })
      .from(timesheets)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    return { data: rows, total };
  }

  async updateTimesheet(id, userId, updates) {
    const existing = await this.getTimesheetById(id, userId);
    if (!existing) {
      throw new Error('Timesheet not found');
    }

    const updateData = { updatedAt: new Date() };
    if (updates.entryDate !== undefined) updateData.entryDate = updates.entryDate;
    if (updates.startTime !== undefined) updateData.startTime = updates.startTime;
    if (updates.endTime !== undefined) updateData.endTime = updates.endTime;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.activity !== undefined) updateData.activity = updates.activity;
    if (updates.durationMinutes !== undefined) updateData.durationMinutes = updates.durationMinutes;
    if (updates.breakMinutes !== undefined) updateData.breakMinutes = updates.breakMinutes;

    await db
      .update(timesheets)
      .set(updateData)
      .where(and(eq(timesheets.id, id), eq(timesheets.userId, userId)));

    return this.getTimesheetById(id, userId);
  }

  async getEvidenceById(evidenceId, userId) {
    const rows = await db.query.evidenceFiles.findMany({
      where: eq(evidenceFiles.id, evidenceId),
      with: { timesheet: true },
      limit: 1,
    });

    const evidence = rows[0] || null;
    if (evidence && userId && evidence.timesheet?.userId !== userId) {
      return null; // Not owned by this user
    }
    return evidence;
  }

  async deleteEvidence(evidenceId, userId) {
    const evidence = await this.getEvidenceById(evidenceId, userId);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    const deletedFileId = evidence.googleDriveFileId || null;

    await db
      .delete(evidenceFiles)
      .where(eq(evidenceFiles.id, evidenceId));

    return { deleted: true, googleDriveFileId: deletedFileId };
  }

  async deleteTimesheet(id, userId) {
    const existing = await this.getTimesheetById(id, userId);
    if (!existing) {
      throw new Error('Timesheet not found');
    }

    // Collect GDrive file IDs before cascade delete removes evidence rows
    const gdriveFileIds = (existing.evidenceFiles || [])
      .map((f) => f.googleDriveFileId)
      .filter(Boolean);

    await db
      .delete(timesheets)
      .where(and(eq(timesheets.id, id), eq(timesheets.userId, userId)));

    return { deleted: true, gdriveFileIds };
  }

  formatTimesheetList(rows) {
    const hariList = [
      'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ];
    const bulanList = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    return rows.map((row) => {
      const dateObj = new Date(row.entryDate + 'T00:00:00');
      const hari = hariList[dateObj.getDay()];
      const tanggal = row.entryDate;
      const tanggalDisplay = `${dateObj.getDate()} ${bulanList[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

      const jamMulai = row.startTime ? row.startTime.slice(0, 5) : null;
      const jamSelesai = row.endTime ? row.endTime.slice(0, 5) : null;

      const durasiJam = row.durationMinutes
        ? Math.floor(row.durationMinutes / 60)
        : 0;
      const durasiMenit = row.durationMinutes
        ? row.durationMinutes % 60
        : 0;
      let durasi = '';
      if (durasiJam > 0) {
        durasi = `${durasiJam} jam`;
        if (durasiMenit > 0) {
          durasi += ` ${durasiMenit} menit`;
        }
      } else {
        durasi = `${durasiMenit} menit`;
      }

      const evidence = (row.evidenceFiles || []).map((file) => ({
        id: file.id,
        file_name: file.fileName,
        file_size: file.fileSize,
        file_type: file.fileType,
        google_drive_url: file.googleDriveUrl,
        google_drive_file_id: file.googleDriveFileId,
        created_at: file.createdAt,
      }));

      return {
        id: row.id,
        hari,
        tanggal,
        tanggalDisplay,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        durasi,
        durasi_menit: row.durationMinutes,
        istirahat: row.breakMinutes || 0,
        lokasi: row.location,
        rincian_tugas: row.activity,
        evidence,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      };
    });
  }
}

module.exports = new TimesheetService();
