const timesheetService = require("../services/timesheetService");
const uploadService = require("../services/uploadService");
const googleDriveService = require("../services/googleDriveService");
const { db } = require("../database/connection");
const { users } = require("../database/schema");
const { eq } = require("drizzle-orm");

class TimesheetController {
  async getUserBreakMinutes(userId) {
    const userRows = await db
      .select({ breakMinutes: users.defaultBreakMinutes })
      .from(users)
      .where(eq(users.id, userId));
    return userRows[0]?.breakMinutes || 0;
  }

  async list(req, reply) {
    try {
      const { date_from, date_to, limit = 50, offset = 0 } = req.query;

      const limitNum = parseInt(limit, 10) || 50;
      const offsetNum = parseInt(offset, 10) || 0;

      const { data, total } = await timesheetService.listTimesheets({
        userId: req.userId,
        dateFrom: date_from || null,
        dateTo: date_to || null,
        limit: limitNum,
        offset: offsetNum,
      });

      const formatted = timesheetService.formatTimesheetList(data);

      return reply.send({
        success: true,
        data: formatted,
        total,
        limit: limitNum,
        offset: offsetNum,
      });
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Gagal mengambil data timesheet",
        error: error.message,
      });
    }
  }

  async create(req, reply) {
    try {
      const body = req.body || {};

      const { tanggal, jam_mulai, jam_selesai, lokasi, rincian_tugas, tasks } =
        body;

      const required = {
        tanggal,
        jam_mulai,
        jam_selesai,
        lokasi,
        rincian_tugas,
      };
      const missing = Object.entries(required)
        .filter(([, v]) => !v)
        .map(([k]) => k);

      if (missing.length > 0) {
        return reply.status(400).send({
          success: false,
          message: `Field wajib tidak lengkap: ${missing.join(", ")}`,
        });
      }

      const [sh, sm] = jam_mulai.split(":").map(Number);
      const [eh, em] = jam_selesai.split(":").map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      const breakMinutes = await this.getUserBreakMinutes(req.userId);
      let durationMinutes = endMinutes - startMinutes - breakMinutes;

      if (endMinutes < startMinutes) {
        return reply.status(400).send({
          success: false,
          message: "jam_selesai harus lebih besar dari jam_mulai",
        });
      }

      if (durationMinutes < 0) {
        durationMinutes = 0;
      }

      const created = await timesheetService.createTimesheet({
        userId: req.userId,
        entryDate: tanggal,
        startTime: jam_mulai,
        endTime: jam_selesai,
        location: lokasi,
        activity: rincian_tugas,
        tasks,
        durationMinutes,
        breakMinutes,
      });

      const formatted = timesheetService.formatTimesheetList([created]);

      const userRows = await db
        .select({
          folderId: users.googleDriveFolderId,
        })
        .from(users)
        .where(eq(users.id, req.userId));
      const folderId = userRows[0]?.googleDriveFolderId;

      return reply.status(201).send({
        success: true,
        message: "Timesheet berhasil ditambahkan",
        data: formatted[0],
        warnings: !folderId
          ? [
              "Google Drive folder belum di-set. Upload evidence akan gagal sampai folder diatur di Settings.",
            ]
          : [],
      });
    } catch (error) {
      req.log.error(error);

      let message = "Gagal menambahkan timesheet";
      let status = 500;

      if (error.message?.includes("duplicate key") || error.code === "23505") {
        message =
          "Sudah ada entry timesheet dengan tanggal, jam, dan lokasi yang sama";
        status = 409;
      } else if (error.message?.includes("Failed query")) {
        message = "Gagal menyimpan data ke database";
      }

      return reply.status(status).send({
        success: false,
        message,
        error: error.message,
      });
    }
  }

  async getById(req, reply) {
    try {
      const { id } = req.params;
      const timesheet = await timesheetService.getTimesheetById(id, req.userId);
      if (!timesheet) {
        return reply.status(404).send({
          success: false,
          message: "Timesheet tidak ditemukan",
        });
      }

      const formatted = timesheetService.formatTimesheetList([timesheet]);
      return reply.send({
        success: true,
        data: formatted[0],
      });
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Gagal mengambil data timesheet",
        error: error.message,
      });
    }
  }

  async update(req, reply) {
    try {
      const { id } = req.params;
      const body = req.body || {};

      const { tanggal, jam_mulai, jam_selesai, lokasi, rincian_tugas, tasks } =
        body;

      const existing = await timesheetService.getTimesheetById(id, req.userId);
      if (!existing) {
        return reply.status(404).send({
          success: false,
          message: "Timesheet tidak ditemukan",
        });
      }

      const updates = {};
      if (tanggal !== undefined) updates.entryDate = tanggal;
      if (jam_mulai !== undefined) updates.startTime = jam_mulai;
      if (jam_selesai !== undefined) updates.endTime = jam_selesai;
      if (lokasi !== undefined) updates.location = lokasi;
      if (rincian_tugas !== undefined) updates.activity = rincian_tugas;
      if (tasks !== undefined) updates.tasks = tasks;

      // Recalculate duration if times changed
      if (jam_mulai !== undefined || jam_selesai !== undefined) {
        const st = jam_mulai || existing.startTime;
        const et = jam_selesai || existing.endTime;
        const [sh, sm] = st.split(":").map(Number);
        const [eh, em] = et.split(":").map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;
        const breakMinutes = await this.getUserBreakMinutes(req.userId);
        let durationMinutes = endMinutes - startMinutes - breakMinutes;

        if (endMinutes < startMinutes) {
          return reply.status(400).send({
            success: false,
            message: "jam_selesai harus lebih besar dari jam_mulai",
          });
        }
        if (durationMinutes < 0) {
          durationMinutes = 0;
        }
        updates.durationMinutes = durationMinutes;
        updates.breakMinutes = breakMinutes;
      }

      const updated = await timesheetService.updateTimesheet(
        id,
        req.userId,
        updates,
      );
      const formatted = timesheetService.formatTimesheetList([updated]);

      return reply.send({
        success: true,
        message: "Timesheet berhasil diupdate",
        data: formatted[0],
      });
    } catch (error) {
      req.log.error(error);

      let message = "Gagal mengupdate timesheet";
      let status = 500;

      if (error.message?.includes("Timesheet not found")) {
        message = "Timesheet tidak ditemukan";
        status = 404;
      } else if (error.message?.includes("duplicate key")) {
        message =
          "Sudah ada entry timesheet dengan tanggal, jam, dan lokasi yang sama";
        status = 409;
      }

      return reply.status(status).send({
        success: false,
        message,
        error: error.message,
      });
    }
  }

  async delete(req, reply) {
    try {
      const { id } = req.params;

      const existing = await timesheetService.getTimesheetById(id, req.userId);
      if (!existing) {
        return reply.status(404).send({
          success: false,
          message: "Timesheet tidak ditemukan",
        });
      }

      const { gdriveFileIds } = await timesheetService.deleteTimesheet(
        id,
        req.userId,
      );

      // Best-effort cleanup Google Drive files
      const gdriveResults = [];
      for (const fileId of gdriveFileIds) {
        try {
          const result = await googleDriveService.deleteFile(
            req.userId,
            fileId,
          );
          gdriveResults.push({ fileId, ...result });
        } catch (err) {
          req.log.error(
            { err, fileId },
            "Gagal menghapus file dari Google Drive",
          );
          gdriveResults.push({ fileId, deleted: false, error: err.message });
        }
      }

      return reply.send({
        success: true,
        message: "Timesheet berhasil dihapus",
        data: {
          gdrive_cleanup: gdriveResults,
        },
      });
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Gagal menghapus timesheet",
        error: error.message,
      });
    }
  }

  async deleteEvidence(req, reply) {
    try {
      const { id, evidenceId } = req.params;

      // Verify timesheet exists and belongs to user
      const timesheet = await timesheetService.getTimesheetById(id, req.userId);
      if (!timesheet) {
        return reply.status(404).send({
          success: false,
          message: "Timesheet tidak ditemukan",
        });
      }

      const { googleDriveFileId } = await timesheetService.deleteEvidence(
        evidenceId,
        req.userId,
      );

      // Best-effort delete from Google Drive
      if (googleDriveFileId) {
        try {
          await googleDriveService.deleteFile(req.userId, googleDriveFileId);
        } catch (err) {
          req.log.error(
            { err, googleDriveFileId },
            "Gagal menghapus file evidence dari Google Drive",
          );
        }
      }

      return reply.send({
        success: true,
        message: "Evidence berhasil dihapus",
      });
    } catch (error) {
      req.log.error(error);

      let message = "Gagal menghapus evidence";
      let status = 500;
      if (error.message?.includes("Evidence not found")) {
        message = "Evidence tidak ditemukan";
        status = 404;
      }

      return reply.status(status).send({
        success: false,
        message,
        error: error.message,
      });
    }
  }

  async uploadEvidence(req, reply) {
    try {
      const { id } = req.params;

      const timesheet = await timesheetService.getTimesheetById(id, req.userId);
      if (!timesheet) {
        return reply.status(404).send({
          success: false,
          message: "Timesheet tidak ditemukan",
        });
      }

      const userRows = await db
        .select({
          folderId: users.googleDriveFolderId,
          refreshToken: users.googleRefreshToken,
        })
        .from(users)
        .where(eq(users.id, req.userId));
      const user = userRows[0];

      if (!user?.refreshToken) {
        return reply.status(400).send({
          success: false,
          message:
            "Google Drive belum terhubung. Login ulang dengan Google untuk menghubungkan.",
        });
      }

      if (!user?.folderId) {
        return reply.status(400).send({
          success: false,
          message:
            "Google Drive folder belum di-set. Atur folder ID di halaman Settings.",
        });
      }

      const parts = req.parts();
      const uploadedFiles = [];
      let fileIndex = 0;

      for await (const part of parts) {
        if (part.file) {
          try {
            const saved = await uploadService.uploadToDrive(
              part,
              timesheet.entryDate,
              fileIndex,
              req.userId,
            );
            uploadedFiles.push(saved);
            fileIndex++;
          } catch (err) {
            req.log.error(
              { err, fileName: part.filename },
              "Gagal upload file ke Google Drive",
            );
            return reply.status(500).send({
              success: false,
              message: `Gagal upload file "${part.filename}" ke Google Drive`,
              error: err.message,
            });
          }
        }
      }

      if (uploadedFiles.length === 0) {
        return reply.status(400).send({
          success: false,
          message: "Tidak ada file yang diupload",
        });
      }

      await timesheetService.addEvidenceToTimesheet(id, uploadedFiles);

      return reply.status(201).send({
        success: true,
        message: `${uploadedFiles.length} evidence berhasil diupload ke Google Drive`,
        data: {
          timesheet_id: id,
          uploaded: uploadedFiles.map((f) => ({
            file_name: f.fileName,
            google_drive_url: f.googleDriveUrl,
            folder_path: f.folderPath,
          })),
        },
      });
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Gagal mengupload evidence",
        error: error.message,
      });
    }
  }
}

module.exports = new TimesheetController();
