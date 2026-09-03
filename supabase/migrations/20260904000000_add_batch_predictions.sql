-- Migration for Batch Predictions
CREATE TABLE IF NOT EXISTS public.batch_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planning_month INT NOT NULL,
  planning_year INT NOT NULL,
  course_type TEXT NOT NULL,
  predicted_batch_name TEXT NOT NULL,
  predicted_start_date DATE NOT NULL,
  previous_batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  previous_batch_completion_date DATE,
  suggested_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  prediction_status TEXT NOT NULL DEFAULT 'Suggested',
  manually_modified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.batch_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for authenticated users" 
ON public.batch_predictions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all access for Admins" 
ON public.batch_predictions FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'BDM', 'HR')
  )
);
