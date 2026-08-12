'use client'

import { Trophy, Star, BookOpen, Clock } from 'lucide-react'

type Enrollment = {
  id: string
  student_id: string
  students: {
    id: string
    name: string
    phone: string
    guardian_phone: string
  }
}

export default function TopAttendanceView({
  enrollments,
  initialScores,
  attendanceMap,
  totalSessions
}: {
  enrollments: Enrollment[]
  initialScores: any[]
  attendanceMap: Record<string, { present: number, total: number }>
  totalSessions: number
}) {
  // Calculate attendance and map performance details
  const studentsWithStats = enrollments.map(enr => {
    const att = attendanceMap[enr.id] || { present: 0, total: 0 }
    
    const attended = att.present
    const totalClassTracked = att.total || totalSessions || 1
    const attendancePercentage = (attended / totalClassTracked) * 100

    const score = initialScores.find(s => s.enrollment_id === enr.id) || {}

    // Calculate a performance sum to break ties if needed
    const perfSum = 
      (Number(score.speaking) || 0) + 
      (Number(score.writing) || 0) + 
      (Number(score.reading) || 0) + 
      (Number(score.listening) || 0)

    return {
      enrollment: enr,
      studentName: enr.students?.name || 'Unknown',
      attended,
      totalClassTracked,
      attendancePercentage,
      perfSum,
      score
    }
  })

  // Sort by attendance percentage DESC, then by perfSum DESC, then by Name
  studentsWithStats.sort((a, b) => {
    if (b.attendancePercentage !== a.attendancePercentage) {
      return b.attendancePercentage - a.attendancePercentage
    }
    if (b.perfSum !== a.perfSum) {
      return b.perfSum - a.perfSum
    }
    return a.studentName.localeCompare(b.studentName)
  })

  // Get Top 2
  const topStudents = studentsWithStats.slice(0, 2)

  if (topStudents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
        <Trophy className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Students Found</h3>
        <p className="text-gray-500 mt-2">There are no enrollments in this batch to display.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {topStudents.map((student, index) => (
        <div key={student.enrollment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Trophy className={`h-6 w-6 ${index === 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <h3 className="text-xl font-bold text-gray-900 uppercase">
                    {student.studentName}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Rank #{index + 1} in Attendance</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-blue-600">
                  {student.attendancePercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {student.attended} / {student.totalClassTracked} Classes
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <Star className="h-3 w-3 mr-1" />
                Performance Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Speaking</div>
                  <div className="font-semibold text-gray-900">{student.score.speaking || '-'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Writing</div>
                  <div className="font-semibold text-gray-900">{student.score.writing || '-'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Reading</div>
                  <div className="font-semibold text-gray-900">{student.score.reading || '-'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Listening</div>
                  <div className="font-semibold text-gray-900">{student.score.listening || '-'}</div>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50/50 p-3 rounded-lg flex items-center justify-between border border-blue-100">
                <div className="flex items-center text-blue-800">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Weekly Practice Time</span>
                </div>
                <div className="font-bold text-blue-900">
                  {student.score.weekly_practice_time ? `${student.score.weekly_practice_time} hrs` : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
