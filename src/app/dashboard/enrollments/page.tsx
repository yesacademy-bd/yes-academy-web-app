import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EnrollmentClient from './EnrollmentClient'

export const dynamic = 'force-dynamic'

export default async function EnrollmentsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) {
    redirect('/dashboard')
  }

  // 2. Pagination Logic
  const { page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const limit = 50
  const from = (currentPage - 1) * limit
  const to = from + limit - 1

  // 3. Fetch Data in Parallel
  const [
    { data: courses },
    { data: batches },
    { data: teachers },
    { data: recentEnrollments, count }
  ] = await Promise.all([
    supabase.from('courses').select('*').order('name'),
    supabase.from('batches').select(`
      id, batch_name, course_id, status, expected_end_date, teacher_id,
      profiles!batches_teacher_id_fkey(display_name)
    `).neq('status', 'Completed').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, display_name').eq('role', 'Faculty').order('display_name'),
    supabase.from('enrollments').select(`
      id, enrolled_at,
      students ( name, phone ),
      batches ( batch_name )
    `, { count: 'exact' }).order('enrolled_at', { ascending: false }).range(from, to)
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Enrollments</h1>
        <p className="text-gray-500 mt-1">Manage enrollments, fees, and installment plans.</p>
      </div>

      <EnrollmentClient 
        courses={courses || []} 
        batches={batches || []} 
        teachers={teachers || []}
        recentEnrollments={recentEnrollments || []}
        totalCount={count || 0}
        currentPage={currentPage}
      />
    </div>
  )
}
