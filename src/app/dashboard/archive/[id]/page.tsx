import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Users } from 'lucide-react'

export default async function ArchiveBatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'HR' && profile?.role !== 'Admin') {
    return <div className="text-red-500 font-bold p-8">Access Denied.</div>
  }

  // Fetch Batch
  const { data: batch } = await supabase
    .from('batches')
    .select('*, courses(name, family)')
    .eq('id', id)
    .single()

  if (!batch) return <div className="p-8 text-red-500">Batch not found</div>

  // Fetch Enrollments and Students
  const { data: enrollmentsData } = await supabase
    .from('enrollments')
    .select('id, student_id, students(id, name, phone, guardian_phone)')
    .eq('batch_id', id)

  const enrollments = (enrollmentsData || []).map((e: any) => ({
    id: e.id,
    student_id: e.student_id,
    students: Array.isArray(e.students) ? e.students[0] : e.students
  }))

  // Fetch Exam Scores
  const enrollmentIds = enrollments.map(e => e.id)
  let examScores: any[] = []
  if (enrollmentIds.length > 0) {
    const { data: scores } = await supabase.from('exam_scores').select('*').in('enrollment_id', enrollmentIds)
    examScores = scores || []
  }

  // Fetch Attendance Records
  const { data: sessions } = await supabase.from('class_sessions').select('id').eq('batch_id', id)
  const sessionIds = sessions?.map(s => s.id) || []
  
  let attendanceRecords: any[] = []
  if (sessionIds.length > 0) {
    const { data: records } = await supabase.from('attendance_records').select('*').in('class_session_id', sessionIds)
    attendanceRecords = records || []
  }

  // Build Attendance Map
  const attendanceMap: Record<string, { present: number, total: number }> = {}
  attendanceRecords.forEach(r => {
    if (!attendanceMap[r.student_id]) attendanceMap[r.student_id] = { present: 0, total: 0 }
    attendanceMap[r.student_id].total += 1
    if (r.status === 'Present') attendanceMap[r.student_id].present += 1
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/archive" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{batch.batch_name} - Final Archive Record</h1>
          <p className="text-sm text-gray-500">{batch.courses?.family} - {batch.courses?.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 whitespace-nowrap sticky left-0 bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]">Student</th>
                <th className="p-4 whitespace-nowrap">Contact Info</th>
                <th className="p-4 whitespace-nowrap text-center">Attendance</th>
                <th className="p-4 whitespace-nowrap text-center">Practice Hrs</th>
                <th className="p-4 whitespace-nowrap text-center">Scores (S/L/R/W)</th>
                <th className="p-4 whitespace-nowrap text-center">Mock Test</th>
                <th className="p-4 whitespace-nowrap text-center">Fines Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrollments.map((e) => {
                const att = attendanceMap[e.student_id] || { present: 0, total: 0 }
                const attPct = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0
                const score = examScores.find(s => s.enrollment_id === e.id) || {}

                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="p-4 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e7eb] font-bold text-gray-900 text-sm whitespace-nowrap">
                      {e.students.name}
                    </td>
                    <td className="p-4 text-xs text-gray-600 whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-2"><Phone className="w-3 h-3"/> Self: {e.students.phone}</div>
                      <div className="flex items-center gap-2"><Users className="w-3 h-3"/> Guard: {e.students.guardian_phone}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${attPct >= 80 ? 'bg-green-100 text-green-700' : attPct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {attPct}%
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{att.present} / {att.total} present</div>
                    </td>
                    <td className="p-4 text-center font-medium text-gray-700">{score.weekly_practice_hours || '-'}</td>
                    <td className="p-4 text-center text-sm font-medium text-gray-700">
                      {score.speaking || '-'}/{score.listening || '-'}/{score.reading || '-'}/{score.writing || '-'}
                    </td>
                    <td className="p-4 text-center font-bold text-gray-900">{score.mock_test_score || '-'}</td>
                    <td className="p-4 text-center text-red-600 font-bold">{score.fine_amount || '0'} BDT</td>
                  </tr>
                )
              })}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
