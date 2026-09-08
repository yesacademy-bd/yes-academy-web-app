'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processLeaveDecision } from '../actions'

export default function DecisionForm({ req }: { req: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await processLeaveDecision(req.id, formData)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden mt-8 border-t-4 border-t-blue-600">
      <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Management decision</h2>
      </div>
      
      {error && <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 text-sm">{error}</div>}

      <div className="p-0 flex flex-col divide-y divide-gray-200">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="w-full md:w-1/2 p-4 flex gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="decision" value="Approved" required className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300" />
              <span className="text-sm font-bold text-gray-700">Approved</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="decision" value="Rejected" required className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300" />
              <span className="text-sm font-bold text-gray-700">Rejected</span>
            </label>
          </div>
          <div className="w-full md:w-1/2 p-4 flex gap-6 items-center bg-gray-50/50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="payment_status" value="Paid" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-sm font-bold text-gray-700">Paid</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="payment_status" value="Unpaid" className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-300" />
              <span className="text-sm font-bold text-gray-700">Unpaid</span>
            </label>
          </div>
        </div>
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="w-full md:w-1/2 flex">
            <div className="w-1/2 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-900 border-r border-gray-200">Manager signature</div>
            <div className="w-1/2 px-4 py-4">
              <input type="text" name="manager_signature" required placeholder="Type signature" className="w-full text-sm outline-none bg-transparent font-medium" />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex">
            <div className="w-1/2 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-900 border-r border-gray-200">Signature of Head of Business</div>
            <div className="w-1/2 px-4 py-4">
              <input type="text" name="hob_signature" placeholder="Type signature (if applicable)" className="w-full text-sm outline-none bg-transparent font-medium" />
            </div>
          </div>
        </div>
        <div className="flex border-b border-gray-200">
          <div className="w-1/4 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Date</div>
          <div className="w-3/4 px-4 py-3">
            <input type="text" readOnly value={new Date().toLocaleDateString('en-US')} className="w-full text-sm outline-none bg-transparent text-gray-500" />
          </div>
        </div>
      </div>
      
      <div className="bg-[#1e3a8a] px-6 py-3 border-y border-gray-200">
        <h2 className="text-sm font-bold text-white">Notes and comments of the Manager/Head of Business</h2>
      </div>
      <div className="p-4 bg-gray-50/50">
        <textarea 
          name="manager_notes" 
          rows={3} 
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          placeholder="Type management notes here..."
        ></textarea>
      </div>
      <div className="p-4 bg-gray-50 flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all disabled:opacity-70"
        >
          {isSubmitting ? 'Processing...' : 'Submit Decision'}
        </button>
      </div>
    </form>
  )
}
