'use client'

import { useState } from 'react'
import { enrollStudent, removeEnrollment, updatePortalAssigned } from '@/app/dashboard/admin/batches/enroll-actions'
import { Trash2, UserPlus, MoreVertical } from 'lucide-react'

export default function EnrollmentManager({ 
  batchId, 
  students 
}: { 
  batchId: string, 
  students: any[] 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [portalFilter, setPortalFilter] = useState<'All' | 'Yes' | 'No'>('All')

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Enrolled Students ({students.length})</h3>
          <select 
            value={portalFilter} 
            onChange={(e) => setPortalFilter(e.target.value as any)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="All">All Students</option>
            <option value="Yes">Portal Assigned - Yes</option>
            <option value="No">Portal Assigned - No</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Guardian Phone</th>
                <th className="p-4">Fee</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Due</th>
                <th className="p-4">Ref</th>
                <th className="p-4 text-center">Portal Assigned</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {students.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">No students enrolled in this batch.</td>
                </tr>
              )}
              {students.filter(s => {
                if (portalFilter === 'All') return true;
                const isAssigned = s.enrollment_data?.portal_assigned === true;
                if (portalFilter === 'Yes') return isAssigned;
                if (portalFilter === 'No') return !isAssigned;
                return true;
              }).map(s => {
                // Find enrollment data for this student in this batch
                const enrollment = s.enrollment_data // we will pass this from page.tsx
                
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {s.name.charAt(0)}
                        </div>
                        {s.name}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{s.phone}</td>
                    <td className="p-4 text-sm text-gray-500">{s.guardian_phone || '-'}</td>
                    <td className="p-4 text-sm text-gray-900">৳{enrollment?.course_fee || 0}</td>
                    <td className="p-4 text-sm text-gray-600">৳{enrollment?.paid_amount || 0}</td>
                    <td className="p-4 text-sm text-red-600 font-medium">৳{enrollment?.due_amount || 0}</td>
                    <td className="p-4 text-sm text-gray-600">{enrollment?.reference || '-'}</td>
                    <td className="p-4 text-center">
                      <select 
                        value={enrollment?.portal_assigned ? 'Yes' : 'No'}
                        onChange={async (e) => {
                          if (!enrollment?.id) return;
                          const res = await updatePortalAssigned(enrollment.id, e.target.value === 'Yes');
                          if (!res.success) alert(res.message || 'Failed to update portal assigned status');
                        }}
                        className="text-xs border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end">
                      <div className="relative group">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1">
                          <button onClick={() => {
                            const url = `/invoice?studentId=${s.id}&batchId=${batchId}`
                            window.open(url, '_blank', 'width=800,height=800')
                          }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Print Invoice
                          </button>
                          
                          <button onClick={() => {
                            const text = `Hello ${s.name},\n\nThis is your enrollment confirmation for ${s.enrollment_data?.reference || 'our course'}.\nTotal Fee: ৳${s.enrollment_data?.course_fee}\nPaid: ৳${s.enrollment_data?.paid_amount}\nDue: ৳${s.enrollment_data?.due_amount}\n\nInstallments:\n${s.enrollment_data?.installments?.map((inst: any) => `Inst ${inst.installment_number}: ৳${inst.amount} Due: ${new Date(inst.due_date).toLocaleDateString()} (${inst.status})`).join('\n') || 'No installments'}\n\nThank you!`
                            window.open(`mailto:${s.email || ''}?subject=Enrollment Confirmation&body=${encodeURIComponent(text)}`)
                          }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Email Enrollment Confirmation
                          </button>

                          <button onClick={() => {
                            const text = `Hello ${s.name},\n\nThis is your enrollment confirmation for ${s.enrollment_data?.reference || 'our course'}.\nTotal Fee: ৳${s.enrollment_data?.course_fee}\nPaid: ৳${s.enrollment_data?.paid_amount}\nDue: ৳${s.enrollment_data?.due_amount}\n\nInstallments:\n${s.enrollment_data?.installments?.map((inst: any) => `Inst ${inst.installment_number}: ৳${inst.amount} Due: ${new Date(inst.due_date).toLocaleDateString()} (${inst.status})`).join('\n') || 'No installments'}\n\nThank you!`
                            window.open(`https://wa.me/${s.phone}?text=${encodeURIComponent(text)}`, '_blank')
                          }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            WhatsApp Enrollment Confirmation
                          </button>

                          <button onClick={() => handleRemove(s.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1">
                            Delete Option
                          </button>
                        </div>
                      </div>
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
