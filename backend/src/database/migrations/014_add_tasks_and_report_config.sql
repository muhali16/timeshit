-- Migration: structured tasks per timesheet + per-user report config
-- Created: 2026-06-29

ALTER TABLE timesheets
  ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS report_config JSONB DEFAULT '{
    "standup": {
      "greeting": "Selamat pagi, Pak. Berikut task list yang akan saya kerjakan hari ini.",
      "bullet": "Task ini akan saya kerjakan hari ini"
    },
    "wrapup": {
      "greeting": "Selamat malam, Pak. Berikut wrap up yang saya kerjakan hari ini.",
      "sublabel": "Sesudah:",
      "defaultStatus": "done_pr",
      "statuses": [
        { "id": "done_pr", "label": "Selesai & PR", "bullet": "Task ini sudah saya kerjakan hari ini dan sudah di PR" },
        { "id": "done", "label": "Selesai", "bullet": "Task ini sudah saya kerjakan hari ini" },
        { "id": "progress", "label": "Dikerjakan", "bullet": "Task ini sedang saya kerjakan" }
      ]
    }
  }'::jsonb;
