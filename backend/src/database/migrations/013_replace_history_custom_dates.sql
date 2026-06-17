ALTER TABLE users DROP COLUMN IF EXISTS default_history_date_from;
ALTER TABLE users DROP COLUMN IF EXISTS default_history_date_to;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_history_custom JSONB;
