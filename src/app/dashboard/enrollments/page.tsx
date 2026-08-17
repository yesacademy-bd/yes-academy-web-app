import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EnrollmentClient from './EnrollmentClient'

export default async function EnrollmentsPage() {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['Admin', 'HR'].includes(profile?.role || '')) {
    redirect('/dashboard')
  }

  // 2. Fetch Data
  const { data: students } = await supabase
    .from('students')
    .select('id, name, phone, system_id')
    .order('created_at', { ascending: false })

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('name')

  const { data: batches } = await supabase
    .from('batches')
    .select(`
      id, batch_name, course_id, status, expected_end_date, teacher_id,
      profiles!batches_teacher_id_fkey(display_name)
    `)
    .neq('status', 'Completed')
    .order('created_at', { ascending: false })

  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('role', 'Faculty')
    .order('display_name')

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      student:students(name, phone),
      batch:batches(batch_name, course:courses(id, name, family)),
      installments(*)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Enrollments</h1>
        <p className="text-gray-500 mt-1">Manage enrollments, fees, and installment plans.</p>
      </div>

      <EnrollmentClient 
        students={students || []} 
        courses={courses || []} 
        batches={batches || []} 
        teachers={teachers || []}
        initialEnrollments={enrollments || []} 
      />
    </div>
  )
}
