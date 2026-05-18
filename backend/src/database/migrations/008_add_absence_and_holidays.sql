CREATE TABLE absence_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#ef4444',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

CREATE TABLE absence_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  reason_id UUID REFERENCES absence_reasons(id) ON DELETE SET NULL,
  notes TEXT,
  is_national_holiday BOOLEAN DEFAULT false,
  holiday_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entry_date)
);

CREATE TABLE national_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  is_national_holiday BOOLEAN DEFAULT true,
  year INT,
  source VARCHAR(50) DEFAULT 'api',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
