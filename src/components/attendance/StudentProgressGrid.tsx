'use client'

import { useState } from 'react'
import { updateStudentProgress } from '@/app/actions/progress'
import { Save } from 'lucide-react'

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
  const [scores, setScores] = useState<ExamScore[]>(initialScores)
  const [savingField, setSavingField] = useState<string | null>(null)

  const handleScoreChange = async (enrollmentId: string, field: keyof ExamScore, val: string) => {
    const value = val === '' ? null : Number(val)
    
    // Optimistic update
    setScores(prev => {
      const existing = prev.find(s => s.enrollment_id === enrollmentId)
      if (existing) {
        return prev.map(s => s.enrollment_id === enrollmentId ? { ...s, [field]: value } : s)
      } else {
        return [...prev, {
          id: 'temp-' + Date.now(),
          enrollment_id: enrollmentId,
          speaking: null, writing: null, reading: null, listening: null,
          weekly_practice_hours: null, mock_test_score: null,
          [field]: value
        }]
      }
    })

    setSavingField(`${enrollmentId}-${field}`)
    await updateStudentProgress(enrollmentId, batchId, field, value)
    setSavingField(null)
  }

  const getScore = (enrollmentId: string, field: keyof ExamScore) => {
    const score = scores.find(s => s.enrollment_id === enrollmentId)
    return score ? score[field] : ''
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="p-3 whitespace-nowrap sticky left-0 bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]">Student</th>
              <th className="p-3 whitespace-nowrap text-center">Attendance %</th>
              <th className="p-3 whitespace-nowrap text-center">Practice Hrs/Wk</th>
              <th className="p-3 whitespace-nowrap text-center">Mock Test</th>
              <th className="p-3 whitespace-nowrap text-center">Speaking</th>
              <th className="p-3 whitespace-nowrap text-center">Listening</th>
              <th className="p-3 whitespace-nowrap text-center">Reading</th>
              <th className="p-3 whitespace-nowrap text-center">Writing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enrollments.map((e) => {
              const att = attendanceMap[e.student_id]
              const attPct = att && att.total > 0 ? Math.round((att.present / att.total) * 100) : 0

              return (
                <tr key={e.id} className="hover:bg-gray-50 group">
                  <td className="p-3 sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb] font-medium text-gray-900 text-sm whitespace-nowrap">
                    {e.students.name}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${attPct >= 80 ? 'bg-green-100 text-green-700' : attPct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {attPct}%
                    </span>
                  </td>
                  
                  {/* Inputs */}
                  {['weekly_practice_hours', 'mock_test_score', 'speaking', 'listening', 'reading', 'writing'].map(field => (
                    <td key={field} className="p-2 text-center">
                      <div className="relative inline-block w-20">
                        <input
                          type="number"
                          step="0.5"
                          value={getScore(e.id, field as keyof ExamScore) as string | number}
                          onChange={(ev) => handleScoreChange(e.id, field as keyof ExamScore, ev.target.value)}
                          className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-colors
                            ${savingField === `${e.id}-${field}` ? 'bg-blue-50 border-blue-200' : 'border-gray-300'}`}
                        />
                        {savingField === `${e.id}-${field}` && (
                          <Save className="w-3 h-3 text-blue-500 absolute right-2 top-1/2 -translate-y-1/2 animate-pulse" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              )
            })}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  No students enrolled in this batch.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
