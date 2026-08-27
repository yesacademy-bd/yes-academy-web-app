import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TeacherReportClient from '@/components/reports/TeacherReportClient'

export default async function FacultyReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, display_name').eq('id', user.id).single()
  if (profile?.role !== 'Faculty') {
    return <div className="p-8 text-red-500 font-medium">Access Denied. Faculty only.</div>
  }

  // Fetch active batches for this teacher
  const { data: batches } = await supabase
    .from('batches')
    .select('id, batch_name, schedule_days, start_time, end_time, courses(name)')
    .eq('teacher_id', user.id)
    .eq('status', 'Active')
    .order('start_time')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teacher Reports</h1>
      <TeacherReportClient batches={batches || []} teacherId={user.id} />
    </div>
  )
}
