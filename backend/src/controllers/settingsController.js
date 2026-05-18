const { db } = require('../database/connection');
const { users } = require('../database/schema');
const { eq } = require('drizzle-orm');
const { google } = require('googleapis');

class SettingsController {
  async get(req, reply) {
    try {
      const userRows = await db.select().from(users).where(eq(users.id, req.userId));
      const user = userRows[0];

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      return reply.send({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          timezone: user.timezone,
          googleDriveFolderId: user.googleDriveFolderId,
          hasGoogleToken: !!(user.googleRefreshToken),
          notificationEnabled: user.notificationEnabled,
          notificationTime: user.notificationTime,
          defaultStartTime: user.defaultStartTime ? user.defaultStartTime.slice(0, 5) : null,
          defaultEndTime: user.defaultEndTime ? user.defaultEndTime.slice(0, 5) : null,
          defaultBreakMinutes: user.defaultBreakMinutes || 0,
          locations: user.locations || [],
          textFilter: user.textFilter || {
            enabled: false,
            taskMarker: '###',
            categories: [
              { name: 'Selesai', keywords: ['sudah saya kerjakan', 'sudah dikerjakan', 'sudah selesai', 'done', 'completed', 'merged', 'di PR'], outputTemplate: '- {task}', display: 'normal' },
              { name: 'Sedang Dikerjakan', keywords: ['sedang dikerjakan', 'sedang saya kerjakan', 'in progress', 'ongoing', 'WIP'], outputTemplate: '- {task}', display: 'normal' },
              { name: 'Belum Dikerjakan', keywords: ['belum dikerjakan', 'not started', 'pending', 'todo', 'belum mulai'], outputTemplate: '~ {task} (pending)', display: 'muted' }
            ],
            defaultCategory: 'Belum Dikerjakan'
          },
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        success: false,
        message: 'Gagal mengambil settings',
      });
    }
  }

