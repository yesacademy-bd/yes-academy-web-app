'use client'

import { useState } from 'react'
import StudentProgressModal from './StudentProgressModal'

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

type ExamScore = {
  id: string
  enrollment_id: string
  speaking: number | null
  writing: number | null
  reading: number | null
  listening: number | null
  weekly_practice_hours: number | null
  mock_test_score: number | null
}

export default function StudentProgressGrid({
  batchId,
  enrollments,
  initialScores,
  attendanceMap
}: {
  batchId: string
  enrollments: Enrollment[]
  initialScores: ExamScore[]
  attendanceMap: Record<string, { present: number, total: number }>
}) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-3 whitespace-nowrap sticky left-0 bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]">Student</th>
                <th className="p-3 whitespace-nowrap text-center">Attendance %</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-gray-200">
            {enrollments.map((e) => {
              const att = attendanceMap[e.student_id]
              const attPct = att && att.total > 0 ? Math.round((att.present / att.total) * 100) : 0

              return (
                <tr key={e.id} className="hover:bg-gray-50 group">
                  <td className="p-3 sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb] font-medium text-gray-900 text-sm whitespace-nowrap">
                    <span 
                      className="cursor-pointer hover:text-blue-600 transition-colors inline-block"
                      onClick={() => setSelectedStudent({ ...e.students, enrollment_id: e.id })}
                      title="Click to view/edit Progress & Details"
                    >
                      {e.students.name}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${attPct >= 80 ? 'bg-green-100 text-green-700' : attPct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {attPct}%
                    </span>
                  </td>
                  
                </tr>
              )
            })}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-gray-500">
                  No students enrolled in this batch.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    
    {selectedStudent && (
      <StudentProgressModal 
        isOpen={!!selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
        student={selectedStudent} 
      />
    )}
    </>
  )
}
