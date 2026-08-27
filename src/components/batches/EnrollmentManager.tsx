'use client'

import { useState } from 'react'
import { enrollStudent, removeEnrollment, updatePortalAssigned, updateEnrollmentPayment } from '@/app/dashboard/admin/batches/enroll-actions'
import { Trash2, UserPlus, MoreVertical, X } from 'lucide-react'

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingPayment, setEditingPayment] = useState<any>(null)
  const [optimisticPortal, setOptimisticPortal] = useState<Record<string, boolean>>({})

  const handlePortalChange = async (enrollmentId: string, newValue: boolean) => {
    // 1. Instantly update the UI without waiting for the server
    setOptimisticPortal(prev => ({ ...prev, [enrollmentId]: newValue }))
    
    // 2. Save to database in the background
    const res = await updatePortalAssigned(enrollmentId, newValue, batchId)
    if (!res.success) {
      // Revert if it fails
      setOptimisticPortal(prev => {
        const next = { ...prev }
        delete next[enrollmentId]
        return next
      })
      alert(res.message || 'Failed to update portal assigned status')
    }
  }

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
                const isAssigned = optimisticPortal[s.enrollment_data?.id] ?? (s.enrollment_data?.portal_assigned === true);
                if (portalFilter === 'Yes') return isAssigned;
                if (portalFilter === 'No') return !isAssigned;
                return true;
              }).map(s => {
                // Find enrollment data for this student in this batch
                const enrollment = s.enrollment_data // we will pass this from page.tsx
                const isAssigned = optimisticPortal[enrollment?.id] ?? enrollment?.portal_assigned
                
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
                      <td className="p-4 text-sm text-red-600 font-medium">
                        <span 
                          onClick={() => setEditingPayment({ s, enrollment })}
                          className="cursor-pointer hover:underline"
                          title="Click to edit payment"
                        >
                          ৳{enrollment?.due_amount || 0}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{enrollment?.reference || '-'}</td>
                      <td className="p-4 text-center">
                        <select 
                          value={isAssigned ? 'Yes' : 'No'}
                          onChange={(e) => {
                            if (enrollment?.id) handlePortalChange(enrollment.id, e.target.value === 'Yes');
                          }}
                          className="text-xs border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500"
                        >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end">
                      <div className="relative">
                        <button onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)} className="p-2 hover:bg-[#ffffff33] rounded-full transition-colors text-white">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openMenuId === s.id && (
                        <div className="absolute right-0 top-full mt-1 w-64 bg-[#1e3a8a] border border-[#93c5fd] rounded-lg shadow-2xl z-[9999] py-1 overflow-hidden">
                          <button onClick={() => {
                            setOpenMenuId(null);
                            const url = `/invoice?studentId=${s.id}&batchId=${batchId}`
                            window.open(url, '_blank', 'width=800,height=800')
                          }} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3b82f6] !text-white" style={{ WebkitTextFillColor: 'white' }}>
                            Print Invoice
                          </button>
                          
                          <button onClick={async (e) => {
                            setOpenMenuId(null);
                            
                            const sumHistory = s.enrollment_data?.payment_history?.reduce((s: any, h: any) => s + h.amount_paid, 0) || 0
                            const breakdown: any[] = []
                            if (s.enrollment_data?.paid_amount > sumHistory) {
                              breakdown.push({ label: `Initial Payment (${s.enrollment_data?.payment_method || 'Cash'})`, amount: s.enrollment_data?.paid_amount - sumHistory })
                            }
                            [...(s.enrollment_data?.payment_history || [])].reverse().forEach((h: any) => {
                              breakdown.push({ label: `Stage ${breakdown.length + 1} Payment (${h.payment_method})`, amount: h.amount_paid })
                            })
                            
                            const instHtml = (s.enrollment_data?.installments?.length || 0) > 0 ? `
                              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Installment Plan</h3>
                                ${s.enrollment_data.installments.map((inst: any) => `
                                  <div style="display: flex; justify-content: space-between; color: #555; font-size: 0.9em; margin-bottom: 5px;">
                                    <span>Inst ${inst.installment_number} (${new Date(inst.due_date).toLocaleDateString('en-GB')} - ${inst.status})</span>
                                    <span>৳${inst.amount}</span>
                                  </div>
                                `).join('')}
                              </div>
                            ` : ''

                            const html = `
                              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                                <h2 style="color: #2563eb;">YES Academy - Enrollment Confirmation</h2>
                                <p>Dear <strong>${s.name}</strong>,</p>
                                <p>This is your enrollment confirmation for <strong>${s.enrollment_data?.reference || 'our course'}</strong>.</p>
                                
                                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                  <h3 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Payment Summary</h3>
                                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                    <span><strong>Total Fee:</strong></span>
                                    <span>৳${s.enrollment_data?.course_fee}</span>
                                  </div>
                                  ${breakdown.map(b => `
                                    <div style="display: flex; justify-content: space-between; color: #555; font-size: 0.9em; margin-bottom: 5px;">
                                      <span>${b.label}</span>
                                      <span>৳${b.amount}</span>
                                    </div>
                                  `).join('')}
                                  <div style="display: flex; justify-content: space-between; margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px;">
                                    <span><strong>Total Amount Paid:</strong></span>
                                    <span>- ৳${s.enrollment_data?.paid_amount}</span>
                                  </div>
                                  <div style="display: flex; justify-content: space-between; margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px; color: #dc2626; font-size: 1.1em;">
                                    <span><strong>Amount Due:</strong></span>
                                    <span><strong>৳${s.enrollment_data?.due_amount}</strong></span>
                                  </div>
                                </div>
                                ${instHtml}
                                <p>Thank you for choosing YES Academy.</p>
                              </div>
                            `

                            if (!s.email) {
                              alert('No email address found for this student.')
                              return
                            }
                            
                            const btn = e.currentTarget
                            btn.innerText = 'Sending...'
                            const { sendDirectEmail } = await import('@/app/dashboard/email-actions')
                            const res = await sendDirectEmail(s.email, 'YES Academy - Enrollment Confirmation', html)
                            btn.innerText = 'Email Enrollment Confirmation'
                            
                            if (res.success) alert('Email sent successfully!')
                            else alert(res.message || 'Failed to send email.')
                          }} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3b82f6] !text-white" style={{ WebkitTextFillColor: 'white' }}>
                            Email Enrollment Confirmation
                          </button>

                          <button onClick={() => {
                            setOpenMenuId(null);
                            
                            const sumHistory = s.enrollment_data?.payment_history?.reduce((s: any, h: any) => s + h.amount_paid, 0) || 0
                            const breakdown: any[] = []
                            if (s.enrollment_data?.paid_amount > sumHistory) {
                              breakdown.push({ label: `Initial Payment (${s.enrollment_data?.payment_method || 'Cash'})`, amount: s.enrollment_data?.paid_amount - sumHistory })
                            }
                            [...(s.enrollment_data?.payment_history || [])].reverse().forEach((h: any) => {
                              breakdown.push({ label: `Stage ${breakdown.length + 1} Payment (${h.payment_method})`, amount: h.amount_paid })
                            })
                            
                            const text = `Hello ${s.name},\n\nThis is your enrollment confirmation for ${s.enrollment_data?.reference || 'our course'}.\nTotal Fee: ৳${s.enrollment_data?.course_fee}\n\nPayments Breakdown:\n${breakdown.map(b => `${b.label}: ৳${b.amount}`).join('\n')}\n--------------------\nTotal Amount Paid: ৳${s.enrollment_data?.paid_amount}\n\nAmount Due: ৳${s.enrollment_data?.due_amount}\n\nInstallments:\n${s.enrollment_data?.installments?.map((inst: any) => `Inst ${inst.installment_number}: ৳${inst.amount} Due: ${new Date(inst.due_date).toLocaleDateString('en-GB')} (${inst.status})`).join('\n') || 'No installments'}\n\nThank you!`
                            window.open(`https://wa.me/${s.phone}?text=${encodeURIComponent(text)}`, '_blank')
                          }} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3b82f6] !text-white" style={{ WebkitTextFillColor: 'white' }}>
                            WhatsApp Enrollment Confirmation
                          </button>

                          <button onClick={() => { setOpenMenuId(null); handleRemove(s.id); }} className="w-full text-left px-4 py-2 text-sm text-[#fca5a5] hover:bg-[#ef4444] hover:text-white border-t border-[#93c5fd] mt-1" style={{ WebkitTextFillColor: 'currentColor' }}>
                            Delete Option
                          </button>
                        </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Edit Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-semibold text-white">Update Payment: {editingPayment.s.name}</h3>
              <button onClick={() => setEditingPayment(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="p-4 space-y-4 overflow-y-auto" onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const fee = Number(form.get('course_fee'));
              const paid = Number(form.get('paid_amount'));
              
              const res = await updateEnrollmentPayment(editingPayment.enrollment.id, fee, paid, batchId);
              if (res.success) {
                setEditingPayment(null);
              } else {
                alert(res.message);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Course Fee</label>
                <input type="number" name="course_fee" defaultValue={editingPayment.enrollment.course_fee} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Paid Amount</label>
                <input type="number" name="paid_amount" defaultValue={editingPayment.enrollment.paid_amount} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Due Amount (Auto-calculated)</label>
                <input type="number" defaultValue={editingPayment.enrollment.due_amount} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-slate-400 rounded-lg outline-none cursor-not-allowed" disabled />
                <p className="text-xs text-slate-500 mt-1">Due amount will update automatically when you save.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingPayment(null)} className="px-4 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
