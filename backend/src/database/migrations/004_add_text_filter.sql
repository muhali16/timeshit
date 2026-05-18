-- Migration: Add text_filter JSONB column to users table
-- Created: 2026-05-17

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS text_filter JSONB DEFAULT '{
    "enabled": false,
    "taskMarker": "###",
    "categories": [
      {
        "name": "Selesai",
        "keywords": ["sudah saya kerjakan", "sudah dikerjakan", "sudah selesai", "done", "completed", "merged", "di PR"],
        "outputTemplate": "- {task}",
        "display": "normal"
      },
      {
        "name": "Sedang Dikerjakan",
        "keywords": ["sedang dikerjakan", "sedang saya kerjakan", "in progress", "ongoing", "WIP"],
        "outputTemplate": "- {task}",
        "display": "normal"
      },
      {
        "name": "Belum Dikerjakan",
        "keywords": ["belum dikerjakan", "not started", "pending", "todo", "belum mulai"],
        "outputTemplate": "~ {task} (pending)",
        "display": "muted"
      }
    ],
    "defaultCategory": "Belum Dikerjakan"
  }'::jsonb;
