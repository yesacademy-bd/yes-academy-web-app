-- Add IELTS specific Mock Services fields
ALTER TABLE mock_services ADD COLUMN IF NOT EXISTS speaking_time TEXT;
ALTER TABLE mock_services ADD COLUMN IF NOT EXISTS speaking_method TEXT;
ALTER TABLE mock_services ADD COLUMN IF NOT EXISTS assigned_speaking_teacher TEXT;
