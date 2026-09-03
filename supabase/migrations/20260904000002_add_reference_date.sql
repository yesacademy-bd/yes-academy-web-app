ALTER TABLE public.batch_predictions
ADD COLUMN IF NOT EXISTS reference_date DATE,
ADD COLUMN IF NOT EXISTS previous_batch_current_class INT,
ADD COLUMN IF NOT EXISTS previous_batch_remaining_classes INT;
