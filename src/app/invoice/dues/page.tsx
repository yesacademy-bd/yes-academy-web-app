import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PrintButton from '../PrintButton'

export default async function DuesReportPage() {
  const supabase = await createClient()

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
      const pendingInst = e.installments?.filter((i: any) => i.status === 'Due')
        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]

      return {
        id: e.id,
        type: 'Enrollment',
        date: e.enrolled_at,
        student_name: e.students?.name,
        phone: e.students?.phone,
        item_name: `${e.batches?.courses?.family || ''} - ${e.batches?.batch_name || ''}`,
        total_fee: e.course_fee,
        paid_amount: e.paid_amount,
        due_amount: e.due_amount,
        next_installment_date: pendingInst?.due_date || null,
      }
    }) || []),
    ...(mocks?.map((m: any) => ({
      id: m.id,
      type: 'Mock Service',
      date: m.created_at,
      student_name: m.student_name,
      phone: m.phone,
      item_name: m.mock_type || m.service_type,
      total_fee: m.amount || m.course_fee,
      paid_amount: m.paid_amount,
      due_amount: m.due_amount,
    })) || []),
    ...(registrations?.map((r: any) => ({
      id: r.id,
      type: 'Registration',
      date: r.created_at,
      student_name: r.student_name,
      phone: r.phone,
      item_name: r.exam_type,
      total_fee: r.amount || r.registration_fee,
      paid_amount: r.paid_amount,
      due_amount: r.due_amount,
    })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalDue = dueData.reduce((s, e) => s + e.due_amount, 0)
  const dateStr = new Date().toLocaleDateString('en-GB')
  const timeStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date())

  return (
    <div className="invoice-safe-zone bg-white min-h-screen p-8 text-black font-sans" style={{ color: 'black', backgroundColor: 'white' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { color-scheme: light !important; }
        html, body { background: white !important; background-color: white !important; background-image: none !important; }
        .invoice-safe-zone, .invoice-safe-zone h1, .invoice-safe-zone h2, .invoice-safe-zone h3, .invoice-safe-zone p, .invoice-safe-zone span, .invoice-safe-zone td, .invoice-safe-zone th, .invoice-safe-zone div {
          color: black !important; -webkit-text-fill-color: black !important; text-fill-color: black !important; background-image: none !important; background: transparent !important;
        }
        .invoice-safe-zone thead tr { background-color: transparent !important; background: none !important; -webkit-text-fill-color: black !important; }
        .invoice-safe-zone thead th { background-color: transparent !important; color: black !important; }
        .invoice-safe-zone .border-black, .invoice-safe-zone tr { border-color: black !important; }
        .invoice-safe-zone .border-y { border-top-width: 1px !important; border-bottom-width: 1px !important; border-top-style: solid !important; border-bottom-style: solid !important; }
        .invoice-safe-zone .border-b { border-bottom-width: 1px !important; border-bottom-style: solid !important; }
        @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .print\\:hidden { display: none !important; } }
      `}} />
      <div className="max-w-5xl mx-auto p-10 relative bg-white" style={{ backgroundColor: 'white' }}>
        
        <div className="absolute top-4 right-4 print:hidden">
          <PrintButton />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-black tracking-tight text-black" style={{ color: 'black' }}>
            YES ACADEMY
          </div>
          <div className="mt-4 inline-block border border-black px-4 py-1 font-bold tracking-widest text-sm text-black">
            DUE DETAILS REPORT
          </div>
        </div>
        
        <hr className="border-t border-gray-300 mb-8" />

        <div className="flex justify-between items-start mb-8 text-sm text-black">
          <div>
            <p className="mb-1 font-bold">Report Status: <span className="text-red-600 font-bold" style={{ color: '#dc2626', WebkitTextFillColor: '#dc2626' }}>PENDING PAYMENTS</span></p>
            <p className="font-bold text-lg">Total Pending: ৳{totalDue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="mb-1 font-medium">Generated On:</p>
            <p>Date: {dateStr}</p>
            <p>Time: {timeStr}</p>
          </div>
        </div>

        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="border-y border-black text-left text-sm uppercase tracking-wider font-bold">
              <th className="py-2 px-2 text-left">Date</th>
              <th className="py-2 px-2 text-left">Student</th>
              <th className="py-2 px-2 text-left">Item</th>
              <th className="py-2 px-2 text-right">Fee</th>
              <th className="py-2 px-2 text-right">Paid</th>
              <th className="py-2 px-2 text-right font-bold" style={{ color: '#dc2626', WebkitTextFillColor: '#dc2626' }}>Due Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/20">
            {dueData.map((item, idx) => (
              <tr key={`${item.id}-${idx}`}>
                <td className="py-3 px-2 text-sm">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                <td className="py-3 px-2 text-sm">
                  <p className="font-bold">{item.student_name}</p>
                  <p>{item.phone}</p>
                </td>
                <td className="py-3 px-2 text-sm">
                  <span className="font-bold">{item.type}</span>
                  <p>{item.item_name}</p>
                </td>
                <td className="py-3 px-2 text-sm text-right">৳{(item.total_fee || 0).toLocaleString()}</td>
                <td className="py-3 px-2 text-sm text-right">৳{(item.paid_amount || 0).toLocaleString()}</td>
                <td className="py-3 px-2 text-sm text-right font-bold" style={{ color: '#dc2626', WebkitTextFillColor: '#dc2626' }}>৳{(item.due_amount || 0).toLocaleString()}</td>
              </tr>
            ))}
            {dueData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm font-bold">No pending dues across all services.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-16 pt-8 border-t border-black text-center text-sm">
          <p>YES Academy Due Collection Report</p>
          <p className="mt-1">Generated by System</p>
        </div>

      </div>
    </div>
  )
}