  async update(req, reply) {
    try {
      const { name, timezone, notificationEnabled, notificationTime, googleDriveFolderId, defaultStartTime, defaultEndTime, defaultBreakMinutes, locations, textFilter } = req.body;

      const updateData = { updatedAt: new Date() };
      if (name !== undefined) updateData.name = name;
      if (timezone !== undefined) updateData.timezone = timezone;
      if (notificationEnabled !== undefined) updateData.notificationEnabled = notificationEnabled;
      if (notificationTime !== undefined) updateData.notificationTime = notificationTime;
      if (googleDriveFolderId !== undefined) updateData.googleDriveFolderId = googleDriveFolderId;
      if (defaultStartTime !== undefined) updateData.defaultStartTime = defaultStartTime || null;
      if (defaultEndTime !== undefined) updateData.defaultEndTime = defaultEndTime || null;
      if (defaultBreakMinutes !== undefined) {
        const breakVal = parseInt(defaultBreakMinutes, 10);
        if (isNaN(breakVal) || breakVal < 0 || breakVal > 480) {
          return reply.status(400).send({
            success: false,
            message: 'defaultBreakMinutes harus antara 0 dan 480',
          });
        }
        updateData.defaultBreakMinutes = breakVal;
      }
      if (textFilter !== undefined) {
        if (typeof textFilter !== 'object' || textFilter === null) {
          return reply.status(400).send({
            success: false,
            message: 'textFilter harus berupa object',
          });
        }
        if (typeof textFilter.enabled !== 'boolean') {
          return reply.status(400).send({
            success: false,
            message: 'textFilter.enabled harus boolean',
          });
        }
        if (!textFilter.taskMarker || typeof textFilter.taskMarker !== 'string') {
          return reply.status(400).send({
            success: false,
            message: 'textFilter.taskMarker harus string non-kosong',
          });
        }
        if (!Array.isArray(textFilter.categories)) {
          return reply.status(400).send({
            success: false,
            message: 'textFilter.categories harus berupa array',
          });
        }
        const validDisplays = ['normal', 'muted'];
        const validatedCategories = textFilter.categories.map((cat, idx) => {
          if (!cat.name || typeof cat.name !== 'string') {
            throw new Error(`Category index ${idx}: name wajib diisi`);
          }
          if (!Array.isArray(cat.keywords)) {
            throw new Error(`Category index ${idx}: keywords harus array`);
          }
          if (!cat.outputTemplate || typeof cat.outputTemplate !== 'string') {
            throw new Error(`Category index ${idx}: outputTemplate wajib diisi`);
          }
          if (!validDisplays.includes(cat.display)) {
            throw new Error(`Category index ${idx}: display harus 'normal' atau 'muted'`);
          }
          return {
            name: cat.name,
            keywords: cat.keywords.filter(k => typeof k === 'string' && k.trim()).map(k => k.trim()),
            outputTemplate: cat.outputTemplate,
            display: cat.display,
          };
        });
        updateData.textFilter = {
          enabled: textFilter.enabled,
          taskMarker: textFilter.taskMarker.trim(),
          categories: validatedCategories,
          defaultCategory: textFilter.defaultCategory || 'Belum Dikerjakan',
        };
      }
      if (locations !== undefined) {
        if (!Array.isArray(locations)) {
          return reply.status(400).send({
            success: false,
            message: 'locations harus berupa array',
          });
        }
        const validated = locations.map((loc, idx) => {
          if (!loc.name || typeof loc.name !== 'string' || !loc.name.trim()) {
            throw new Error(`Location index ${idx}: name wajib diisi`);
          }
          return {
            name: loc.name.trim(),
            isDefault: !!loc.isDefault,
          };
        });
        const defaultCount = validated.filter(l => l.isDefault).length;
        if (defaultCount > 1) {
          return reply.status(400).send({
            success: false,
            message: 'Hanya boleh ada 1 lokasi default',
          });
        }
        updateData.locations = validated;
      }

      await db.update(users).set(updateData).where(eq(users.id, req.userId));

      const userRows = await db.select().from(users).where(eq(users.id, req.userId));

      return reply.send({
        success: true,
        message: 'Settings berhasil diupdate',
        data: {
          id: userRows[0].id,
          name: userRows[0].name,
          timezone: userRows[0].timezone,
          googleDriveFolderId: userRows[0].googleDriveFolderId,
          notificationEnabled: userRows[0].notificationEnabled,
          notificationTime: userRows[0].notificationTime,
          defaultStartTime: userRows[0].defaultStartTime ? userRows[0].defaultStartTime.slice(0, 5) : null,
          defaultEndTime: userRows[0].defaultEndTime ? userRows[0].defaultEndTime.slice(0, 5) : null,
          defaultBreakMinutes: userRows[0].defaultBreakMinutes || 0,
          locations: userRows[0].locations || [],
          textFilter: userRows[0].textFilter || {
            enabled: false,
            taskMarker: '###',
            categories: [
              { name: 'Selesai', keywords: ['sudah saya kerjakan', 'sudah dikerjakan', 'sudah selesai', 'done', 'completed', 'merged', 'di PR'], outputTemplate: '- {task}', display: 'normal' },
              { name: 'Sedang Dikerjakan', keywords: ['sedang dikerjakan', 'sedang saya kerjakan', 'in progress', 'ongoing', 'WIP'], outputTemplate: '- {task}', display: 'normal' },
              { name: 'Belum Dikerjakan', keywords: ['belum dikerjakan', 'not started', 'pending', 'todo', 'belum mulai'], outputTemplate: '~ {task} (pending)', display: 'muted' }
            ],
            defaultCategory: 'Belum Dikerjakan'
          },
        },
      });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        success: false,
        message: 'Gagal update settings',
        error: err.message,
      });
    }
  }

  async verifyFolder(req, reply) {
    try {
      const { folderId } = req.body;

      if (!folderId) {
        return reply.status(400).send({
          success: false,
          message: 'folderId wajib diisi',
        });
      }

      const userRows = await db.select().from(users).where(eq(users.id, req.userId));
      const user = userRows[0];

      if (!user?.googleRefreshToken) {
        return reply.status(400).send({
          success: false,
          message: 'Google Drive belum terhubung. Login ulang dengan Google untuk menghubungkan.',
        });
      }

      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET
      );
      oAuth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

      const drive = google.drive({ version: 'v3', auth: oAuth2Client });

      let folderInfo;
      try {
        folderInfo = await drive.files.get({
          fileId: folderId,
          fields: 'id, name, mimeType, capabilities',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });
      } catch (err) {
        req.log.error({ err, folderId }, 'Google Drive verify folder failed');
        if (err.code === 404) {
          return reply.status(404).send({
            success: false,
            message: 'Folder tidak ditemukan. Pastikan folder ada di Google Drive akun Anda dan coba gunakan folder di My Drive Anda sendiri.',
            detail: err.errors?.[0]?.message || err.message,
          });
        }
        if (err.code === 403) {
          return reply.status(403).send({
            success: false,
            message: 'Tidak ada akses ke folder ini. Share folder tersebut ke email akun Google Anda yang dipakai login.',
            detail: err.errors?.[0]?.message || err.message,
          });
        }
        throw err;
      }

      if (folderInfo.data.mimeType !== 'application/vnd.google-apps.folder') {
        return reply.status(400).send({
          success: false,
          message: 'ID tersebut bukan folder',
        });
      }

      await db.update(users).set({
        googleDriveFolderId: folderId,
        updatedAt: new Date(),
      }).where(eq(users.id, req.userId));

      return reply.send({
        success: true,
        message: `Folder "${folderInfo.data.name}" berhasil diverifikasi`,
        data: {
          folderId: folderInfo.data.id,
          folderName: folderInfo.data.name,
        },
      });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        success: false,
        message: 'Gagal memverifikasi folder',
        error: err.message,
      });
    }
  }
}

module.exports = new SettingsController();
