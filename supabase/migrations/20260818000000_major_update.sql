-- Add payment method and portal assigned to enrollments
ALTER TABLE enrollments ADD COLUMN payment_method text;
ALTER TABLE enrollments ADD COLUMN portal_assigned boolean DEFAULT false;

-- Table: installments
CREATE TABLE installments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id uuid REFERENCES enrollments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  installment_number integer NOT NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  paid_amount numeric DEFAULT 0,
  payment_date date,
  payment_method text,
  status text DEFAULT 'Due', -- Due, Paid, Overdue
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Table: expenses
CREATE TABLE expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_date date NOT NULL,
  expense_type text NOT NULL,
  amount numeric NOT NULL,
  payment_method text,
  remarks text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Table: lead_calls
CREATE TABLE lead_calls (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  name text NOT NULL,
  number text NOT NULL,
  source text NOT NULL,
  interested_service text NOT NULL,
  lead_call_person text,
  remarks text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Table: walk_ins
CREATE TABLE walk_ins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  name text NOT NULL,
  number text NOT NULL,
  source text NOT NULL,
  interested_service text NOT NULL,
  target_country text,
  last_education text,
  passing_year text,
  gpa text,
  previous_test text,
  test_name text,
  score text,
  counselling_by text,
  admission_remarks text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Table: mock_services
CREATE TABLE mock_services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name text NOT NULL,
  phone text NOT NULL,
  service_type text NOT NULL, -- PTE / IELTS
  course_fee numeric NOT NULL,
  paid_amount numeric DEFAULT 0,
  due_amount numeric GENERATED ALWAYS AS (course_fee - paid_amount) STORED,
  payment_method text,
  exam_date date,
  payment_date date,
  status text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Table: registrations (PTE/IELTS Main Exam)
CREATE TABLE registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name text NOT NULL,
  phone text NOT NULL,
  exam_type text NOT NULL, -- PTE / IELTS
  registration_fee numeric NOT NULL,
  paid_amount numeric DEFAULT 0,
  due_amount numeric GENERATED ALWAYS AS (registration_fee - paid_amount) STORED,
  payment_method text,
  exam_date date,
  payment_date date,
  status text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Update Course Name
UPDATE courses 
SET name = 'Basic Grammar & Spoken English' 
WHERE name = 'Basic Grammar to Advance';

-- Enable RLS and add basic policies
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON installments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON expenses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON lead_calls FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON walk_ins FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON mock_services FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON registrations FOR ALL TO authenticated USING (true);
