import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PrintButton from '../invoice/PrintButton'

export default async function DueInvoicePage({ searchParams }: { searchParams: Promise<{ id: string, type: string }> }) {
  const supabase = await createClient()
  const { id, type } = await searchParams

  if (!id || !type) return <div>Missing parameters</div>

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let data: any = null

  if (type === 'Enrollment') {
    const res = await supabase.from('enrollments').select(`
      id, due_amount, course_fee, paid_amount, payment_method, enrolled_at,
      students (id, name, phone, guardian_phone, email),
      batches (id, batch_name, courses (id, family, name))
    `).eq('id', id).single()
    if (res.data) {
      data = {
        type: 'Enrollment',
        date: res.data.enrolled_at,
        student_name: res.data.students?.name,
        phone: res.data.students?.phone,
        guardian_phone: res.data.students?.guardian_phone,
        item_name: `${res.data.batches?.courses?.family || ''} - ${res.data.batches?.batch_name || ''}`,
        total_fee: res.data.course_fee,
        paid_amount: res.data.paid_amount,
        due_amount: res.data.due_amount
      }
    }
  } else if (type === 'Mock Service') {
    const res = await supabase.from('mock_services').select('*').eq('id', id).single()
    if (res.data) {
      data = {
        type: 'Mock Service',
        date: res.data.created_at,
        student_name: res.data.student_name,
        phone: res.data.phone,
        guardian_phone: '-',
        item_name: res.data.mock_type,
        total_fee: res.data.amount,
        paid_amount: res.data.paid_amount,
        due_amount: res.data.due_amount
      }
    }
  } else if (type === 'Registration') {
    const res = await supabase.from('registrations').select('*').eq('id', id).single()
    if (res.data) {
      data = {
        type: 'Registration',
        date: res.data.created_at,
        student_name: res.data.student_name,
        phone: res.data.phone,
        guardian_phone: '-',
        item_name: res.data.exam_type,
        total_fee: res.data.amount,
        paid_amount: res.data.paid_amount,
        due_amount: res.data.due_amount
      }
    }
  }

  if (!data) return <div>Record not found</div>

  const { data: paymentHistoryData } = await supabase
    .from('payment_history')
    .select('*')
    .eq('record_id', id)
    .order('payment_date', { ascending: false })

  const history = paymentHistoryData || []
  const sumHistory = history.reduce((s: any, h: any) => s + h.amount_paid, 0)
  const breakdown: any[] = []
  if (data.paid_amount > sumHistory) {
    breakdown.push({ label: 'Initial Payment', amount: data.paid_amount - sumHistory })
  }
  [...history].reverse().forEach((h: any) => {
    breakdown.push({ label: `Stage ${breakdown.length + 1} Payment`, amount: h.amount_paid })
  })

  const d = new Date(data.date)
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
          <div className="mt-4 inline-block border border-black px-4 py-1 font-bold tracking-widest text-sm text-black uppercase">
            {data.type} INVOICE
          </div>
        </div>
        
        {/* Simple Separator */}
        <hr className="border-t border-gray-300 mb-8" />

        {/* Invoice Info */}
        <div className="flex justify-between items-start mb-8 text-sm text-black">
          <div>
            <p className="mb-1">Invoice To:</p>
            <p className="font-bold text-lg">{data.student_name}</p>
            <p>Phone: {data.phone || 'N/A'}</p>
            {data.guardian_phone && data.guardian_phone !== '-' && <p>Guardian: {data.guardian_phone}</p>}
          </div>
          <div className="text-right">
            <p className="mb-1">Record Details:</p>
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
                <p className="font-bold text-base">{data.item_name}</p>
              </td>
              <td className="py-4 px-1 text-right font-medium">
                ৳{data.total_fee}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm text-black">
            <div className="flex justify-between font-bold border-b border-black pb-2 mb-2">
              <span>Total Fee</span>
              <span>৳{data.total_fee.toLocaleString()}</span>
            </div>
            
            {breakdown.map((b, i) => (
              <div key={i} className="flex justify-between text-gray-700">
                <span>{b.label}</span>
                <span>৳{b.amount.toLocaleString()}</span>
              </div>
            ))}

            <div className="flex justify-between font-bold border-t border-black pt-2 mt-2">
              <span>Total Amount Paid</span>
              <span>- ৳{data.paid_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-black pt-2 mt-2 font-bold text-lg">
              <span>Amount Due</span>
              <span>৳{data.due_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-black text-center text-sm">
          <p>Thank you for choosing YES Academy.</p>
          <p className="mt-1">This is a system-generated invoice.</p>
        </div>

      </div>
    </div>
  )
}
