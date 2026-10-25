-- IELTS Speaking Score Reports Table
CREATE TABLE IF NOT EXISTS ielts_speaking_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mock_booking_id UUID REFERENCES mock_services(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  trainer_name TEXT NOT NULL,
  
  -- Student Snapshot
  student_name TEXT NOT NULL,
  student_email TEXT,
  candidate_number TEXT,
  student_type TEXT,
  batch_number TEXT,
  phone TEXT,
  
  -- Assessment Dates
  test_date DATE NOT NULL,
  report_date DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 4 Core IELTS Speaking Assessment Criteria (Limited, Moderate, Good, Excellent)
  fluency_coherence TEXT NOT NULL,
  lexical_resources TEXT NOT NULL,
  grammatical_range TEXT NOT NULL,
  pronunciation TEXT NOT NULL,
  
  -- Scores & Feedback
  overall_band_score TEXT NOT NULL,
  suggestions TEXT,
  additional_comments TEXT,
  
  -- Email Tracking
  email_status TEXT DEFAULT 'Pending',
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_error TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by booking and date
CREATE INDEX IF NOT EXISTS idx_ielts_mock_booking ON ielts_speaking_reports(mock_booking_id);
CREATE INDEX IF NOT EXISTS idx_ielts_test_date ON ielts_speaking_reports(test_date);

-- Enable RLS
ALTER TABLE ielts_speaking_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform operations (application layer enforces roles)
CREATE POLICY "Allow all authenticated operations on ielts_speaking_reports" ON ielts_speaking_reports
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
