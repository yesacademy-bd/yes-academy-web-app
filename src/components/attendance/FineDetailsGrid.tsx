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
  fine_amount: number | null
}

export default function FineDetailsGrid({
  batchId,
  enrollments,
  initialScores,
  attendanceMap,
  totalSessions
}: {
  batchId: string
  enrollments: Enrollment[]
  initialScores: any[]
  attendanceMap: Record<string, { present: number, total: number }>
  totalSessions: number
}) {
  const [scores, setScores] = useState<any[]>(initialScores)
  const [savingField, setSavingField] = useState<string | null>(null)

  const handleFineChange = async (enrollmentId: string, val: string) => {
    const value = val === '' ? null : Number(val)
    
    // Optimistic update
    setScores(prev => {
      const existing = prev.find(s => s.enrollment_id === enrollmentId)
      if (existing) {
        return prev.map(s => s.enrollment_id === enrollmentId ? { ...s, fine_amount: value } : s)
      } else {
        return [...prev, {
          id: 'temp-' + Date.now(),
          enrollment_id: enrollmentId,
          fine_amount: value
        }]
      }
    })

    setSavingField(enrollmentId)
    await updateStudentProgress(enrollmentId, batchId, 'fine_amount', value)
    setSavingField(null)
  }

  const getFine = (enrollmentId: string) => {
    const score = scores.find(s => s.enrollment_id === enrollmentId)
    return score?.fine_amount !== null && score?.fine_amount !== undefined ? score.fine_amount : ''
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="p-4 whitespace-nowrap sticky left-0 bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]">Student Name</th>
              <th className="p-4 whitespace-nowrap text-center">Total Sessions Marked</th>
              <th className="p-4 whitespace-nowrap text-center">Present</th>
              <th className="p-4 whitespace-nowrap text-center">Absent</th>
              <th className="p-4 whitespace-nowrap text-center text-red-600">Calculated Fine (100 BDT/Absent)</th>
              <th className="p-4 whitespace-nowrap text-center text-blue-600">Applied Fine (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enrollments.map((e) => {
              const att = attendanceMap[e.student_id] || { present: 0, total: 0 }
              const absent = att.total - att.present
              const calculatedFine = absent * 100

              return (
                <tr key={e.id} className="hover:bg-gray-50 group">
                  <td className="p-4 sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb] font-medium text-gray-900 text-sm whitespace-nowrap">
                    {e.students.name}
                  </td>
                  <td className="p-4 text-center text-gray-700">{att.total}</td>
                  <td className="p-4 text-center text-green-600 font-medium">{att.present}</td>
                  <td className="p-4 text-center text-red-600 font-medium">{absent}</td>
                  <td className="p-4 text-center font-bold text-gray-900">
                    {calculatedFine} BDT
                  </td>
                  
                  <td className="p-4 text-center">
                    <div className="relative inline-block w-28">
                      <input
                        type="number"
                        placeholder={calculatedFine.toString()}
                        value={getFine(e.id)}
                        onChange={(ev) => handleFineChange(e.id, ev.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-colors
                          ${savingField === e.id ? 'bg-blue-50 border-blue-200' : 'border-gray-300'}`}
                      />
                      {savingField === e.id && (
                        <Save className="w-4 h-4 text-blue-500 absolute right-3 top-1/2 -translate-y-1/2 animate-pulse" />
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
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
