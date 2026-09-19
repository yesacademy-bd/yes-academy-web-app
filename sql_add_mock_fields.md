-- Migration to add Mock Services fields
ALTER TABLE mock_services ADD COLUMN IF NOT EXISTS student_type TEXT DEFAULT 'External';
ALTER TABLE mock_services ADD COLUMN IF NOT EXISTS mock_status TEXT DEFAULT 'Paid';
ALTER TABLE mock_services ADD COLUMN IF NOT EXISTS registered_by TEXT;
