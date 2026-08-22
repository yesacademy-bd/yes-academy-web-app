import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DueClient from './DueClient'

export default async function DuesPage() {
  const supabase = await createClient()

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

  // Fetch all dues data in parallel
  const [
    { data: enrollments },
    { data: mocks },
    { data: registrations }
  ] = await Promise.all([
    supabase
      .from('enrollments')
      .select(`
        id, due_amount, course_fee, paid_amount, payment_method, enrolled_at,
        students (id, name, phone, guardian_phone, email),
        batches (id, batch_name, courses (id, family, name)),
        installments (id, amount, due_date, status)
      `)
      .gt('due_amount', 0)
      .order('enrolled_at', { ascending: false }),
    supabase.from('mock_services').select('*').gt('due_amount', 0).order('created_at', { ascending: false }),
    supabase.from('registrations').select('*').gt('due_amount', 0).order('created_at', { ascending: false })
  ])

  const dueData = [
    ...(enrollments?.map((e: any) => {
      // Find the next Due installment
      const pendingInst = e.installments?.filter((i: any) => i.status === 'Due')
        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]

      return {
        id: e.id,
        type: 'Enrollment',
        date: e.enrolled_at,
        student_name: e.students?.name,
        phone: e.students?.phone,
        guardian_phone: e.students?.guardian_phone,
        email: e.students?.email,
        item_name: `${e.batches?.courses?.family || ''} - ${e.batches?.batch_name || ''}`,
        total_fee: e.course_fee,
        paid_amount: e.paid_amount,
        due_amount: e.due_amount,
        payment_method: e.payment_method,
        next_installment_date: pendingInst?.due_date || null,
        installments: e.installments || []
      }
    }) || []),
    ...(mocks?.map((m: any) => ({
      id: m.id,
      type: 'Mock Service',
      date: m.created_at,
      student_name: m.student_name,
      phone: m.phone,
      guardian_phone: '-',
      item_name: m.mock_type,
      total_fee: m.amount,
      paid_amount: m.paid_amount,
      due_amount: m.due_amount,
      payment_method: m.payment_method
    })) || []),
    ...(registrations?.map((r: any) => ({
      id: r.id,
      type: 'Registration',
      date: r.created_at,
      student_name: r.student_name,
      phone: r.phone,
      guardian_phone: '-',
      item_name: r.exam_type,
      total_fee: r.amount,
      paid_amount: r.paid_amount,
      due_amount: r.due_amount,
      payment_method: r.payment_method
    })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Due Details</h1>
        <p className="text-gray-500 mt-1">Track and collect pending payments across all services.</p>
      </div>

      <DueClient initialData={dueData} />
    </div>
  )
}
