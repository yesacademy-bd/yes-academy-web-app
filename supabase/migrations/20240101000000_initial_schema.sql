-- Initial Schema for YES Academy Attendance & Batch Management System

-- Enable uuid-ossp extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for User Roles
CREATE TYPE user_role AS ENUM ('HR', 'Admin', 'Faculty');

-- Enum for Course Families
CREATE TYPE course_family AS ENUM ('PTE', 'IELTS', 'Grammar');

-- Enum for Batch Status
CREATE TYPE batch_status AS ENUM ('Upcoming', 'Active', 'Paused', 'Completed');

-- Enum for Attendance Status
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Leave');

-- 1. PROFILES Table (Extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'Faculty',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SETTINGS Table (Single row)
CREATE TABLE settings (
    id INT PRIMARY KEY CHECK (id = 1),
    default_max_students INT NOT NULL DEFAULT 12,
    default_total_classes INT NOT NULL DEFAULT 24,
    default_additional_classes INT NOT NULL DEFAULT 8,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- 3. COURSES Table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family course_family NOT NULL,
    name TEXT NOT NULL,
    default_total_classes INT NOT NULL,
    default_additional_classes INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ROOMS Table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 12
);

-- 5. BATCHES Table
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) NOT NULL,
    teacher_id UUID REFERENCES profiles(id) NOT NULL,
    monitor_teacher_id UUID REFERENCES profiles(id),
    room_id UUID REFERENCES rooms(id) NOT NULL,
    batch_name TEXT UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    expected_end_date DATE NOT NULL,
    max_students INT NOT NULL,
    total_classes INT NOT NULL,
    additional_classes INT NOT NULL DEFAULT 0,
    status batch_status NOT NULL DEFAULT 'Upcoming',
    schedule_days TEXT[] NOT NULL, -- e.g. '{"Saturday", "Monday", "Wednesday"}'
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. STUDENTS Table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id TEXT UNIQUE, -- e.g., for IELTS students
    name TEXT NOT NULL,
    phone TEXT,
    guardian_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ENROLLMENTS Table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, batch_id)
);

-- 8. CLASS SESSIONS Table
CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    class_number INT NOT NULL,
    session_date DATE NOT NULL,
    is_additional_class BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(batch_id, class_number)
);

-- 9. ATTENDANCE RECORDS Table
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    status attendance_status NOT NULL,
    marked_by_user_id UUID REFERENCES profiles(id),
    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(class_session_id, student_id)
);

-- 10. EXAM SCORES Table
CREATE TABLE exam_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE NOT NULL UNIQUE,
    speaking NUMERIC,
    writing NUMERIC,
    reading NUMERIC,
    listening NUMERIC,
    weekly_practice_hours NUMERIC,
    fine_amount NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUDIT LOG Table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    action_type TEXT NOT NULL,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    detail JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Functions and Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_modtime BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batches_modtime BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_scores_modtime BEFORE UPDATE ON exam_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- VIEWS
-- View for Batch Summary Stats
CREATE OR REPLACE VIEW batch_summary_stats AS
SELECT 
    b.id AS batch_id,
    b.batch_name,
    COUNT(DISTINCT e.student_id) AS current_students,
    (SELECT COALESCE(MAX(class_number), 0) FROM class_sessions cs WHERE cs.batch_id = b.id AND cs.session_date <= CURRENT_DATE) AS current_class_number,
    b.total_classes,
    (SELECT COUNT(*) FROM attendance_records ar JOIN class_sessions cs ON ar.class_session_id = cs.id WHERE cs.batch_id = b.id) AS total_attendance_marked,
    (SELECT COUNT(*) FROM attendance_records ar JOIN class_sessions cs ON ar.class_session_id = cs.id WHERE cs.batch_id = b.id AND ar.status = 'Present') AS total_present,
    CASE 
        WHEN (SELECT COUNT(*) FROM attendance_records ar JOIN class_sessions cs ON ar.class_session_id = cs.id WHERE cs.batch_id = b.id) > 0 
        THEN ROUND(((SELECT COUNT(*) FROM attendance_records ar JOIN class_sessions cs ON ar.class_session_id = cs.id WHERE cs.batch_id = b.id AND ar.status = 'Present')::NUMERIC / (SELECT COUNT(*) FROM attendance_records ar JOIN class_sessions cs ON ar.class_session_id = cs.id WHERE cs.batch_id = b.id)::NUMERIC) * 100, 2)
        ELSE 0
    END AS attendance_percentage
