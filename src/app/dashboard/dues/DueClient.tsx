'use client'

import { useState } from 'react'
import { Printer, AlertCircle, X, Receipt } from 'lucide-react'
import { updateDuePayment, fetchPaymentHistory } from './actions'
import Link from 'next/link'

export default function DueClient({ initialData }: { initialData: any[] }) {
  const [data] = useState(initialData)
  
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [payAmount, setPayAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Payment History state
  const [showDetailsFor, setShowDetailsFor] = useState<any>(null)
  const [paymentHistoryData, setPaymentHistoryData] = useState<any[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const loadDetails = async (record: any) => {
    setShowDetailsFor(record)
    setIsLoadingDetails(true)
    const res = await fetchPaymentHistory(record.id)
    if (res.success) {
      setPaymentHistoryData(res.data)
    } else {
      setPaymentHistoryData([])
    }
    setIsLoadingDetails(false)
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('id', selectedRecord.id)
    formData.append('type', selectedRecord.type)
    formData.append('pay_amount', payAmount)
    formData.append('payment_method', paymentMethod)
    
    const res = await updateDuePayment(formData)
    
    if (res.success) {
      window.location.reload()
    } else {
      setError(res.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center print:hidden">
        <h3 className="font-semibold text-gray-900">Total Pending Dues: <span className="text-red-600">৳{data.reduce((s, e) => s + e.due_amount, 0).toLocaleString()}</span></h3>
        <button onClick={() => window.open('/invoice/dues', '_blank')} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
          <Printer className="w-4 h-4" /> Print Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold print:bg-white print:text-black print:border-black">
                <th className="p-4 print:p-2 border-r print:border-black">Date</th>
                <th className="p-4 print:p-2 border-r print:border-black">Student Details</th>
                <th className="p-4 print:p-2 border-r print:border-black">Item</th>
                <th className="p-4 print:p-2 border-r print:border-black text-center">Due Alarm</th>
                <th className="p-4 print:p-2 border-r print:border-black text-right">Fee</th>
                <th className="p-4 print:p-2 border-r print:border-black text-right">Paid</th>
                <th className="p-4 print:p-2 border-r print:border-black text-right">Due Amount</th>
                <th className="p-4 print:hidden text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 print:divide-black">
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 print:text-black">No pending dues across all services. Great job!</td>
                </tr>
              )}
              {data.map((item, idx) => {
                let alarmClass = "bg-gray-100 text-gray-600"
                let alarmText = "No Installment"

                if (item.next_installment_date) {
                  const due = new Date(item.next_installment_date)
                  const now = new Date()
                  const diffTime = due.getTime() - now.getTime()
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  
                  if (diffDays < 0) {
                    alarmClass = "bg-red-100 text-red-700 animate-pulse"
                    alarmText = "Overdue!"
                  } else if (diffDays <= 3) {
                    alarmClass = "bg-orange-100 text-orange-700 animate-pulse"
                    alarmText = `Due in ${diffDays} days`
                  } else {
                    alarmClass = "bg-green-100 text-green-700"
                    alarmText = `Due on ${due.toLocaleDateString()}`
                  }
                }

                return (
                <tr key={`${item.id}-${idx}`} className="hover:bg-gray-50 print:hover:bg-white">
                  <td className="p-4 print:p-2 text-sm text-gray-900 print:text-black border-r print:border-black">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 print:p-2 border-r print:border-black">
                    <p className="text-sm font-medium text-gray-900 print:text-black">{item.student_name}</p>
                    <p className="text-xs text-gray-500 print:text-black">{item.phone}</p>
                  </td>
                  <td className="p-4 print:p-2 border-r print:border-black">
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600 print:bg-transparent print:p-0 block mb-1 w-fit">{item.type}</span>
                    <p className="text-sm text-gray-800 print:text-black">{item.item_name}</p>
                  </td>
                  <td className="p-4 print:p-2 text-center border-r print:border-black">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${alarmClass}`}>
                      {alarmText}
                    </span>
                  </td>
                  <td className="p-4 print:p-2 text-sm text-gray-600 print:text-black border-r print:border-black text-right">
                    ৳{item.total_fee.toLocaleString()}
                  </td>
                  <td className="p-4 print:p-2 text-sm text-green-600 font-medium print:text-black border-r print:border-black text-right">
                    ৳{item.paid_amount.toLocaleString()}
                  </td>
                  <td className="p-4 print:p-2 text-sm font-bold text-red-600 print:text-black border-r print:border-black text-right">
                    ৳{item.due_amount.toLocaleString()}
                  </td>
                  <td className="p-4 print:hidden text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => loadDetails(item)}
                      className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-sm font-medium transition-colors inline-flex items-center gap-1"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedRecord(item)
                        setPayAmount(item.due_amount.toString())
                      }}
                      className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-sm font-medium transition-colors inline-flex items-center gap-1"
                    >
                      Pay Due
                    </button>
                    <Link 
                      href={`/due-invoice?id=${item.id}&type=${item.type}`}
                      target="_blank"
                      className="px-3 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded text-sm font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Receipt className="w-4 h-4"/> Invoice
                    </Link>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-white flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-blue-500" /> Collect Due
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-red-200 rounded-lg text-sm">{error}</div>}

            <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
              <p className="text-sm text-slate-300 mb-1">Student: <span className="font-semibold text-white">{selectedRecord.student_name}</span></p>
              <p className="text-sm text-slate-300 mb-1">Item: <span className="font-semibold text-white">{selectedRecord.item_name}</span></p>
              <p className="text-sm text-red-400 font-bold">Total Due: ৳{selectedRecord.due_amount.toLocaleString()}</p>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Payment Amount (৳)</label>
                <input 
                  type="number" 
                  required 
                  max={selectedRecord.due_amount}
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Bkash">Bkash</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setSelectedRecord(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal (Invoice Design) */}
      {showDetailsFor && (
        <div className="fixed inset-0 bg-[#00000099] flex items-center justify-center p-4 z-[9999] print:hidden">
          <div className="bg-[#ffffff] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[#000000]">
            <div className="p-4 border-b border-[#e5e7eb] flex justify-between items-center bg-[#f9fafb]">
              <h3 className="font-bold text-lg text-[#111827]">Payment Details</h3>
              <div className="flex items-center gap-2">
                <button onClick={async () => {
                  const sumHistory = paymentHistoryData.reduce((s: any, h: any) => s + h.amount_paid, 0)
                  const breakdown: any[] = []
                  if (showDetailsFor.paid_amount > sumHistory) {
                    breakdown.push({ label: `Initial Payment (${showDetailsFor.payment_method || 'Cash'})`, amount: showDetailsFor.paid_amount - sumHistory })
                  }
                  [...paymentHistoryData].reverse().forEach((h: any) => {
                    breakdown.push({ label: `Stage ${breakdown.length + 1} Payment (${h.payment_method})`, amount: h.amount_paid })
                  })

                  const html = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                      <h2 style="color: #2563eb;">YES Academy - Payment Update</h2>
                      <p>Dear <strong>${showDetailsFor.student_name}</strong>,</p>
                      <p>This is a payment update for your <strong>${showDetailsFor.item_name}</strong>.</p>
                      
                      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Payment Summary</h3>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                          <span><strong>Total Fee:</strong></span>
                          <span>৳${showDetailsFor.total_fee}</span>
                        </div>
                        ${breakdown.map(b => `
                          <div style="display: flex; justify-content: space-between; color: #555; font-size: 0.9em; margin-bottom: 5px;">
                            <span>${b.label}</span>
                            <span>৳${b.amount}</span>
                          </div>
                        `).join('')}
                        <div style="display: flex; justify-content: space-between; margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px;">
                          <span><strong>Total Amount Paid:</strong></span>
                          <span>- ৳${showDetailsFor.paid_amount}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px; color: #dc2626; font-size: 1.1em;">
                          <span><strong>Amount Due:</strong></span>
                          <span><strong>৳${showDetailsFor.due_amount}</strong></span>
                        </div>
                      </div>
                      <p>Thank you for choosing YES Academy.</p>
                    </div>
                  `
                  
                  if (!showDetailsFor.email) {
                    alert('No email address found for this record.')
                    return
                  }
                  
                  const btn = document.getElementById('due-email-btn')
                  if (btn) btn.innerText = 'Sending...'
                  const { sendDirectEmail } = await import('@/app/dashboard/email-actions')
                  const res = await sendDirectEmail(showDetailsFor.email, 'YES Academy - Payment Update', html)
                  if (btn) btn.innerText = 'Email'
                  
                  if (res.success) alert('Email sent successfully!')
                  else alert(res.message || 'Failed to send email.')
                }} id="due-email-btn" className="px-3 py-1.5 bg-[#dbeafe] text-[#1d4ed8] hover:bg-[#bfdbfe] rounded text-sm font-semibold transition-colors">
                  Email
                </button>
                <button onClick={() => {
                  const sumHistory = paymentHistoryData.reduce((s: any, h: any) => s + h.amount_paid, 0)
                  const breakdown: any[] = []
                  if (showDetailsFor.paid_amount > sumHistory) {
                    breakdown.push({ label: `Initial Payment (${showDetailsFor.payment_method || 'Cash'})`, amount: showDetailsFor.paid_amount - sumHistory })
                  }
                  [...paymentHistoryData].reverse().forEach((h: any) => {
                    breakdown.push({ label: `Stage ${breakdown.length + 1} Payment (${h.payment_method})`, amount: h.amount_paid })
                  })

                  const text = `Hello ${showDetailsFor.student_name},\n\nThis is a payment update for ${showDetailsFor.item_name}.\nTotal Fee: ৳${showDetailsFor.total_fee}\n\nPayments Breakdown:\n${breakdown.map(b => `${b.label}: ৳${b.amount}`).join('\n')}\n--------------------\nTotal Amount Paid: ৳${showDetailsFor.paid_amount}\n\nAmount Due: ৳${showDetailsFor.due_amount}\n\nThank you!`
                  window.open(`https://wa.me/${showDetailsFor.phone}?text=${encodeURIComponent(text)}`, '_blank')
                }} className="px-3 py-1.5 bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0] rounded text-sm font-semibold transition-colors">
                  WhatsApp
                </button>
                <button onClick={() => setShowDetailsFor(null)} className="p-1 text-[#9ca3af] hover:text-[#111827]"><X className="w-6 h-6"/></button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto font-sans">
              {/* Invoice Header */}
              <div className="text-center mb-8">
                <div className="text-3xl font-black tracking-tight text-[#000000]">YES ACADEMY</div>
                <div className="mt-4 inline-block border border-[#000000] px-4 py-1 font-bold tracking-widest text-sm text-[#000000] uppercase">
                  {showDetailsFor.type} DETAILS
                </div>
              </div>
              
              <hr className="border-t border-[#d1d5db] mb-8" />

              <div className="flex justify-between items-start mb-8 text-sm">
                <div>
                  <p className="mb-1 text-[#4b5563]">Student Info:</p>
                  <p className="font-bold text-lg text-[#000000]">{showDetailsFor.student_name}</p>
                  <p>Phone: {showDetailsFor.phone}</p>
                  {showDetailsFor.email && <p>Email: {showDetailsFor.email}</p>}
                </div>
                <div className="text-right">
                  <p className="mb-1 text-[#4b5563]">Record Details:</p>
                  <p className="font-medium">Date: {new Date(showDetailsFor.date).toLocaleDateString()}</p>
                </div>
              </div>

              <table className="w-full mb-8 border-collapse">
                <thead>
                  <tr className="border-y border-[#000000] text-left text-sm uppercase tracking-wider font-bold">
                    <th className="py-2 px-1 text-[#000000] bg-transparent">Description</th>
                    <th className="py-2 px-1 text-right text-[#000000] bg-transparent">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  <tr>
                    <td className="py-4 px-1 bg-transparent">
                      <p className="font-bold text-base text-[#000000]">{showDetailsFor.item_name}</p>
                    </td>
                    <td className="py-4 px-1 text-right font-medium text-[#000000] bg-transparent">
                      ৳{showDetailsFor.total_fee.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-start mb-8">
                <div className="flex-1 mr-8">
                  <h4 className="font-bold text-sm uppercase border-b border-[#000000] pb-1 mb-2 text-[#000000] bg-transparent">Payment History</h4>
                  {isLoadingDetails ? (
                    <div className="text-[#6b7280] text-sm">Loading history...</div>
                  ) : paymentHistoryData.length > 0 ? (
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-[#6b7280]">
                          <th className="py-1 bg-transparent text-[#6b7280]">Date</th>
                          <th className="py-1 bg-transparent text-[#6b7280]">Method</th>
                          <th className="py-1 text-right bg-transparent text-[#6b7280]">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f3f4f6]">
                        {paymentHistoryData.map(h => (
                          <tr key={h.id}>
                            <td className="py-1 bg-transparent text-[#000000]">{new Date(h.payment_date).toLocaleDateString()}</td>
                            <td className="py-1 bg-transparent text-[#000000]">{h.payment_method}</td>
                            <td className="py-1 text-right text-[#16a34a] font-medium bg-transparent">৳{h.amount_paid.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-[#6b7280] text-sm">No payment history found.</div>
                  )}
                </div>
                
                <div className="w-64 space-y-2 text-sm flex-shrink-0 text-[#000000]">
                  <div className="flex justify-between font-bold border-b border-[#000000] pb-2 mb-2">
                    <span>Total Fee</span>
                    <span>৳{showDetailsFor.total_fee.toLocaleString()}</span>
                  </div>
                  
                  {(() => {
                    const sumHistory = paymentHistoryData.reduce((s: any, h: any) => s + h.amount_paid, 0)
                    const breakdown = []
                    if (showDetailsFor.paid_amount > sumHistory) {
                      breakdown.push({ label: `Initial Payment (${showDetailsFor.payment_method || 'Cash'})`, amount: showDetailsFor.paid_amount - sumHistory })
                    }
                    [...paymentHistoryData].reverse().forEach((h: any) => {
                      breakdown.push({ label: `Stage ${breakdown.length + 1} Payment (${h.payment_method})`, amount: h.amount_paid })
                    })
                    
                    return (
                      <>
                        {breakdown.map((b, i) => (
                          <div key={i} className="flex justify-between text-[#4b5563]">
                            <span>{b.label}</span>
                            <span>৳{b.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </>
                    )
                  })()}

                  <div className="flex justify-between font-bold border-t border-[#000000] pt-2 mt-2">
                    <span>Total Amount Paid</span>
                    <span>- ৳{showDetailsFor.paid_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#000000] pt-2 mt-2 font-bold text-lg">
                    <span>Amount Due</span>
                    <span className="text-[#dc2626]">৳{showDetailsFor.due_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
