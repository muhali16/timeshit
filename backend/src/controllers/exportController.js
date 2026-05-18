const ExcelJS = require('exceljs');
const fs = require('fs');
const { eq, gte, lte, and, desc } = require('drizzle-orm');
const { db } = require('../database/connection');
const { timesheets, evidenceFiles, users, excelTemplates, absenceEntries, absenceReasons } = require('../database/schema');

const COLUMN_MAP = {
  tanggal: { header: 'Tanggal', width: 14, key: 'tanggal' },
  hari: { header: 'Hari', width: 12, key: 'hari' },
  jam_mulai: { header: 'Jam Mulai', width: 12, key: 'jam_mulai' },
  jam_selesai: { header: 'Jam Selesai', width: 12, key: 'jam_selesai' },
  istirahat: { header: 'Istirahat (menit)', width: 16, key: 'istirahat' },
  durasi: { header: 'Durasi', width: 16, key: 'durasi' },
  lokasi: { header: 'Lokasi', width: 24, key: 'lokasi' },
  aktivitas: { header: 'Aktivitas', width: 50, key: 'aktivitas' },
  jumlah_evidence: { header: 'Jumlah Evidence', width: 16, key: 'jumlah_evidence' },
  link_evidence: { header: 'Link Evidence', width: 60, key: 'link_evidence' },
};

const ALL_COLUMN_KEYS = Object.keys(COLUMN_MAP);

