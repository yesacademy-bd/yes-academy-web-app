import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, TrendingUp } from 'lucide-react'
import AttendanceGrid from '@/components/attendance/AttendanceGrid'
import StudentProgressGrid from '@/components/attendance/StudentProgressGrid'
import FineDetailsGrid from '@/components/attendance/FineDetailsGrid'
import TopAttendanceView from '@/components/attendance/TopAttendanceView'

export default async function AttendanceRegisterPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { id } = await params
  const { tab = 'attendance' } = await searchParams

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
  const { data: enrollmentsData } = await supabase
    .from('enrollments')
    .select('id, student_id, students(id, name, phone, guardian_phone)')
    .eq('batch_id', id)

  const enrollments = (enrollmentsData || []).map((e: any) => ({
    id: e.id,
    student_id: e.student_id,
    students: Array.isArray(e.students) ? e.students[0] : e.students
  }))
  const students = enrollments.map(e => e.students ? { ...e.students, enrollment_id: e.id } : null).filter(Boolean) || []

  // Fetch exam scores
  const enrollmentIds = enrollments.map(e => e.id)
  let examScores: any[] = []
  if (enrollmentIds.length > 0) {
    const { data: scores } = await supabase
      .from('exam_scores')
      .select('*')
      .in('enrollment_id', enrollmentIds)
    examScores = scores || []
  }

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

  // Fetch holidays for locking sync
  const { getHolidays } = await import('@/app/actions/holidays')
  const holidays = await getHolidays()

  const validSessions = sessions.filter(s => s.class_number > 0)

  // Calculate Batch Summary Stats & Attendance Map
  const totalStudents = students.length
  const totalClasses = batch.total_classes + batch.additional_classes
  let batchAttendancePct = 0
  const attendanceMap: Record<string, { present: number, total: number }> = {}

  if (attendanceRecords.length > 0) {
    const totalPresent = attendanceRecords.filter(r => r.status === 'Present').length
    batchAttendancePct = Math.round((totalPresent / attendanceRecords.length) * 100)

    // Build map for individual student attendance
    attendanceRecords.forEach(r => {
      if (!attendanceMap[r.student_id]) {
        attendanceMap[r.student_id] = { present: 0, total: 0 }
      }
      attendanceMap[r.student_id].total += 1
      if (r.status === 'Present') attendanceMap[r.student_id].present += 1
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-0">
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
            <p className="text-xl font-bold text-gray-900">{validSessions.length} / {totalClasses}</p>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href={`/dashboard/faculty/batches/${id}?tab=attendance`}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'attendance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Attendance Register
          </Link>
          <Link
            href={`/dashboard/faculty/batches/${id}?tab=progress`}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'progress'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Student Progress & Details
          </Link>
          <Link
            href={`/dashboard/faculty/batches/${id}?tab=fines`}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'fines'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Fine Details
          </Link>
          <Link
            href={`/dashboard/faculty/batches/${id}?tab=top-attendance`}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
              tab === 'top-attendance'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Top Attendance
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="mt-6">
        {tab === 'attendance' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Attendance Grid</h2>
            <AttendanceGrid 
              batch={batch}
              students={students}
              initialSessions={sessions}
              initialRecords={attendanceRecords}
              serverHolidays={holidays}
              userRole={profile?.role || 'Faculty'}
            />
          </div>
        ) : tab === 'progress' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Student Progress & Scores</h2>
              <p className="text-sm text-gray-500">Scores auto-save when changed.</p>
            </div>
            <StudentProgressGrid 
              batchId={id}
              enrollments={enrollments}
              initialScores={examScores}
              attendanceMap={attendanceMap}
            />
          </div>
        ) : tab === 'fines' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Fine Details</h2>
              <p className="text-sm text-gray-500">Auto-calculated fine is 100 BDT per absent class. Adjust manually if needed.</p>
            </div>
            <FineDetailsGrid 
              batchId={id}
              enrollments={enrollments}
              initialScores={examScores}
              attendanceMap={attendanceMap}
              totalSessions={validSessions.length}
            />
          </div>
        ) : tab === 'top-attendance' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Top Attendance</h2>
              <p className="text-sm text-gray-500">The top 2 performing students based on class attendance.</p>
            </div>
            <TopAttendanceView 
              enrollments={enrollments}
              initialScores={examScores}
              attendanceMap={attendanceMap}
              totalSessions={validSessions.length}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
