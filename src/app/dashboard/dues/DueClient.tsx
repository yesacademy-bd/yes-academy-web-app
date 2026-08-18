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
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
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
                    {item.type === 'Enrollment' && (
                      <Link 
                        href={`/invoice?id=${item.id}`}
                        target="_blank"
                        className="px-3 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded text-sm font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Receipt className="w-4 h-4"/> Invoice
                      </Link>
                    )}
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

      {/* Details Modal */}
      {showDetailsFor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Payment Details - {showDetailsFor.student_name}</h3>
              <button onClick={() => setShowDetailsFor(null)} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="mb-4 space-y-1 text-sm text-gray-600">
                <p><strong>Item:</strong> {showDetailsFor.item_name}</p>
                <p><strong>Total Fee:</strong> ৳{showDetailsFor.total_fee.toLocaleString()}</p>
                <p><strong>Total Paid:</strong> <span className="text-green-600 font-medium"> ৳{showDetailsFor.paid_amount.toLocaleString()}</span></p>
                <p><strong>Remaining Due:</strong> <span className="text-red-600 font-medium"> ৳{showDetailsFor.due_amount.toLocaleString()}</span></p>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2 border-b pb-1">Payment History</h4>
              
              {isLoadingDetails ? (
                <div className="text-center py-8 text-gray-500">Loading history...</div>
              ) : paymentHistoryData.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Method</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentHistoryData.map(h => (
                      <tr key={h.id}>
                        <td className="px-4 py-2">{new Date(h.payment_date).toLocaleString()}</td>
                        <td className="px-4 py-2">{h.payment_method}</td>
                        <td className="px-4 py-2 text-right font-medium text-green-600"> ৳{h.amount_paid.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">No payment history found.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
