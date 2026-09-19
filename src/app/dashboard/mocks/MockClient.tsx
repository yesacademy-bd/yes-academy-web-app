'use client'

import { useState, useMemo } from 'react'
import { FileText, Calendar, Trash2, Mail } from 'lucide-react'
import { createMockService, deleteMockService, sendConfirmationEmail } from './actions'

const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('01') && cleaned.length === 11) return `88${cleaned}`
  return cleaned
}

export default function MockClient({ initialMocks }: { initialMocks: any[] }) {
  const [mocks] = useState(initialMocks)
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
  const [mockStatus, setMockStatus] = useState('Paid')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailingId, setEmailingId] = useState<string | null>(null)

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
                <select name="student_type" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
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
              <select name="mock_type" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="IELTS Mock">IELTS Mock</option>
                <option value="PTE Mock">PTE Mock</option>
                
              </select>
            </div>

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
            <div><span className="text-gray-500">Total Remaining:</span> <span className="font-bold text-gray-900">{slotSummary.totalRemaining}</span></div>
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
                      <td className="p-4 text-sm text-center font-bold text-indigo-600">{remaining}</td>
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

        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mocks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No mock services recorded.</td>
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
                          {m.exam_time && <span>🕒 {m.exam_time}</span>}
                          {m.exam_time && m.exam_venue && <span className="mx-1">|</span>}
                          {m.exam_venue && <span>📍 {m.exam_venue}</span>}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-sm text-right">
                      <p>Fee: ৳{m.course_fee}</p>
                      <p className="text-red-600 font-medium">Due: ৳{m.due_amount}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap justify-center items-center gap-2">
                        <button
                          onClick={() => handleSendEmail(m)}
                          disabled={!m.email || emailingId === m.id}
                          className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${!m.email ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-sky-500 hover:bg-blue-200 disabled:opacity-50'}`}
                          title={m.email ? "Send Confirmation Email" : "No email address provided"}
                        >
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </button>
                        <a
                          href={`https://wa.me/${formatPhone(m.phone)}?text=${encodeURIComponent(`Hello ${m.student_name}, this is a confirmation for your ${m.service_type || m.mock_type}. Your exam is scheduled on ${new Date(m.exam_date).toLocaleDateString()}${m.exam_time ? ` at ${m.exam_time}` : ''}${m.exam_venue ? ` at ${m.exam_venue}` : ''}. Fee: ৳${m.course_fee}, Paid: ৳${m.paid_amount || 0}, Due: ৳${m.due_amount}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          title="Send WhatsApp Confirmation"
                        >
                          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.183-.573c.978.582 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.765-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"/></svg>
                        </a>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="inline-flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Mock Service"
                        >
                          <Trash2 className="w-5 h-5 shrink-0" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
