'use client'

import { useState } from 'react'
import { enrollStudent, removeEnrollment } from '@/app/dashboard/admin/batches/enroll-actions'
import { Trash2, UserPlus } from 'lucide-react'

export default function EnrollmentManager({ 
  batchId, 
  students 
}: { 
  batchId: string, 
  students: any[] 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await enrollStudent(batchId, formData)
    
    if (res.success) {
      (e.target as HTMLFormElement).reset()
    } else {
      setError(res.message)
    }
    setIsSubmitting(false)
  }

  const handleRemove = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the batch?')) return
    const res = await removeEnrollment(batchId, studentId)
    if (!res.success) {
      alert(res.message)
    }
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Enroll New Student</h3>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" name="name" required className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
              <input type="text" name="guardian_phone" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <input type="text" name="reference" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Fee</label>
              <input type="number" name="course_fee" defaultValue="0" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
              <input type="number" name="paid_amount" defaultValue="0" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="md:col-start-4">
              <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                <UserPlus className="w-4 h-4" />
                Enroll
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Enrolled Students ({students.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Fee</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Due</th>
                <th className="p-4">Ref</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No students enrolled in this batch.</td>
                </tr>
              )}
              {students.map(s => {
                // Find enrollment data for this student in this batch
                const enrollment = s.enrollment_data // we will pass this from page.tsx
                
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {s.name}
                      <div className="text-xs text-gray-400 font-normal mt-1">{s.guardian_phone ? `G: ${s.guardian_phone}` : ''}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{s.phone || '-'}</td>
                    <td className="p-4 text-sm text-gray-600">৳{enrollment?.course_fee || 0}</td>
                    <td className="p-4 text-sm text-gray-600">৳{enrollment?.paid_amount || 0}</td>
                    <td className="p-4 text-sm text-red-600 font-medium">৳{enrollment?.due_amount || 0}</td>
                    <td className="p-4 text-sm text-gray-600">{enrollment?.reference || '-'}</td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button onClick={() => {
                        // Print Invoice
                        const url = `/invoice?studentId=${s.id}&batchId=${batchId}`
                        window.open(url, '_blank', 'width=800,height=800')
                      }} className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 bg-blue-50 rounded transition-colors">
                        Print Invoice
                      </button>
                      <button onClick={() => handleRemove(s.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors" title="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
