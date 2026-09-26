'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FileText, Calendar, Trash2, Mail, Printer, RefreshCw, Edit } from 'lucide-react'
import { createMockService, deleteMockService, sendConfirmationEmail, updateMockDate, updateMockService } from './actions'
import { fetchPteMockReport, resendPteReportEmail } from './pte-report/actions'

const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('01') && cleaned.length === 11) return `88${cleaned}`
  return cleaned
}

export default function MockClient({ initialMocks, initialReports = [] }: { initialMocks: any[], initialReports?: any[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const [mocks] = useState(initialMocks)
  const [reports] = useState(initialReports)
  const [selectedMonthStr, setSelectedMonthStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })

  const slotSummary = useMemo(() => {
    const summary: Record<string, any> = {};
    const [sYear, sMonth] = selectedMonthStr.split('-');
    
    // Process mocks for the selected month
    mocks.forEach(m => {
      const examDateStr = m.exam_date; // YYYY-MM-DD
      if (!examDateStr) return;
      const [y, mm, d] = examDateStr.split('-');
      if (y === sYear && mm === sMonth) {
        if (m.service_type !== 'IELTS Mock' && m.service_type !== 'PTE Mock') return;
        const key = `${examDateStr}_${m.service_type}`;
        if (!summary[key]) {
          const dateObj = new Date(examDateStr);
          summary[key] = {
            date: examDateStr,
            day: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
            mock_type: m.service_type,
            total_slots: 10,
            booked: 0
          };
        }
        summary[key].booked += 1;
      }
    });
    
    const rows = Object.values(summary).sort((a, b) => a.date.localeCompare(b.date));
    let totalSessions = rows.length;
    let totalSlots = totalSessions * 10;
    let totalBooked = rows.reduce((acc, r) => acc + r.booked, 0);
    
    return {
      rows,
      totalSessions,
      totalSlots,
      totalBooked,
      totalRemaining: totalSlots - totalBooked
    };
  }, [mocks, selectedMonthStr])


  const [isSubmitting, setIsSubmitting] = useState(false)
  const [studentType, setStudentType] = useState('Inhouse')
  const [mockStatus, setMockStatus] = useState('Paid')
  const [isSuccess, setIsSuccess] = useState(false)
  const [mockType, setMockType] = useState('IELTS Mock')
  const [editModal, setEditModal] = useState({ isOpen: false, mock: null as any })
  const [isEditing, setIsEditing] = useState(false)
  const [switchModal, setSwitchModal] = useState({isOpen: false, id: '', currentDate: '', studentName: '', mockType: ''})
  
  // PTE Report Viewer state
  const [reportModal, setReportModal] = useState({ isOpen: false, reportData: null as any, isLoading: false })
  const [isResending, setIsResending] = useState(false)

  const [newDate, setNewDate] = useState('')
  const [isSwitching, setIsSwitching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailingId, setEmailingId] = useState<string | null>(null)

  
  const handleSwitchDate = async () => {
    if (!newDate) return alert('Please select a new date.')
    setIsSwitching(true)
    const res = await updateMockDate(switchModal.id, newDate)
    if (res.success) {
      alert('Date successfully switched!')
      window.location.reload()
    } else {
      alert(res.message || 'Failed to switch date')
      setIsSwitching(false)
    }
  }

  const handleSendEmail = async (m: any) => {
    setEmailingId(m.id)
    const res = await sendConfirmationEmail(m, 'Mock Service')
    if (res.success) {
      alert('Email sent successfully!')
    } else {
      alert(res.message || 'Failed to send email.')
    }
    setEmailingId(null)
  }

  const handleViewReport = async (reportId: string) => {
    setReportModal({ isOpen: true, reportData: null, isLoading: true })
    const res = await fetchPteMockReport(reportId)
    if (res.success && res.data) {
      setReportModal({ isOpen: true, reportData: res.data, isLoading: false })
    } else {
      alert('Failed to load report data.')
      setReportModal({ isOpen: false, reportData: null, isLoading: false })
    }
  }

  const handleResendReportEmail = async (reportId: string) => {
    setIsResending(true)
    const res = await resendPteReportEmail(reportId)
    setIsResending(false)
    alert(res.message)
    // Update local state if successful to show 'Sent' instead of 'Failed'
    if (res.success) {
      setReportModal(prev => ({
        ...prev,
        reportData: { ...prev.reportData, email_status: 'Sent' }
      }))
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsEditing(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateMockService(editModal.mock.id, formData)
    if (res.success) {
      alert('Mock service updated successfully!')
      window.location.reload()
    } else {
      alert(res.message || 'Failed to update mock service')
      setIsEditing(false)
    }
  }

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await createMockService(formData)
      if (res.success) {
        setIsSuccess(true)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
      setError(res.message || 'Failed to add mock service')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this mock service?')) return
    const res = await deleteMockService(id)
    if (res.success) {
      window.location.reload()
    } else {
      alert(res.message || 'Failed to delete mock service')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" /> New Mock Service
          </h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Type</label>
                <select name="student_type" required value={studentType} onChange={e => setStudentType(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="Inhouse">Inhouse</option>
                  <option value="External">External</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mock Status</label>
                <select name="mock_status" required value={mockStatus} onChange={e => setMockStatus(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="Paid">Paid</option>
                  <option value="Free">Free</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input type="text" name="student_name" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            {studentType === 'Inhouse' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                <input type="text" name="batch_number" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Batch Number" />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Email (Optional)</label>
              <input type="email" name="email" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mock Type</label>
              <select name="mock_type" required value={mockType} onChange={e => setMockType(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="IELTS Mock">IELTS Mock</option>
                <option value="PTE Mock">PTE Mock</option>
              </select>
            </div>

            {mockType === 'IELTS Mock' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:col-span-3 border-l-4 border-blue-500 pl-4 py-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-r-lg mt-2 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Speaking Time</label>
                  <input type="time" name="speaking_time" className="w-full border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Speaking Method</label>
                  <select name="speaking_method" className="w-full border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Speaking Teacher</label>
                  <input type="text" name="assigned_speaking_teacher" className="w-full border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Teacher name" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                <input type="date" name="exam_date" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              <p className="text-xs text-gray-500 mt-1">PTE: Sun/Thu | IELTS: Tue. Capacity: 10.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Time (Optional)</label>
                <input type="time" name="exam_time" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Venue (Optional)</label>
              <input type="text" name="exam_venue" placeholder="e.g. Room 101" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            {mockStatus === 'Paid' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Fee</label>
                    <input type="number" name="amount" defaultValue="0" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid</label>
                    <input type="number" name="paid_amount" defaultValue="0" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select name="payment_method" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
              </>
            )}

            </div> {/* End of grid */}
            
            <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration By</label>
              <input type="text" disabled value="Automatically recorded based on your login" className="w-full border-gray-300 bg-gray-50 text-gray-500 rounded-md shadow-sm" />
            </div>

            {isSuccess ? (
                <div className="w-full md:w-1/2 flex justify-end items-center p-2 animate-in fade-in zoom-in duration-500">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mr-3 shadow-lg scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-green-600 font-bold text-lg">Booking Confirmed Successfully</span>
                </div>
              ) : (
                <div className="w-full md:w-1/2 flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 text-lg shadow-md hover:shadow-lg">
                    {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        
        {/* Monthly Mock Slot Summary */}
        <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Monthly Mock Slot Summary
            </h3>
            <input 
              type="month" 
              value={selectedMonthStr} 
              onChange={e => setSelectedMonthStr(e.target.value)} 
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="p-4 bg-indigo-50/50 border-b border-gray-200 flex flex-wrap gap-6 text-sm">
            <div><span className="text-gray-500">Total Sessions:</span> <span className="font-bold text-gray-900">{slotSummary.totalSessions}</span></div>
            <div><span className="text-gray-500">Total Slots:</span> <span className="font-bold text-gray-900">{slotSummary.totalSlots}</span></div>
            <div><span className="text-gray-500">Total Booked:</span> <span className="font-bold text-gray-900">{slotSummary.totalBooked}</span></div>
            <div><span className="text-gray-500">Total Remaining:</span> <span className="font-black text-green-500">{slotSummary.totalRemaining}</span></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Day</th>
                  <th className="p-4">Mock Type</th>
                  <th className="p-4 text-center">Total Slots</th>
                  <th className="p-4 text-center">Booked</th>
                  <th className="p-4 text-center">Remaining</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {slotSummary.rows.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-gray-500">No mock sessions scheduled for this month.</td></tr>
                )}
                {slotSummary.rows.map((row: any, idx: number) => {
                  const remaining = row.total_slots - row.booked;
                  let statusColor = 'bg-blue-100 text-blue-700';
                  let statusText = 'Available';
                  if (remaining === 0) { statusColor = 'bg-red-100 text-red-700'; statusText = 'Full'; }
                  else if (remaining <= 3) { statusColor = 'bg-amber-100 text-amber-700'; statusText = 'Almost Full'; }
                  
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="p-4 text-sm text-gray-600">{row.day}</td>
                      <td className="p-4 text-sm text-gray-900">{row.mock_type}</td>
                      <td className="p-4 text-sm text-center">{row.total_slots}</td>
                      <td className="p-4 text-sm text-center font-medium">{row.booked}</td>
                      <td className="p-4 text-sm text-center font-black text-green-500">{remaining}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>{statusText}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" /> Mock History
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Exam Details</th>
                  <th className="p-4 text-right">Fee / Due</th>
                  <th className="p-4 text-left">Registration By</th>
                  <th className="p-4 text-center">Mock Report</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mocks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">No mock services recorded.</td>
                  </tr>
                )}
                {mocks.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-500">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{m.student_name}</p>
                      <p className="text-sm text-gray-500">{m.phone}</p>
                      {m.email && <p className="text-xs text-gray-400">{m.email}</p>}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600 font-medium">{m.service_type || m.mock_type}</p>
                      {(m.exam_time || m.exam_venue) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {m.exam_time && <span>{m.exam_time}</span>}
                          {m.exam_time && m.exam_venue && <span className="mx-1">|</span>}
                          {m.exam_venue && <span>{m.exam_venue}</span>}
                        </p>
                      )}
                      {(m.service_type === 'IELTS Mock' || m.mock_type === 'IELTS Mock') && (m.speaking_time || m.assigned_speaking_teacher) && (
                        <div className="text-xs text-blue-600 mt-2 bg-blue-50 inline-block px-2 py-1 rounded border border-blue-100">
                          <strong>Speaking:</strong> {m.speaking_time} {m.speaking_method ? `(${m.speaking_method})` : ''} 
                          {m.assigned_speaking_teacher ? ` - ${m.assigned_speaking_teacher}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-right">
                      <p>Fee: ৳{m.course_fee}</p>
                      <p className="text-red-600 font-medium">Due: ৳{m.due_amount}</p>
                    </td>
                                        <td className="p-4 align-middle">
                      <div className="flex flex-col gap-2 items-center justify-center max-w-[140px] mx-auto">
                        <div className="flex gap-1.5 p-1 bg-gray-50/50 rounded-lg border border-gray-100">
                          <button
                            onClick={() => handleSendEmail(m)}
                            disabled={!m.email || emailingId === m.id}
                            className={`inline-flex items-center justify-center p-1.5 rounded-md transition-colors ${!m.email ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-sky-100 text-sky-600 hover:bg-sky-200 disabled:opacity-50'}`}
                            title={m.email ? "Send Confirmation Email" : "No email address provided"}
                          >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </button>
                          <a
                            href={`https://wa.me/${formatPhone(m.phone)}?text=${encodeURIComponent(`Hello ${m.student_name}, this is a confirmation for your ${m.service_type || m.mock_type}. Your exam is scheduled on ${new Date(m.exam_date).toLocaleDateString()}${m.exam_time ? ` at ${m.exam_time}` : ''}${m.exam_venue ? ` at ${m.exam_venue}` : ''}. Fee: ৳${m.course_fee}, Paid: ৳${m.paid_amount || 0}, Due: ৳${m.due_amount}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                            title="Send WhatsApp Confirmation"
                          >
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.183-.573c.978.582 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.765-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"/></svg>
                          </a>
                        </div>
                        <div className="flex gap-1.5 p-1 bg-gray-50/50 rounded-lg border border-gray-100">
                          <button
                            onClick={() => setEditModal({ isOpen: true, mock: m })}
                            className="inline-flex items-center justify-center p-1.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors"
                            title="Edit Mock Service"
                          >
                            <Edit className="w-4 h-4 shrink-0" />
                          </button>
                          <button
                            onClick={() => setSwitchModal({isOpen: true, id: m.id, currentDate: m.exam_date, studentName: m.student_name, mockType: m.service_type || m.mock_type})}
                            className="inline-flex items-center justify-center p-1.5 bg-amber-100 text-amber-600 rounded-md hover:bg-amber-200 transition-colors"
                            title="Switch Date"
                          >
                            <Calendar className="w-4 h-4 shrink-0" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="inline-flex items-center justify-center p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                            title="Delete Mock Service"
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
                          </button>
                        </div>
                      </div>
                    </td>
</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      
      {/* Edit Mock Modal */}
      {editModal.isOpen && editModal.mock && mounted && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-4xl w-full border border-gray-300 relative overflow-hidden" style={{ opacity: 1, isolation: 'isolate' }}>
            
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" /> Edit Mock Service
              </h2>
              <button onClick={() => setEditModal({ isOpen: false, mock: null })} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form id="editMockForm" onSubmit={handleEdit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Type</label>
                      <select name="student_type" required defaultValue={editModal.mock.student_type} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="Inhouse">Inhouse</option>
                        <option value="External">External</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mock Status</label>
                      <select name="mock_status" required defaultValue={editModal.mock.mock_status} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="Paid">Paid</option>
                        <option value="Free">Free</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                    <input type="text" name="student_name" required defaultValue={editModal.mock.student_name} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <input type="text" name="batch_number" defaultValue={editModal.mock.batch_number || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" name="phone" required defaultValue={editModal.mock.phone} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" required defaultValue={editModal.mock.email} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Fee (Amount)</label>
                    <input type="number" name="amount" defaultValue={editModal.mock.course_fee} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                    <input type="number" name="paid_amount" defaultValue={editModal.mock.paid_amount} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mock Type</label>
                    <select name="mock_type" required defaultValue={editModal.mock.service_type || editModal.mock.mock_type} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="IELTS Mock">IELTS Mock</option>
                      <option value="PTE Mock">PTE Mock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                    <input type="date" name="exam_date" required defaultValue={editModal.mock.exam_date} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Time</label>
                    <input type="text" name="exam_time" defaultValue={editModal.mock.exam_time || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Venue</label>
                    <input type="text" name="exam_venue" defaultValue={editModal.mock.exam_venue || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaking Time (IELTS)</label>
                    <input type="text" name="speaking_time" defaultValue={editModal.mock.speaking_time || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaking Method (IELTS)</label>
                    <input type="text" name="speaking_method" defaultValue={editModal.mock.speaking_method || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaking Teacher (IELTS)</label>
                    <input type="text" name="assigned_speaking_teacher" defaultValue={editModal.mock.assigned_speaking_teacher || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setEditModal({ isOpen: false, mock: null })} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                Cancel
              </button>
              <button type="submit" form="editMockForm" disabled={isEditing} className="px-5 py-2.5 bg-blue-600 border border-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm">
                {isEditing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch Date Modal */}
      {switchModal.isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-md w-full border border-gray-300 relative overflow-hidden" style={{ opacity: 1, isolation: 'isolate' }}>
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 m-0">
                <Calendar className="w-6 h-6 text-blue-600" /> Switch Mock Date
              </h3>
            </div>

            <div className="p-6 bg-white">
              {/* Information Section */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Student</p>
                    <p className="text-sm font-bold text-gray-900">{switchModal.studentName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Mock Type</p>
                    <p className="text-sm font-bold text-gray-900">{switchModal.mockType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Slots</p>
                    <p className="text-sm font-bold text-gray-900">10</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Current Date</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(switchModal.currentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Date Input Section */}
              <div className="mb-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">New Exam Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={e => setNewDate(e.target.value)} 
                  className="w-full border-2 border-gray-300 bg-white text-gray-900 rounded-xl shadow-sm focus:border-blue-600 focus:ring-blue-600 px-4 py-3 font-medium transition-colors outline-none" 
                />
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                                        <button
                            onClick={() => setEditModal({ isOpen: true, mock: m })}
                            className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit Mock Service"
                          >
                            <Edit className="w-5 h-5 shrink-0" />
                          </button>
                          <button 
                onClick={() => setSwitchModal({isOpen: false, id: '', currentDate: '', studentName: '', mockType: ''})} 
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSwitchDate} 
                disabled={isSwitching} 
                className="px-5 py-2.5 bg-blue-600 border border-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isSwitching ? 'Saving...' : 'Confirm Switch Date'}
              </button>
            </div>
            
          </div>
        </div>,
        document.body
      )}

      {/* Report Viewer Modal */}
      {reportModal.isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-300 relative" style={{ opacity: 1, isolation: 'isolate' }}>
            
            {reportModal.isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading report data...</p>
              </div>
            ) : reportModal.reportData ? (
              <>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" /> PTE Academic Feedback Form
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        const content = document.getElementById('printable-report-content');
                        if (content) {
                          const originalContents = document.body.innerHTML;
                          document.body.innerHTML = content.innerHTML;
                          window.print();
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm shadow-sm"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button 
                      onClick={() => setReportModal({ isOpen: false, reportData: null, isLoading: false })}
                      className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div id="printable-report-content" className="p-6 overflow-y-auto flex-1 bg-white">
                  <style>{`
                    @media print {
                      body * { visibility: hidden; }
                      #printable-report-content, #printable-report-content * { visibility: visible; }
                      #printable-report-content { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; }
                    }
                  `}</style>
                  
                  <div className="text-center mb-8 pb-4 border-b-2 border-red-600">
                    <h1 className="text-3xl font-bold text-red-700 uppercase tracking-widest mb-1">YES ACADEMY</h1>
                    <h2 className="text-xl font-semibold text-blue-900">PTE ACADEMIC FEEDBACK FORM</h2>
                    <p className="text-sm text-gray-600 mt-2 font-medium">YES ACADEMY &mdash; STUDENT PROGRESS & MODULE EVALUATION</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-blue-50/50 p-5 rounded-lg border border-blue-100 mb-8">
                    <div><p className="text-xs uppercase text-gray-500 font-bold mb-1">Student Name</p><p className="font-semibold text-gray-900">{reportModal.reportData.student_name}</p></div>
                    <div><p className="text-xs uppercase text-gray-500 font-bold mb-1">Student Type</p><p className="font-semibold text-gray-900">{reportModal.reportData.student_type || 'N/A'}</p></div>
                    <div><p className="text-xs uppercase text-gray-500 font-bold mb-1">Batch Number</p><p className="font-semibold text-gray-900">{reportModal.reportData.batch_number || 'N/A'}</p></div>
                    <div><p className="text-xs uppercase text-gray-500 font-bold mb-1">Student Email</p><p className="font-semibold text-gray-900">{reportModal.reportData.student_email || 'N/A'}</p></div>
                    <div><p className="text-xs uppercase text-gray-500 font-bold mb-1">Trainer Name</p><p className="font-semibold text-gray-900">{reportModal.reportData.trainer_name}</p></div>
                    <div><p className="text-xs uppercase text-gray-500 font-bold mb-1">Date</p><p className="font-semibold text-gray-900">{new Date(reportModal.reportData.report_date).toLocaleDateString()}</p></div>
                  </div>

                  <h3 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b border-gray-200">PTE Module Rating</h3>
                  
                  <div className="overflow-x-auto mb-8">
                    <table className="w-full text-left border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 border border-gray-300 font-bold text-gray-700">Module</th>
                          <th className="p-3 border border-gray-300 font-bold text-gray-700">Rating</th>
                          <th className="p-3 border border-gray-300 font-bold text-gray-700">Score</th>
                          <th className="p-3 border border-gray-300 font-bold text-gray-700">Strengths</th>
                          <th className="p-3 border border-gray-300 font-bold text-gray-700">Areas for Improvement</th>
                          <th className="p-3 border border-gray-300 font-bold text-gray-700">Action Plan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['speaking', 'writing', 'reading', 'listening'].map(mod => (
                          <tr key={mod}>
                            <td className="p-3 border border-gray-300 font-bold text-gray-900 capitalize">{mod}</td>
                            <td className="p-3 border border-gray-300 text-center font-semibold">{reportModal.reportData[`${mod}_rating`]}/5</td>
                            <td className="p-3 border border-gray-300 text-center font-bold text-blue-700">{reportModal.reportData[`${mod}_score`] || '-'}</td>
                            <td className="p-3 border border-gray-300 whitespace-pre-wrap text-sm">{reportModal.reportData[`${mod}_strengths`] || '-'}</td>
                            <td className="p-3 border border-gray-300 whitespace-pre-wrap text-sm">{reportModal.reportData[`${mod}_improvements`] || '-'}</td>
                            <td className="p-3 border border-gray-300 whitespace-pre-wrap text-sm">{reportModal.reportData[`${mod}_action_plan`] || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg mb-8 inline-block shadow-sm">
                    <p className="text-sm font-bold text-gray-600 uppercase mb-1">Overall Score</p>
                    <p className="text-4xl font-black text-red-700">{reportModal.reportData.overall_score || '-'}</p>
                  </div>

                  <div className="mb-8 p-5 border border-gray-300 border-l-4 border-l-blue-800 bg-white rounded shadow-sm">
                    <h4 className="font-bold text-blue-900 mb-3 text-lg">Overall Suggestions / Trainer Feedback</h4>
                    <p className="text-gray-800 whitespace-pre-wrap">{reportModal.reportData.overall_feedback || 'No additional feedback provided.'}</p>
                  </div>

                  <div className="flex justify-between items-end pt-8 mt-12 border-t-2 border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Report Submitted By</p>
                      <p className="font-bold text-gray-900 text-lg">{reportModal.reportData.trainer_name}</p>
                    </div>
                    <div className="text-right text-sm text-gray-400 font-medium">
                      YES Academy &copy; {new Date().getFullYear()} <br/> PTE Academic Preparation Program
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-between items-center">
                  <div className="text-sm font-medium">
                    <span className="text-gray-500 mr-2">Email Status:</span>
                    {reportModal.reportData.email_status === 'Sent' ? (
                      <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Delivered</span>
                    ) : reportModal.reportData.email_status === 'Failed' ? (
                      <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">Failed</span>
                    ) : (
                      <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">{reportModal.reportData.email_status}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleResendReportEmail(reportModal.reportData.id)}
                    disabled={isResending}
                    className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" /> {isResending ? 'Sending...' : 'Resend Email'}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-red-500 font-bold">Failed to load report.</div>
            )}
            
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}





