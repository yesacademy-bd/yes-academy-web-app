const fs = require('fs');

const compCode = `'use client'

import { useState } from 'react'
import { searchEnrollments } from '@/app/dashboard/enrollments/actions'
import { cancelEnrollment, switchEnrollment, updateEnrollmentPayment } from '@/app/dashboard/admin/batches/enroll-actions'
import { Search, Edit, X, RefreshCw, AlertTriangle } from 'lucide-react'

export default function StudentDatabaseFilter({ batches, courses }: { batches: any[], courses: any[] }) {
  const [studentName, setStudentName] = useState('')
  const [courseId, setCourseId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const [editingDues, setEditingDues] = useState<any>(null)
  const [cancelling, setCancelling] = useState<any>(null)
  const [switching, setSwitching] = useState<any>(null)
  
  const [remarks, setRemarks] = useState('')
  const [switchCourseId, setSwitchCourseId] = useState('')
  const [targetBatchId, setTargetBatchId] = useState('')

  const filteredSearchBatches = courseId ? batches.filter(b => b.course_id === courseId) : batches
  const filteredSwitchBatches = switchCourseId ? batches.filter(b => b.course_id === switchCourseId) : batches

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    const res = await searchEnrollments(batchId, studentName)
    if (res.success) {
      setResults(res.data || [])
    } else {
      alert(res.message)
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    if (!remarks) return alert("Remarks are required")
    const res = await cancelEnrollment(cancelling.id, remarks, cancelling.batch_id)
    if (res.success) {
      setCancelling(null)
      setRemarks('')
      handleSearch()
    } else alert(res.message)
  }

  const handleSwitch = async () => {
    if (!remarks || !targetBatchId) return alert("Target batch and remarks are required")
    const res = await switchEnrollment(switching.id, targetBatchId, remarks, switching.batch_id)
    if (res.success) {
      setSwitching(null)
      setRemarks('')
      setTargetBatchId('')
      setSwitchCourseId('')
      handleSearch()
    } else alert(res.message)
  }

  const handleUpdateDues = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fee = Number(form.get('course_fee'));
    const paid = Number(form.get('paid_amount'));
    
    const res = await updateEnrollmentPayment(editingDues.id, fee, paid, editingDues.batch_id);
    if (res.success) {
      setEditingDues(null);
      handleSearch()
    } else {
      alert(res.message);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8 mb-8">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Student Database Filter</h2>
      </div>
      
      <form onSubmit={handleSearch} className="p-4 flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
          <select value={courseId} onChange={e => { setCourseId(e.target.value); setBatchId(''); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">All Courses</option>
            {courses?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
          <select value={batchId} onChange={e => setBatchId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">All Batches</option>
            {filteredSearchBatches.map(b => (
              <option key={b.id} value={b.id}>{b.batch_name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
          <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Search name..." className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 flex items-center gap-2">
          <Search className="w-4 h-4" /> Search
        </button>
      </form>

      {results.length > 0 && (
        <div className="overflow-x-auto border-t border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Student</th>
                <th className="p-4">Batch</th>
                <th className="p-4">Fees / Due</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{r.students?.name}</p>
                    <p className="text-xs text-gray-500">{r.students?.phone}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{r.batches?.batch_name}</td>
                  <td className="p-4 text-sm">
                    <span onClick={() => setEditingDues(r)} className="cursor-pointer hover:underline text-red-600 font-medium" title="Update Dues">
                      Due: ৳{r.due_amount || 0}
                    </span>
                    <span className="text-gray-500 text-xs block">Fee: ৳{r.course_fee || 0}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSwitching(r)} className="px-2 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded text-xs font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Switch Batch
                      </button>
                      <button onClick={() => setCancelling(r)} className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dues Modal */}
      {editingDues && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900">Update Dues: {editingDues.students?.name}</h3>
              <button onClick={() => setEditingDues(null)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleUpdateDues}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Fee</label>
                <input type="number" name="course_fee" defaultValue={editingDues.course_fee} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                <input type="number" name="paid_amount" defaultValue={editingDues.paid_amount} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingDues(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Save Dues</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelling && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900">Cancel Admission: {cancelling.students?.name}</h3>
              <button onClick={() => {setCancelling(null); setRemarks('');}} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Remarks</label>
                <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Reason for cancellation..." required></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button onClick={() => {setCancelling(null); setRemarks('');}} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Close</button>
                <button onClick={handleCancel} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Confirm Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Switch Modal */}
      {switching && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900">Batch Switch: {switching.students?.name}</h3>
              <button onClick={() => {setSwitching(null); setRemarks(''); setTargetBatchId(''); setSwitchCourseId('');}} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                <select value={switchCourseId} onChange={e => { setSwitchCourseId(e.target.value); setTargetBatchId(''); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">Select Course...</option>
                  {courses?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Switch to Batch</label>
                <select value={targetBatchId} onChange={e => setTargetBatchId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">Select Target Batch...</option>
                  {filteredSwitchBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.batch_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Switch Remarks</label>
                <textarea rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Reason for switch..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button onClick={() => {setSwitching(null); setRemarks(''); setTargetBatchId(''); setSwitchCourseId('');}} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleSwitch} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium">Confirm Switch</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
`
fs.writeFileSync('src/components/enrollments/StudentDatabaseFilter.tsx', compCode);
