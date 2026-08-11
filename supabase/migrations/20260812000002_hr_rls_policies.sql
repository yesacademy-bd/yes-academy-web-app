-- Grant HR role the ability to manage all critical tables so they can delete batches and manage attendance.

CREATE POLICY "HR can manage batches" ON batches FOR ALL USING (get_auth_role() = 'HR');
CREATE POLICY "HR can manage enrollments" ON enrollments FOR ALL USING (get_auth_role() = 'HR');
CREATE POLICY "HR can manage class sessions" ON class_sessions FOR ALL USING (get_auth_role() = 'HR');
CREATE POLICY "HR can manage attendance" ON attendance_records FOR ALL USING (get_auth_role() = 'HR');
CREATE POLICY "HR can manage exam scores" ON exam_scores FOR ALL USING (get_auth_role() = 'HR');
