import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, TrendingUp } from 'lucide-react'
import AttendanceGrid from '@/components/attendance/AttendanceGrid'

export default async function AttendanceRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch batch details and verify access
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .select('*, courses(name, family), rooms(name)')
    .eq('id', id)
    .single()

  if (batchError || !batch) {
    return (
      <div className="text-red-500 p-8">
        <h2 className="font-bold text-xl">Batch not found or error occurred</h2>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(batchError || 'No batch data returned', null, 2)}
        </pre>
      </div>
    )
  }

  // Verify Faculty access (must be teacher or monitor, or be Admin)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'Faculty' && batch.teacher_id !== user.id && batch.monitor_teacher_id !== user.id) {
    return <div className="text-red-500 font-medium">Access Denied. You are not assigned to this batch.</div>
  }

  // Fetch students enrolled in this batch
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('students(id, name, phone, guardian_phone)')
    .eq('batch_id', id)

  const students = enrollments?.map(e => e.students).filter(Boolean) || []

  // Fetch existing class sessions
  const { data: classSessions } = await supabase
    .from('class_sessions')
    .select('*')
    .eq('batch_id', id)
    .order('class_number')
    
  const sessions = classSessions || []
  const sessionIds = sessions.map(s => s.id)

  // Fetch existing attendance records for those sessions
  let attendanceRecords: any[] = []
  if (sessionIds.length > 0) {
    const { data: records } = await supabase
      .from('attendance_records')
      .select('*')
      .in('class_session_id', sessionIds)
    attendanceRecords = records || []
  }

  // Calculate Batch Summary Stats (Server-side snapshot)
  const totalStudents = students.length
  const totalClasses = batch.total_classes + batch.additional_classes
  let batchAttendancePct = 0
  
  if (attendanceRecords.length > 0) {
    const totalPresent = attendanceRecords.filter(r => r.status === 'Present').length
    batchAttendancePct = Math.round((totalPresent / attendanceRecords.length) * 100)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/faculty/batches" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{batch.batch_name}</h1>
            <p className="text-sm text-gray-500">{batch.courses?.family} - {batch.courses?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
              ${batch.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {batch.status}
            </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Users className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Enrolled Students</p>
            <p className="text-xl font-bold text-gray-900">{totalStudents} / {batch.max_students}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><Calendar className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Classes</p>
            <p className="text-xl font-bold text-gray-900">{sessions.length} / {totalClasses}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Attendance</p>
            <p className="text-xl font-bold text-gray-900">{batchAttendancePct}%</p>
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Attendance Register</h2>
        <AttendanceGrid 
          batch={batch}
          students={students}
          initialSessions={sessions}
          initialRecords={attendanceRecords}
          userRole={profile?.role || 'Faculty'}
        />
      </div>
    </div>
  )
}
