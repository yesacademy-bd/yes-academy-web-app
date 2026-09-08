'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitLeaveRequest } from '../actions'

export default function LeaveRequestClientForm({ profile }: { profile: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await submitLeaveRequest(formData)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push('/dashboard/leave-requests')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      
      {/* Employee details */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Employee details</h2>
        </div>
        <div className="p-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="flex border-b border-gray-200">
            <div className="w-1/3 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Employee name</div>
            <div className="w-2/3 px-4 py-3"><input name="employee_name" type="text" readOnly defaultValue={profile?.display_name || ''} className="w-full bg-transparent border-0 p-0 text-sm focus:ring-0 text-gray-900" /></div>
          </div>
          <div className="flex border-b border-gray-200">
            <div className="w-1/3 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Department</div>
            <div className="w-2/3 px-4 py-3"><input name="department" type="text" required defaultValue="Faculty" className="w-full bg-transparent border-0 p-0 text-sm focus:ring-0 text-gray-900 outline-none placeholder-gray-400" placeholder="e.g. Academics" /></div>
          </div>
          <div className="flex">
            <div className="w-1/3 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Job title</div>
            <div className="w-2/3 px-4 py-3"><input name="job_title" type="text" required defaultValue={profile?.role || ''} className="w-full bg-transparent border-0 p-0 text-sm focus:ring-0 text-gray-900 outline-none placeholder-gray-400" placeholder="e.g. Instructor" /></div>
          </div>
          <div className="flex">
            <div className="w-1/3 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Staff ID</div>
            <div className="w-2/3 px-4 py-3"><input name="staff_id" type="text" required defaultValue="TBD" className="w-full bg-transparent border-0 p-0 text-sm focus:ring-0 text-gray-900 outline-none placeholder-gray-400" /></div>
          </div>
        </div>
      </div>

      {/* Leave request details */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Leave request details</h2>
        </div>
        <div className="p-0 flex flex-col divide-y divide-gray-200">
          <div className="flex">
            <div className="w-1/4 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-900 border-r border-gray-200 flex items-center">Leave request</div>
            <div className="w-3/4 px-4 py-4 flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="leave_type" value="Days" required className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                <span className="text-sm text-gray-700 font-medium">Days</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="leave_type" value="Hours" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                <span className="text-sm text-gray-700 font-medium">Hours</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="flex md:w-1/2">
              <div className="w-1/2 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Starting on</div>
              <div className="w-1/2 px-4 py-3">
                <input type="date" name="starting_on" required className="w-full text-sm outline-none bg-transparent" />
              </div>
            </div>
            <div className="flex md:w-1/2">
              <div className="w-1/2 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Ending on</div>
              <div className="w-1/2 px-4 py-3">
                <input type="date" name="ending_on" required className="w-full text-sm outline-none bg-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reason for leave request */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Reason for leave request</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4">
          {['Casual', 'Family Reasons', 'Emergency', 'Funeral/Bereavement', 'Medical Leave'].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="reason" value={r} required onChange={(e) => setReason(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-sm text-gray-700 font-medium">{r}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer col-span-1 sm:col-span-2 md:col-span-1">
            <input type="radio" name="reason" value="Other" required onChange={(e) => setReason(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
            <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Other:</span>
            <input 
              type="text" 
              name="other_reason" 
              disabled={reason !== 'Other'}
              required={reason === 'Other'}
              className="ml-2 flex-1 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent text-sm py-1 disabled:opacity-50" 
            />
          </label>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-white">Give short explanation on the selected reasons for leave (Attach Necessary Documents)</h2>
        </div>
        <div className="p-4 bg-gray-50/50">
          <textarea 
            name="explanation" 
            rows={3} 
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            placeholder="Type your explanation here..."
          ></textarea>
          <div className="mt-3">
            <input type="file" name="attachment" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Declaration */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200 text-white">
          <p className="text-sm font-bold">I confirm that the information provided in this leave request form is accurate and complete.</p>
          <p className="text-sm font-bold mt-1">I understand that this request is subject to approval by my employer</p>
        </div>
        <div className="p-0 flex flex-col divide-y divide-gray-200">
          <div className="flex">
            <div className="w-1/3 md:w-1/4 bg-[#dbeafe] px-4 py-4 text-sm font-bold text-blue-900 border-r border-gray-200 flex items-center">Employee signature</div>
            <div className="w-2/3 md:w-3/4 px-4 py-4">
              <input type="text" name="employee_signature" required placeholder="Type your full name as signature" className="w-full text-sm outline-none bg-transparent font-medium" />
            </div>
          </div>
          <div className="flex">
            <div className="w-1/3 md:w-1/4 bg-[#dbeafe] px-4 py-4 text-sm font-bold text-blue-900 border-r border-gray-200 flex items-center">Date</div>
            <div className="w-2/3 md:w-3/4 px-4 py-4">
              <input type="text" readOnly value={new Date().toLocaleDateString('en-US')} className="w-full text-sm outline-none bg-transparent text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-70"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </div>
    </form>
  )
}
