DO $$ 
BEGIN
    -- lead_calls
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lead_calls' and column_name='name') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lead_calls' and column_name='student_name') THEN
        ALTER TABLE lead_calls RENAME COLUMN name TO student_name;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lead_calls' and column_name='number') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lead_calls' and column_name='phone') THEN
        ALTER TABLE lead_calls RENAME COLUMN number TO phone;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lead_calls' and column_name='interested_service') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lead_calls' and column_name='interested_course') THEN
        ALTER TABLE lead_calls RENAME COLUMN interested_service TO interested_course;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lead_calls' and column_name='source') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lead_calls' and column_name='lead_source') THEN
        ALTER TABLE lead_calls RENAME COLUMN source TO lead_source;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lead_calls' and column_name='remarks') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lead_calls' and column_name='summary') THEN
        ALTER TABLE lead_calls RENAME COLUMN remarks TO summary;
    END IF;

    -- walk_ins
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='name') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='student_name') THEN
        ALTER TABLE walk_ins RENAME COLUMN name TO student_name;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='number') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='phone') THEN
        ALTER TABLE walk_ins RENAME COLUMN number TO phone;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='interested_service') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='interested_course') THEN
        ALTER TABLE walk_ins RENAME COLUMN interested_service TO interested_course;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='source') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='lead_source') THEN
        ALTER TABLE walk_ins RENAME COLUMN source TO lead_source;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='admission_remarks') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='summary') THEN
        ALTER TABLE walk_ins RENAME COLUMN admission_remarks TO summary;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='target_country') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='walk_ins' and column_name='interested_country') THEN
        ALTER TABLE walk_ins RENAME COLUMN target_country TO interested_country;
    END IF;
END $$;

-- Add new columns safely using IF NOT EXISTS
ALTER TABLE walk_ins ADD COLUMN IF NOT EXISTS last_qualification text;
ALTER TABLE walk_ins ADD COLUMN IF NOT EXISTS last_qualification_year text;
ALTER TABLE walk_ins ADD COLUMN IF NOT EXISTS cgpa text;
ALTER TABLE walk_ins ADD COLUMN IF NOT EXISTS interested_intake text;

-- Add fallback missing columns in case they were neither renamed nor exist
ALTER TABLE lead_calls ADD COLUMN IF NOT EXISTS student_name text;
ALTER TABLE lead_calls ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE lead_calls ADD COLUMN IF NOT EXISTS interested_course text;
ALTER TABLE lead_calls ADD COLUMN IF NOT EXISTS lead_source text;
ALTER TABLE lead_calls ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE lead_calls ADD COLUMN IF NOT EXISTS lead_call_person text;

ALTER TABLE walk_ins ADD COLUMN IF NOT EXISTS student_name text;
ALTER TABLE walk_ins ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE walk_ins ADD COLUMN IF NOT EXISTS interested_course text;
ALTER TABLE walk_ins ADD COLUMN IF NOT EXISTS lead_source text;
ALTER TABLE walk_ins ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE walk_ins ADD COLUMN IF NOT EXISTS lead_call_person text;
