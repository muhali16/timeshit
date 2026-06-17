ALTER TABLE users ADD COLUMN IF NOT EXISTS default_history_period VARCHAR(30) DEFAULT 'current_month';
