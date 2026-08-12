-- Create Holidays table
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holiday_date DATE NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Holidays are viewable by everyone" ON holidays FOR SELECT USING (true);
CREATE POLICY "HR and Admin can manage holidays" ON holidays FOR ALL USING (
    get_auth_role() IN ('HR', 'Admin')
);
