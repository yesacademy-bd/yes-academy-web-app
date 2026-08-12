-- Add CRM fields to enrollments
ALTER TABLE enrollments 
ADD COLUMN course_fee NUMERIC DEFAULT 0,
ADD COLUMN paid_amount NUMERIC DEFAULT 0,
ADD COLUMN due_amount NUMERIC GENERATED ALWAYS AS (course_fee - paid_amount) STORED,
ADD COLUMN reference TEXT,
ADD COLUMN last_modified_date TIMESTAMPTZ DEFAULT NOW();

-- Create a trigger to auto-update last_modified_date whenever an enrollment row is updated
CREATE OR REPLACE FUNCTION update_enrollment_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrollment_last_modified
BEFORE UPDATE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_last_modified();
