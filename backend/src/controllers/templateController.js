const fs = require('fs');
const path = require('path');
const { eq, desc } = require('drizzle-orm');
const { db } = require('../database/connection');
const { excelTemplates } = require('../database/schema');

const STORAGE_DIR = path.join(__dirname, '../../storage/templates');

// Ensure storage dir exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

class TemplateController {
  async uploadTemplate(req, reply) {
    const userId = req.userId;
    const data = await req.file();

    if (!data) {
      return reply.status(400).send({
        success: false,
        message: 'File template tidak ditemukan',
      });
    }

    const mimetype = data.mimetype;
    if (mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        mimetype !== 'application/vnd.ms-excel') {
      return reply.status(400).send({
        success: false,
        message: 'Format file harus .xlsx',
      });
    }

    const ext = path.extname(data.filename) || '.xlsx';
    const safeName = `${Date.now()}_${data.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(STORAGE_DIR, `${userId}_${safeName}`);

    // Delete old templates for this user
    const existing = await db.select().from(excelTemplates).where(eq(excelTemplates.userId, userId));
    for (const old of existing) {
      try {
        if (fs.existsSync(old.filePath)) fs.unlinkSync(old.filePath);
      } catch { /* ignore */ }
      await db.delete(excelTemplates).where(eq(excelTemplates.id, old.id));
    }

    // Write file
    const buffer = await data.toBuffer();
    fs.writeFileSync(filePath, buffer);

    // Save to DB
    const [record] = await db.insert(excelTemplates).values({
      userId,
      fileName: data.filename,
      filePath,
    }).returning();

    return reply.status(200).send({
      success: true,
      message: 'Template berhasil diupload',
      data: {
        id: record.id,
        fileName: record.fileName,
        createdAt: record.createdAt,
      },
    });
  }

  async getTemplate(req, reply) {
    const userId = req.userId;
    const rows = await db.select().from(excelTemplates)
      .where(eq(excelTemplates.userId, userId))
      .orderBy(desc(excelTemplates.createdAt))
      .limit(1);

    if (rows.length === 0) {
      return reply.status(200).send({
        success: true,
        data: null,
      });
    }

    return reply.status(200).send({
      success: true,
      data: {
        id: rows[0].id,
        fileName: rows[0].fileName,
        createdAt: rows[0].createdAt,
      },
    });
  }

  async downloadTemplate(req, reply) {
    const userId = req.userId;
    const rows = await db.select().from(excelTemplates)
      .where(eq(excelTemplates.userId, userId))
      .orderBy(desc(excelTemplates.createdAt))
      .limit(1);

    if (rows.length === 0) {
      return reply.status(404).send({
        success: false,
        message: 'Template tidak ditemukan',
      });
    }

    const template = rows[0];
    if (!fs.existsSync(template.filePath)) {
      return reply.status(404).send({
        success: false,
        message: 'File template tidak ditemukan di server',
      });
    }

    return reply
      .type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('Content-Disposition', `attachment; filename="${template.fileName}"`)
      .send(fs.createReadStream(template.filePath));
  }

  async deleteTemplate(req, reply) {
    const userId = req.userId;
    const existing = await db.select().from(excelTemplates).where(eq(excelTemplates.userId, userId));

    for (const old of existing) {
      try {
        if (fs.existsSync(old.filePath)) fs.unlinkSync(old.filePath);
      } catch { /* ignore */ }
      await db.delete(excelTemplates).where(eq(excelTemplates.id, old.id));
    }

    return reply.status(200).send({
      success: true,
      message: 'Template berhasil dihapus',
    });
  }
}

module.exports = new TemplateController();
