import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PrintButton from './PrintButton'

export default async function InvoicePage({ searchParams }: { searchParams: Promise<{ studentId: string, batchId: string }> }) {
  const supabase = await createClient()
  const { studentId, batchId } = await searchParams

  if (!studentId || !batchId) return <div>Missing parameters</div>

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [studentRes, batchRes, enrollmentRes] = await Promise.all([
    supabase.from('students').select('*').eq('id', studentId).single(),
    supabase.from('batches').select('*, courses(*)').eq('id', batchId).single(),
    supabase.from('enrollments').select('*').eq('student_id', studentId).eq('batch_id', batchId).single()
  ])

  if (!studentRes.data || !batchRes.data || !enrollmentRes.data) {
    return <div>Could not find enrollment data</div>
  }

  const student = studentRes.data
  const batch = batchRes.data
  const enrollment = enrollmentRes.data
  const course = batch.courses

  const [historyRes, installmentsRes] = await Promise.all([
    supabase.from('payment_history').select('*').eq('record_id', enrollment.id).order('payment_date', { ascending: false }),
    supabase.from('installments').select('*').eq('enrollment_id', enrollment.id).order('installment_number', { ascending: true })
  ])

  const history = historyRes.data || []
  const installments = installmentsRes.data || []

  const sumHistory = history.reduce((s: any, h: any) => s + h.amount_paid, 0)
  const breakdown: any[] = []
  if (enrollment.paid_amount > sumHistory) {
    breakdown.push({ label: `Initial Payment (${enrollment.payment_method || 'Cash'})`, amount: enrollment.paid_amount - sumHistory })
  }
  [...history].reverse().forEach((h: any) => {
    breakdown.push({ label: `Stage ${breakdown.length + 1} Payment (${h.payment_method})`, amount: h.amount_paid })
  })

  let displayCourseName = `${course.family} - ${course.name}`
  if (displayCourseName === 'PTE - PTE') displayCourseName = 'PTE - PTE Academic'
  if (displayCourseName === 'Grammar - Basic Grammar') displayCourseName = 'Grammar - Basic Grammar to Advance'

  const d = new Date(enrollment.enrolled_at)
  const dateStr = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
  const timeStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(d)

  return (
    <div className="invoice-safe-zone bg-white min-h-screen p-8 text-black font-sans" style={{ color: 'black', backgroundColor: 'white' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { color-scheme: light !important; }
        
        /* Force body to be white, killing the global gradient */
        html, body {
          background: white !important;
          background-color: white !important;
          background-image: none !important;
        }
        
        /* Kill global text gradients for all elements in invoice */
        .invoice-safe-zone, #invoice-company-name, .invoice-safe-zone h1, .invoice-safe-zone h2, .invoice-safe-zone h3, .invoice-safe-zone p, .invoice-safe-zone span, .invoice-safe-zone td, .invoice-safe-zone th, .invoice-safe-zone div {
          color: black !important;
          -webkit-text-fill-color: black !important;
          text-fill-color: black !important;
          background-image: none !important;
          background: transparent !important;
          background-clip: border-box !important;
          -webkit-background-clip: border-box !important;
        }

        /* Kill glassmorphism effects */
        .invoice-safe-zone .bg-white, .invoice-safe-zone .bg-gray-50, .invoice-safe-zone .bg-gray-100 {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow: none !important;
          background-color: transparent !important;
        }

        /* Clean table headers */
        .invoice-safe-zone thead tr {
          background-color: transparent !important;
          background: none !important;
          -webkit-text-fill-color: black !important;
        }
        .invoice-safe-zone thead th {
          background-color: transparent !important;
          color: black !important;
        }

        /* Force black borders */
        .invoice-safe-zone .border-black,
        .invoice-safe-zone tr {
          border-color: black !important;
        }
        .invoice-safe-zone .border-y {
          border-top-width: 1px !important;
          border-bottom-width: 1px !important;
          border-top-style: solid !important;
          border-bottom-style: solid !important;
        }
        .invoice-safe-zone .border-b {
          border-bottom-width: 1px !important;
          border-bottom-style: solid !important;
        }
        .invoice-safe-zone .border {
          border-width: 1px !important;
          border-style: solid !important;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
      <div className="max-w-3xl mx-auto p-10 relative bg-white" style={{ backgroundColor: 'white' }}>
        
        {/* Print Button (Hidden in print mode) */}
        <div className="absolute top-4 right-4 print:hidden">
          <PrintButton />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-black tracking-tight text-black print:text-black" style={{ color: 'black' }}>
            YES ACADEMY
          </div>
          <div className="mt-4 inline-block border border-black px-4 py-1 font-bold tracking-widest text-sm text-black">
            OFFICIAL INVOICE
          </div>
        </div>
        
        {/* Simple Separator */}
        <hr className="border-t border-gray-300 mb-8" />

        {/* Invoice Info */}
        <div className="flex justify-between items-start mb-8 text-sm text-black">
          <div>
            <p className="mb-1">Invoice To:</p>
            <p className="font-bold text-lg">{student.name}</p>
            <p>Phone: {student.phone || 'N/A'}</p>
            {student.guardian_phone && <p>Guardian: {student.guardian_phone}</p>}
          </div>
          <div className="text-right">
            <p className="mb-1">Enrollment Details:</p>
            <p className="font-medium">Date: {dateStr}</p>
            <p className="font-medium">Time: {timeStr}</p>
          </div>
        </div>

        {/* Course Info Table */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="border-y border-black text-left text-sm uppercase tracking-wider font-bold">
              <th className="py-2 px-1">Description</th>
              <th className="py-2 px-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/20">
            <tr>
              <td className="py-4 px-1">
                <p className="font-bold text-base">{displayCourseName}</p>
                <p className="text-sm mt-1 text-black">Batch: {batch.batch_name}</p>
              </td>
              <td className="py-4 px-1 text-right font-medium">
                ৳{enrollment.course_fee}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2 text-sm text-black">
            <div className="flex justify-between font-bold border-b border-black pb-2 mb-2">
              <span>Total Course Fee</span>
              <span>৳{enrollment.course_fee.toLocaleString()}</span>
            </div>
            
            {breakdown.map((b, i) => (
              <div key={i} className="flex justify-between text-gray-700">
                <span>{b.label}</span>
                <span>৳{b.amount.toLocaleString()}</span>
              </div>
            ))}

            <div className="flex justify-between font-bold border-t border-black pt-2 mt-2">
              <span>Total Amount Paid</span>
              <span>- ৳{enrollment.paid_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-black pt-2 mt-2 font-bold text-lg">
              <span>Amount Due</span>
              <span>৳{enrollment.due_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Installments Table */}
        {installments.length > 0 && (
          <div className="mb-8">
            <h4 className="font-bold text-sm uppercase border-b border-black pb-1 mb-2">Installment Plan</h4>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-black/20 text-gray-700">
                  <th className="py-2 px-1">Installment</th>
                  <th className="py-2 px-1">Due Date</th>
                  <th className="py-2 px-1">Status</th>
                  <th className="py-2 px-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {installments.map((inst: any) => (
                  <tr key={inst.id}>
                    <td className="py-2 px-1">Inst {inst.installment_number}</td>
                    <td className="py-2 px-1">{new Date(inst.due_date).toLocaleDateString('en-GB')}</td>
                    <td className="py-2 px-1">{inst.status}</td>
                    <td className="py-2 px-1 text-right">৳{inst.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-black text-center text-sm">
          <p>Thank you for choosing YES Academy.</p>
          <p className="mt-1">This is a system-generated invoice.</p>
        </div>

      </div>
    </div>
  )
}
