const {
  pgTable,
  uuid,
  varchar,
  date,
  time,
  integer,
  timestamp,
  boolean,
  text,
  jsonb,
} = require("drizzle-orm/pg-core");
const { relations } = require("drizzle-orm");

const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  avatar: text("avatar"),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Jakarta"),
  notificationEnabled: boolean("notification_enabled").default(true),
  notificationTime: time("notification_time").default("17:00:00"),
  fcmToken: varchar("fcm_token", { length: 500 }),
  googleDriveFolderId: varchar("google_drive_folder_id", { length: 255 }),
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  googleTokenExpiry: timestamp("google_token_expiry"),
  defaultStartTime: time("default_start_time"),
  defaultEndTime: time("default_end_time"),
  locations: jsonb("locations").default([]),
  textFilter: jsonb("text_filter").default({
    enabled: false,
    taskMarker: "###",
    categories: [
      {
        name: "Selesai",
        keywords: [
          "sudah saya kerjakan",
          "sudah dikerjakan",
          "sudah selesai",
          "done",
          "completed",
          "merged",
          "di PR",
        ],
        outputTemplate: "- {task}",
        display: "normal",
      },
      {
        name: "Sedang Dikerjakan",
        keywords: [
          "sedang dikerjakan",
          "sedang saya kerjakan",
          "in progress",
          "ongoing",
          "WIP",
        ],
        outputTemplate: "- {task}",
        display: "normal",
      },
      {
        name: "Belum Dikerjakan",
        keywords: [
          "belum dikerjakan",
          "not started",
          "pending",
          "todo",
          "belum mulai",
        ],
        outputTemplate: "~ {task} (pending)",
        display: "muted",
      },
    ],
    defaultCategory: "Belum Dikerjakan",
  }),
  defaultBreakMinutes: integer("default_break_minutes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const timesheets = pgTable("timesheets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  entryDate: date("entry_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  location: varchar("location", { length: 255 }),
  activity: text("activity"),
  durationMinutes: integer("duration_minutes"),
  breakMinutes: integer("break_minutes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const evidenceFiles = pgTable("evidence_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  timesheetId: uuid("timesheet_id")
    .notNull()
    .references(() => timesheets.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size"),
  fileType: varchar("file_type", { length: 100 }),
  googleDriveFileId: varchar("google_drive_file_id", { length: 255 }),
  googleDriveUrl: varchar("google_drive_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

const excelTemplates = pgTable("excel_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const usersRelations = relations(users, ({ many }) => ({
  timesheets: many(timesheets),
  excelTemplates: many(excelTemplates),
}));

const timesheetsRelations = relations(timesheets, ({ one, many }) => ({
  user: one(users, {
    fields: [timesheets.userId],
    references: [users.id],
  }),
  evidenceFiles: many(evidenceFiles),
}));

const evidenceFilesRelations = relations(evidenceFiles, ({ one }) => ({
  timesheet: one(timesheets, {
    fields: [evidenceFiles.timesheetId],
    references: [timesheets.id],
  }),
}));

const absenceReasons = pgTable("absence_reasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }).default("#ef4444"),
  createdAt: timestamp("created_at").defaultNow(),
});

const absenceEntries = pgTable("absence_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  entryDate: date("entry_date").notNull(),
  reasonId: uuid("reason_id").references(() => absenceReasons.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  isNationalHoliday: boolean("is_national_holiday").default(false),
  holidayName: varchar("holiday_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

const nationalHolidays = pgTable("national_holidays", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  isNationalHoliday: boolean("is_national_holiday").default(true),
  year: integer("year"),
  source: varchar("source", { length: 50 }).default("api"),
  createdAt: timestamp("created_at").defaultNow(),
});

const absenceReasonsRelations = relations(absenceReasons, ({ one, many }) => ({
  user: one(users, {
    fields: [absenceReasons.userId],
    references: [users.id],
  }),
  entries: many(absenceEntries),
}));

const absenceEntriesRelations = relations(absenceEntries, ({ one }) => ({
  user: one(users, {
    fields: [absenceEntries.userId],
    references: [users.id],
  }),
  reason: one(absenceReasons, {
    fields: [absenceEntries.reasonId],
    references: [absenceReasons.id],
  }),
}));

const excelTemplatesRelations = relations(excelTemplates, ({ one }) => ({
  user: one(users, {
    fields: [excelTemplates.userId],
    references: [users.id],
  }),
}));

module.exports = {
  users,
  timesheets,
  evidenceFiles,
  excelTemplates,
  absenceReasons,
  absenceEntries,
  nationalHolidays,
  usersRelations,
  timesheetsRelations,
  evidenceFilesRelations,
  excelTemplatesRelations,
  absenceReasonsRelations,
  absenceEntriesRelations,
};
