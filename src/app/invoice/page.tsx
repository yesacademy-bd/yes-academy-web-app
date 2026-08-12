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

  return (
    <div className="bg-white min-h-screen p-8 text-black font-sans">
      <div className="max-w-3xl mx-auto p-10 relative">
        
        {/* Print Button (Hidden in print mode) */}
        <div className="absolute top-4 right-4 print:hidden">
          <PrintButton />
        </div>

        {/* Header */}
        <div className="text-center border-b pb-8 mb-8 border-black">
          <h1 className="text-4xl font-black tracking-tight">YES ACADEMY</h1>
          <div className="mt-6 inline-block border border-black px-4 py-2 rounded font-bold tracking-widest text-sm">
            OFFICIAL INVOICE
          </div>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between items-start mb-8 text-sm">
          <div>
            <p className="mb-1">Invoice To:</p>
            <p className="font-bold text-lg">{student.name}</p>
            <p>Phone: {student.phone || 'N/A'}</p>
            {student.guardian_phone && <p>Guardian: {student.guardian_phone}</p>}
          </div>
          <div className="text-right">
            <p className="mb-1">Enrollment Details:</p>
            <p className="font-medium">Date: {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
            <p className="font-medium">Time: {new Date(enrollment.enrolled_at).toLocaleTimeString()}</p>
            <p className="mt-2">Ref: {enrollment.reference || 'None'}</p>
          </div>
        </div>

        {/* Course Info Table */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="border-y border-black text-left text-sm uppercase tracking-wider">
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/20">
            <tr>
              <td className="py-4 px-4">
                <p className="font-bold text-base">{course.family} - {course.name}</p>
                <p className="text-sm mt-1">Batch: {batch.batch_name}</p>
              </td>
              <td className="py-4 px-4 text-right font-medium">
                ৳{enrollment.course_fee}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Total Course Fee</span>
              <span>৳{enrollment.course_fee}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Amount Paid</span>
              <span>- ৳{enrollment.paid_amount}</span>
            </div>
            <div className="flex justify-between border-t border-black pt-3 font-bold text-lg">
              <span>Amount Due</span>
              <span>৳{enrollment.due_amount}</span>
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