FROM batches b
LEFT JOIN enrollments e ON b.id = e.batch_id
GROUP BY b.id, b.batch_name, b.total_classes;


-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper Function to get current user role
CREATE OR REPLACE FUNCTION get_auth_role() RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES RLS
-- HR can read all. Admin can do all. Faculty can read all, update own.
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Admin can manage all profiles" ON profiles FOR ALL USING (get_auth_role() = 'Admin');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. SETTINGS RLS
CREATE POLICY "Settings are viewable by everyone" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin can update settings" ON settings FOR ALL USING (get_auth_role() = 'Admin');

-- 3. COURSES RLS
CREATE POLICY "Courses are viewable by everyone" ON courses FOR SELECT USING (true);
CREATE POLICY "Admin can manage courses" ON courses FOR ALL USING (get_auth_role() = 'Admin');

-- 4. ROOMS RLS
CREATE POLICY "Rooms are viewable by everyone" ON rooms FOR SELECT USING (true);
CREATE POLICY "Admin can manage rooms" ON rooms FOR ALL USING (get_auth_role() = 'Admin');

-- 5. BATCHES RLS
-- Everyone can read. Only Admin can insert/update/delete.
CREATE POLICY "Batches are viewable by everyone" ON batches FOR SELECT USING (true);
CREATE POLICY "Admin can manage batches" ON batches FOR ALL USING (get_auth_role() = 'Admin');

-- 6. STUDENTS RLS
CREATE POLICY "Students are viewable by everyone" ON students FOR SELECT USING (true);
CREATE POLICY "Admin can manage students" ON students FOR ALL USING (get_auth_role() = 'Admin');

-- 7. ENROLLMENTS RLS
CREATE POLICY "Enrollments are viewable by everyone" ON enrollments FOR SELECT USING (true);
CREATE POLICY "Admin can manage enrollments" ON enrollments FOR ALL USING (get_auth_role() = 'Admin');

-- 8. CLASS SESSIONS RLS
CREATE POLICY "Class sessions viewable by everyone" ON class_sessions FOR SELECT USING (true);
CREATE POLICY "Admin can manage class sessions" ON class_sessions FOR ALL USING (get_auth_role() = 'Admin');
-- Faculty can create/update class sessions if they are the teacher
CREATE POLICY "Faculty can manage class sessions for their batches" ON class_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM batches b WHERE b.id = class_sessions.batch_id AND (b.teacher_id = auth.uid() OR b.monitor_teacher_id = auth.uid()))
);

-- 9. ATTENDANCE RECORDS RLS
CREATE POLICY "Attendance viewable by everyone" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Admin can manage attendance" ON attendance_records FOR ALL USING (get_auth_role() = 'Admin');
CREATE POLICY "Faculty can manage attendance for their batches" ON attendance_records FOR ALL USING (
    EXISTS (
        SELECT 1 FROM class_sessions cs 
        JOIN batches b ON cs.batch_id = b.id 
        WHERE cs.id = attendance_records.class_session_id AND (b.teacher_id = auth.uid() OR b.monitor_teacher_id = auth.uid())
    )
);

-- 10. EXAM SCORES RLS
CREATE POLICY "Exam scores viewable by everyone" ON exam_scores FOR SELECT USING (true);
CREATE POLICY "Admin can manage exam scores" ON exam_scores FOR ALL USING (get_auth_role() = 'Admin');
CREATE POLICY "Faculty can manage exam scores for their batches" ON exam_scores FOR ALL USING (
    EXISTS (
        SELECT 1 FROM enrollments e
        JOIN batches b ON e.batch_id = b.id
        WHERE e.id = exam_scores.enrollment_id AND (b.teacher_id = auth.uid() OR b.monitor_teacher_id = auth.uid())
    )
);

-- 11. AUDIT LOG RLS
CREATE POLICY "Audit logs viewable by HR and Admin" ON audit_log FOR SELECT USING (get_auth_role() IN ('HR', 'Admin'));
CREATE POLICY "Everyone can insert their own audit logs" ON audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);
