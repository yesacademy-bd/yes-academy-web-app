import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CRMClient from './CRMClient'

export default async function CRMPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['HR', 'Admin'].includes(profile?.role || '')) {
    return <div className="p-8 text-red-500">Access Denied. HR or Admin only.</div>
  }

  // Fetch all enrollments with student and batch/course details
  const { data: enrollmentsData } = await supabase
    .from('enrollments')
    .select(`
      id, enrolled_at, course_fee, paid_amount, due_amount, reference, last_modified_date,
      students (id, name, phone),
      batches (id, batch_name, courses (id, family, name))
    `)
    .order('enrolled_at', { ascending: false })

  const enrollments = enrollmentsData?.map((e: any) => ({
    id: e.id,
    enrolled_at: e.enrolled_at,
    course_fee: e.course_fee || 0,
    paid_amount: e.paid_amount || 0,
    due_amount: e.due_amount || 0,
    reference: e.reference,
    last_modified_date: e.last_modified_date,
    student: e.students,
    batch: e.batches,
    course: e.batches?.courses
  })) || []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 print:text-black">Student Enrollment CRM</h1>
          <p className="text-gray-500 print:text-black mt-1">Analytics, Admissions, and Financial tracking.</p>
        </div>
      </div>
      
      <CRMClient initialData={enrollments} />
    </div>
  )
}
