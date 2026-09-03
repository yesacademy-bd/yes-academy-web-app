-- Migration for Admission Day Gap
ALTER TABLE public.batch_predictions 
ADD COLUMN IF NOT EXISTS required_gap INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_gap INT DEFAULT 0;