function parseColumnsParam(columnsParam) {
  if (!columnsParam || typeof columnsParam !== 'string') {
    return ALL_COLUMN_KEYS;
  }
  const requested = columnsParam
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter((k) => ALL_COLUMN_KEYS.includes(k));
  return requested.length > 0 ? requested : ALL_COLUMN_KEYS;
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} jam ${m} menit`;
  if (h > 0) return `${h} jam`;
  return `${m} menit`;
}

function getHeader(key, aliases) {
  if (aliases && aliases[key]) return aliases[key];
  return COLUMN_MAP[key]?.header || key;
}

class ExportController {
  async exportExcel(req, reply) {
    const userId = req.userId;
    const {
      date_from: dateFrom,
      date_to: dateTo,
      columns: columnsParam,
      include_absence: includeAbsenceParam,
    } = req.query;

    const columnKeys = parseColumnsParam(columnsParam);
    const includeAbsence = includeAbsenceParam === 'true' || includeAbsenceParam === '1';

    // Parse column aliases
    let columnAliases = {};
    try {
      if (req.query.column_aliases) {
        columnAliases = JSON.parse(req.query.column_aliases);
      }
    } catch { /* ignore invalid JSON */ }

    // Parse absence mode
    const absenceMode = req.query.absence_mode || 'separate_sheet';
    const absenceAlasanColumn = req.query.absence_alasan_column || null;
    const absenceCatatanColumn = req.query.absence_catatan_column || null;

    // Fetch user info
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userRows[0] || {};

    // Fetch template if exists
    const templateRows = await db.select().from(excelTemplates)
      .where(eq(excelTemplates.userId, userId))
      .orderBy(desc(excelTemplates.createdAt))
      .limit(1);
    const template = templateRows[0] || null;

    // Fetch timesheets
    const conditions = [eq(timesheets.userId, userId)];
    if (dateFrom) conditions.push(gte(timesheets.entryDate, dateFrom));
    if (dateTo) conditions.push(lte(timesheets.entryDate, dateTo));

    const whereClause = and(...conditions);

    const rows = await db.query.timesheets.findMany({
      where: whereClause,
      with: { evidenceFiles: true },
      orderBy: [desc(timesheets.entryDate), desc(timesheets.startTime)],
    });

    // Build data rows
    const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const bulanList = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];

    const dataRows = rows.map((row) => {
      const dateObj = new Date(row.entryDate + 'T00:00:00');
      const hari = hariList[dateObj.getDay()];
      const tanggalDisplay = `${dateObj.getDate()} ${bulanList[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
      const jamMulai = row.startTime ? row.startTime.slice(0, 5) : '-';
      const jamSelesai = row.endTime ? row.endTime.slice(0, 5) : '-';
      const durasi = formatDuration(row.durationMinutes);
      const evidenceCount = (row.evidenceFiles || []).length;

      const evidenceLinks = (row.evidenceFiles || [])
        .filter((f) => f.googleDriveUrl)
        .map((f) => `- ${f.googleDriveUrl}`)
        .join('\n');

      return {
        tanggal: tanggalDisplay,
        hari,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        istirahat: row.breakMinutes || 0,
        durasi,
        lokasi: row.location || '-',
        aktivitas: row.activity || '-',
        jumlah_evidence: evidenceCount,
        link_evidence: evidenceLinks || '-',
        _rawDurationMinutes: row.durationMinutes || 0,
        _rawDate: row.entryDate,
        _type: 'timesheet',
      };
    });

    // Summary stats
    const totalEntries = dataRows.length;
    const totalDurationMinutes = dataRows.reduce((sum, r) => sum + r._rawDurationMinutes, 0);
    const avgDurationMinutes = totalEntries > 0 ? Math.round(totalDurationMinutes / totalEntries) : 0;
    const totalDurationStr = formatDuration(totalDurationMinutes);
    const avgDurationStr = formatDuration(avgDurationMinutes);

    let workbook;
    let worksheet;
    let usingTemplate = false;

    if (template && fs.existsSync(template.filePath)) {
      // Load template workbook
      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(template.filePath);
      worksheet = workbook.getWorksheet(1);
      if (worksheet) {
        usingTemplate = true;
        // Clear all cell values but preserve styles/merges/widths
        worksheet.eachRow({ includeEmpty: false }, (row) => {
          row.eachCell({ includeEmpty: false }, (cell) => {
            cell.value = null;
          });
        });
      }
    }

    if (!worksheet) {
      workbook = new ExcelJS.Workbook();
      worksheet = workbook.addWorksheet('Timesheet');
    }

    const lastColLetter = this._getColumnLetter(columnKeys.length);
    const periodText = (dateFrom && dateTo)
      ? `${this._formatDateId(dateFrom)} - ${this._formatDateId(dateTo)}`
      : (dateFrom ? `Sejak ${this._formatDateId(dateFrom)}` : (dateTo ? `Sampai ${this._formatDateId(dateTo)}` : 'Semua periode'));

    // --- Info block (rows 1-4) ---
    worksheet.mergeCells(`A1:${lastColLetter}1`);
    worksheet.getCell('A1').value = 'LAPORAN TIMESHEET';
    if (!usingTemplate) {
      worksheet.getCell('A1').alignment = { horizontal: 'left', vertical: 'top' };
      worksheet.getRow(1).height = 22;
    }

    worksheet.mergeCells(`A2:${lastColLetter}2`);
    worksheet.getCell('A2').value = `Nama: ${user.name || user.email || 'User'}`;
    if (!usingTemplate) {
      worksheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'top' };
    }

    worksheet.mergeCells(`A3:${lastColLetter}3`);
    worksheet.getCell('A3').value = `Periode: ${periodText}`;
    if (!usingTemplate) {
      worksheet.getCell('A3').alignment = { horizontal: 'left', vertical: 'top' };
    }

    worksheet.mergeCells(`A4:${lastColLetter}4`);
    worksheet.getCell('A4').value = `Total Entry: ${totalEntries}  |  Total Durasi: ${totalDurationStr}  |  Rata-rata per Hari: ${avgDurationStr}`;
    if (!usingTemplate) {
      worksheet.getCell('A4').alignment = { horizontal: 'left', vertical: 'top' };
    }

    // --- Header row (row 6) ---
    const headerRow = worksheet.getRow(6);
    columnKeys.forEach((key, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = getHeader(key, columnAliases);
      if (!usingTemplate) {
        cell.alignment = { horizontal: 'left', vertical: 'top' };
      }
    });
    if (!usingTemplate) {
      headerRow.height = 20;
    }

    // Set column widths
    if (!usingTemplate) {
      columnKeys.forEach((key, index) => {
        worksheet.getColumn(index + 1).width = COLUMN_MAP[key].width;
      });
    }

    // --- Absence ---
    let rowsToWrite = [...dataRows];
    let absenceRowsData = [];

    if (includeAbsence) {
      let absenceConditions = [eq(absenceEntries.userId, userId)];
      if (dateFrom) absenceConditions.push(gte(absenceEntries.entryDate, dateFrom));
      if (dateTo) absenceConditions.push(lte(absenceEntries.entryDate, dateTo));

      const absenceRows = await db.query.absenceEntries.findMany({
        where: and(...absenceConditions),
        with: { reason: true },
        orderBy: [desc(absenceEntries.entryDate)],
      });

      if (absenceRows.length > 0) {
        if (absenceMode === 'same_sheet_merged') {
          // Build absence data rows merged into same table
          absenceRowsData = absenceRows.map((absRow) => {
            const d = new Date(absRow.entryDate + 'T00:00:00');
            const hari = hariList[d.getDay()];
            const tanggalDisplay = `${d.getDate()} ${bulanList[d.getMonth()]} ${d.getFullYear()}`;
            const reasonName = absRow.reason?.name || absRow.holidayName || 'Libur Nasional';

            const row = {
              tanggal: tanggalDisplay,
              hari,
              jam_mulai: '-',
              jam_selesai: '-',
              istirahat: '-',
              durasi: '-',
              lokasi: '-',
              aktivitas: '-',
              jumlah_evidence: '-',
              link_evidence: '-',
              _rawDate: absRow.entryDate,
              _type: 'absence',
            };

            // Fill selected columns
            if (absenceAlasanColumn && columnKeys.includes(absenceAlasanColumn)) {
              row[absenceAlasanColumn] = `Tidak Masuk: ${reasonName}`;
            }
            if (absenceCatatanColumn && columnKeys.includes(absenceCatatanColumn)) {
              row[absenceCatatanColumn] = absRow.notes || '-';
            }

            return row;
          });

          rowsToWrite = [...dataRows, ...absenceRowsData];
          rowsToWrite.sort((a, b) => {
            if (a._rawDate < b._rawDate) return -1;
            if (a._rawDate > b._rawDate) return 1;
            return 0;
          });

          // Update summary with absence count
          const totalAbsence = absenceRowsData.length;
          if (totalAbsence > 0) {
            worksheet.getCell('A4').value = `Total Entry: ${totalEntries}  |  Total Absence: ${totalAbsence}  |  Total Durasi: ${totalDurationStr}  |  Rata-rata per Hari: ${avgDurationStr}`;
          }
        } else if (absenceMode === 'same_sheet_separate_table') {
          // Same sheet, separate table below timesheet data
          const absenceStartRow = 7 + dataRows.length + 1;

          // Section header
          const sectionRow = worksheet.getRow(absenceStartRow);
          worksheet.mergeCells(`A${absenceStartRow}:${lastColLetter}${absenceStartRow}`);
          sectionRow.getCell(1).value = 'ENTRI TIDAK MASUK / LIBUR';
          if (!usingTemplate) {
            sectionRow.getCell(1).font = { bold: true };
            sectionRow.getCell(1).alignment = { horizontal: 'left', vertical: 'top' };
          }

          const absHeaderRow = worksheet.getRow(absenceStartRow + 1);
          const absenceHeaders = ['Tanggal', 'Hari', 'Alasan', 'Catatan'];
          absenceHeaders.forEach((h, i) => {
            const cell = absHeaderRow.getCell(i + 1);
            cell.value = h;
            if (!usingTemplate) {
              cell.font = { bold: true };
              cell.alignment = { horizontal: 'left', vertical: 'top' };
            }
          });

          absenceRows.forEach((absRow, idx) => {
            const d = new Date(absRow.entryDate + 'T00:00:00');
            const hari = hariList[d.getDay()];
            const tanggalDisplay = `${d.getDate()} ${bulanList[d.getMonth()]} ${d.getFullYear()}`;
            const reasonName = absRow.reason?.name || absRow.holidayName || 'Libur Nasional';
            const notes = absRow.notes || '-';

            const row = worksheet.getRow(absenceStartRow + 2 + idx);
            row.getCell(1).value = tanggalDisplay;
            row.getCell(2).value = hari;
            row.getCell(3).value = reasonName;
            row.getCell(4).value = notes;
            if (!usingTemplate) {
              row.eachCell((cell) => {
                cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
              });
            }
          });
        } else {
          // Separate sheet (default)
          const absenceSheet = workbook.addWorksheet('Absence');
          const absenceHeaders = ['Tanggal', 'Hari', 'Alasan', 'Catatan'];

          absenceSheet.mergeCells('A1:D1');
          absenceSheet.getCell('A1').value = 'ENTRI TIDAK MASUK / LIBUR';
          absenceSheet.getCell('A1').alignment = { horizontal: 'left', vertical: 'top' };
          absenceSheet.getCell('A1').font = { bold: true };
          absenceSheet.getRow(1).height = 22;

          absenceSheet.mergeCells('A2:D2');
          absenceSheet.getCell('A2').value = `Periode: ${periodText}`;
          absenceSheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'top' };

          absenceSheet.getRow(3).height = 8;

          const absHeaderRow = absenceSheet.getRow(4);
          absenceHeaders.forEach((h, i) => {
            const cell = absHeaderRow.getCell(i + 1);
            cell.value = h;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'left', vertical: 'top' };
          });
          absenceSheet.getRow(4).height = 20;

          absenceRows.forEach((absRow, idx) => {
            const d = new Date(absRow.entryDate + 'T00:00:00');
            const hari = hariList[d.getDay()];
            const tanggalDisplay = `${d.getDate()} ${bulanList[d.getMonth()]} ${d.getFullYear()}`;
            const reasonName = absRow.reason?.name || absRow.holidayName || 'Libur Nasional';
            const notes = absRow.notes || '-';

            const row = absenceSheet.getRow(5 + idx);
            row.getCell(1).value = tanggalDisplay;
            row.getCell(2).value = hari;
            row.getCell(3).value = reasonName;
            row.getCell(4).value = notes;
            row.eachCell((cell) => {
              cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
            });
          });

          absenceSheet.getColumn(1).width = 18;
          absenceSheet.getColumn(2).width = 12;
          absenceSheet.getColumn(3).width = 24;
          absenceSheet.getColumn(4).width = 40;

          absenceSheet.views = [{ state: 'frozen', ySplit: 4 }];
          if (absenceRows.length > 0) {
            absenceSheet.autoFilter = {
              from: { row: 4, column: 1 },
              to: { row: 4, column: 4 },
            };
          }
        }
      }
    }

    // --- Write data rows to worksheet ---
    rowsToWrite.forEach((dataRow, rowIdx) => {
      const excelRow = worksheet.getRow(7 + rowIdx);
      columnKeys.forEach((key, colIdx) => {
        const cell = excelRow.getCell(colIdx + 1);
        cell.value = dataRow[key];
        if (!usingTemplate) {
          cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: key === 'aktivitas' || key === 'link_evidence' };
        }
      });
    });

    // Freeze panes below header
    if (!usingTemplate) {
      worksheet.views = [{ state: 'frozen', ySplit: 6 }];
    }

    // Auto-filter on header row
    if (!usingTemplate && rowsToWrite.length > 0) {
      worksheet.autoFilter = {
        from: { row: 6, column: 1 },
        to: { row: 6, column: columnKeys.length },
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const safeName = (user.name || 'user').replace(/\s+/g, '_').toLowerCase();
    const filename = `timesheet_${safeName}_${dateFrom || 'all'}_${dateTo || 'all'}.xlsx`;

    return reply
      .type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(buffer);
  }

  _formatDateId(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const bulanList = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return `${d.getDate()} ${bulanList[d.getMonth()]} ${d.getFullYear()}`;
  }

  _getColumnLetter(colNumber) {
    let result = '';
    let num = colNumber;
    while (num > 0) {
      const remainder = (num - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      num = Math.floor((num - 1) / 26);
    }
    return result || 'A';
  }
}

module.exports = new ExportController();
