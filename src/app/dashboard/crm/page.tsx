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

  // Fetch all data in parallel
  const [
    { data: enrollmentsData },
    { data: mocksData },
    { data: registrationsData },
    { data: expensesData },
    { data: leads },
    { data: walkins }
  ] = await Promise.all([
    supabase
      .from('enrollments')
      .select(`
        id, enrolled_at, course_fee, paid_amount, due_amount, payment_method, reference, last_modified_date,
        students (id, name, phone),
        batches (id, batch_name, courses (id, family, name))
      `)
      .order('enrolled_at', { ascending: false }),
    supabase.from('mock_services').select('*'),
    supabase.from('registrations').select('*'),
    supabase.from('expenses').select('*'),
    supabase.from('lead_calls').select('*'),
    supabase.from('walk_ins').select('*')
  ])

  const enrollments = enrollmentsData?.map((e: any) => ({
    id: e.id,
    type: 'Enrollment',
    date: e.enrolled_at,
    student_name: e.students?.name,
    phone: e.students?.phone,
    item_name: `${e.batches?.courses?.family || ''} - ${e.batches?.batch_name || ''}`,
    total_fee: e.course_fee || 0,
    paid_amount: e.paid_amount || 0,
    due_amount: e.due_amount || 0,
    payment_method: e.payment_method || 'Cash',
    reference: e.reference || 'None'
  })) || []

  const mocks = mocksData?.map((m: any) => ({
    id: m.id,
    type: 'Mock Service',
    date: m.created_at,
    student_name: m.student_name,
    phone: m.phone,
    item_name: m.mock_type,
    total_fee: m.amount || 0,
    paid_amount: m.paid_amount || 0,
    due_amount: m.due_amount || 0,
    payment_method: m.payment_method || 'Cash'
  })) || []

  const registrations = registrationsData?.map((r: any) => ({
    id: r.id,
    type: 'Exam Registration',
    date: r.created_at,
    student_name: r.student_name,
    phone: r.phone,
    item_name: r.exam_type,
    total_fee: r.amount || 0,
    paid_amount: r.paid_amount || 0,
    due_amount: r.due_amount || 0,
    payment_method: r.payment_method || 'Cash'
  })) || []

  const expenses = expensesData?.map((ex: any) => ({
    id: ex.id,
    type: 'Expense',
    date: ex.date, // Date field from expenses table
    student_name: '-',
    phone: '-',
    item_name: `${ex.category}: ${ex.description || ''}`,
    total_fee: 0,
    paid_amount: ex.amount || 0,
    due_amount: 0,
    payment_method: ex.payment_method || 'Cash'
  })) || []

  const unifiedData = [...enrollments, ...mocks, ...registrations, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM (Finance)</h1>
          <p className="text-gray-500 mt-1">Unified Financial Dashboard & Reports.</p>
        </div>
      </div>
      
      <CRMClient 
        initialData={unifiedData} 
        initialLeads={leads || []}
        initialWalkins={walkins || []}
      />
    </div>
  )
}
