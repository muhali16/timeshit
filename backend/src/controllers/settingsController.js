const { db } = require('../database/connection');
const { users } = require('../database/schema');
const { eq } = require('drizzle-orm');
const { google } = require('googleapis');
const { DEFAULT_REPORT_CONFIG } = require('../config/reportDefaults');

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
          defaultHistoryPeriod: user.defaultHistoryPeriod || 'current_month',
          defaultHistoryCustom: user.defaultHistoryCustom || null,
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
          reportConfig: user.reportConfig || DEFAULT_REPORT_CONFIG,
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
      const { name, timezone, notificationEnabled, notificationTime, defaultStartTime, defaultEndTime, defaultBreakMinutes, locations, textFilter, reportConfig, defaultHistoryPeriod, defaultHistoryCustom } = req.body;

      const updateData = { updatedAt: new Date() };
      if (name !== undefined) updateData.name = name;
      if (timezone !== undefined) updateData.timezone = timezone;
      if (notificationEnabled !== undefined) updateData.notificationEnabled = notificationEnabled;
      if (notificationTime !== undefined) updateData.notificationTime = notificationTime;
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
      if (defaultHistoryPeriod !== undefined) {
        const validPeriods = ['all', 'current_week', 'current_month', 'last_7_days', 'last_30_days', 'last_month', 'custom'];
        if (!validPeriods.includes(defaultHistoryPeriod)) {
          return reply.status(400).send({
            success: false,
            message: 'defaultHistoryPeriod tidak valid',
          });
        }
        updateData.defaultHistoryPeriod = defaultHistoryPeriod;
      }
      if (defaultHistoryCustom !== undefined) {
        if (defaultHistoryCustom === null) {
          updateData.defaultHistoryCustom = null;
        } else {
          const { fromDay, fromMonthOffset, toDay, toMonthOffset } = defaultHistoryCustom;
          const isValidDay = n => Number.isInteger(n) && n >= 1 && n <= 31;
          const isValidOffset = n => Number.isInteger(n) && n >= -12 && n <= 12;
          if (!isValidDay(fromDay) || !isValidDay(toDay) || !isValidOffset(fromMonthOffset) || !isValidOffset(toMonthOffset)) {
            return reply.status(400).send({
              success: false,
              message: 'defaultHistoryCustom: fromDay/toDay harus 1-31, fromMonthOffset/toMonthOffset harus -12 sampai 12',
            });
          }
          updateData.defaultHistoryCustom = { fromDay, fromMonthOffset, toDay, toMonthOffset };
        }
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
      if (reportConfig !== undefined) {
        if (typeof reportConfig !== 'object' || reportConfig === null) {
          return reply.status(400).send({
            success: false,
            message: 'reportConfig harus berupa object',
          });
        }
        const su = reportConfig.standup || {};
        const wu = reportConfig.wrapup || {};
        if (!Array.isArray(wu.statuses) || wu.statuses.length === 0) {
          return reply.status(400).send({
            success: false,
            message: 'reportConfig.wrapup.statuses harus berisi minimal 1 status',
          });
        }
        updateData.reportConfig = {
          marker: String(reportConfig.marker || '###'),
          bullet: String(reportConfig.bullet || '*'),
          standup: {
            greeting: String(su.greeting || ''),
            bullet: String(su.bullet || ''),
          },
          wrapup: {
            greeting: String(wu.greeting || ''),
            sublabel: String(wu.sublabel || ''),
            defaultStatus: String(wu.defaultStatus || wu.statuses[0].id),
            statuses: wu.statuses.map((s) => ({
              id: String(s.id),
              label: String(s.label || s.id),
              bullet: String(s.bullet || ''),
            })),
          },
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
          defaultHistoryPeriod: userRows[0].defaultHistoryPeriod || 'current_month',
          defaultHistoryCustom: userRows[0].defaultHistoryCustom || null,
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
          reportConfig: userRows[0].reportConfig || DEFAULT_REPORT_CONFIG,
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

}

module.exports = new SettingsController();
