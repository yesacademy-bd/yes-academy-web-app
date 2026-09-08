import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DecisionForm from './DecisionForm'
import { ArrowLeft, Printer } from 'lucide-react'

export default async function LeaveRequestDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role || 'Faculty'

  const { data: req } = await supabase.from('leave_requests').select('*').eq('id', params.id).single()
  
  if (!req) return <div>Leave request not found</div>

  const isManagement = ['Admin', 'BDM', 'HR'].includes(role)
  
  if (!isManagement && req.user_id !== user.id) {
    redirect('/dashboard/leave-requests')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/leave-requests" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Request Details</h1>
            <p className="text-gray-500 text-sm mt-1">ID: {req.id.split('-')[0].toUpperCase()}</p>
          </div>
        </div>
        {req.status !== 'Pending' && (
          <Link href={`/dashboard/leave-requests/${req.id}/print`} target="_blank" className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm">
            <Printer className="w-4 h-4" /> Print Form
          </Link>
        )}
      </div>

      {/* Employee details */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Employee details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="flex border-b border-gray-200">
            <div className="w-1/3 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Employee name</div>
            <div className="w-2/3 px-4 py-3 text-sm text-gray-900">{req.employee_name}</div>
          </div>
          <div className="flex border-b border-gray-200">
            <div className="w-1/3 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Department</div>
            <div className="w-2/3 px-4 py-3 text-sm text-gray-900">{req.department}</div>
          </div>
          <div className="flex border-b md:border-b-0 border-gray-200">
            <div className="w-1/3 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Job title</div>
            <div className="w-2/3 px-4 py-3 text-sm text-gray-900">{req.job_title}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Staff ID</div>
            <div className="w-2/3 px-4 py-3 text-sm text-gray-900">{req.staff_id}</div>
          </div>
        </div>
      </div>

      {/* Leave request details */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Leave request details</h2>
        </div>
        <div className="flex flex-col divide-y divide-gray-200">
          <div className="flex">
            <div className="w-1/4 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-900 border-r border-gray-200 flex items-center">Leave request</div>
            <div className="w-3/4 px-4 py-4 flex flex-wrap items-center gap-8">
              <span className={`text-sm font-medium ${req.leave_type === 'Days' ? 'text-blue-700 font-bold' : 'text-gray-500'}`}>☑ Days</span>
              <span className={`text-sm font-medium ${req.leave_type === 'Half Day' ? 'text-blue-700 font-bold' : 'text-gray-500'}`}>☑ Half Day</span>
              <span className={`text-sm font-medium ${req.leave_type === 'Hours' ? 'text-blue-700 font-bold' : 'text-gray-500'}`}>☑ Hours</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="flex md:w-1/2">
              <div className="w-1/2 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Starting Date</div>
              <div className="w-1/2 px-4 py-3 text-sm text-gray-900">{new Date(req.starting_on).toLocaleDateString()}</div>
            </div>
            {req.leave_type === 'Days' && (
              <div className="flex md:w-1/2">
                <div className="w-1/2 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Ending Date</div>
                <div className="w-1/2 px-4 py-3 text-sm text-gray-900">{new Date(req.ending_on).toLocaleDateString()}</div>
              </div>
            )}
            {(req.leave_type === 'Half Day' || req.leave_type === 'Hours') && (
              <>
                <div className="flex md:w-1/4">
                  <div className="w-1/2 md:w-full bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">{req.leave_type === 'Hours' ? 'Start Hour' : 'Start Time'}</div>
                  <div className="w-1/2 md:w-full px-4 py-3 text-sm text-gray-900">{req.start_time?.slice(0, 5) || 'N/A'}</div>
                </div>
                <div className="flex md:w-1/4">
                  <div className="w-1/2 md:w-full bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">{req.leave_type === 'Hours' ? 'End Hour' : 'End Time'}</div>
                  <div className="w-1/2 md:w-full px-4 py-3 text-sm text-gray-900">{req.end_time?.slice(0, 5) || 'N/A'}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Reason for leave request</h2>
        </div>
        <div className="p-6">
          <div className="text-sm font-bold text-gray-900 bg-blue-50 px-4 py-2 rounded-lg inline-block border border-blue-100">
            {req.reason === 'Other' ? `Other: ${req.other_reason}` : req.reason}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-white">Short explanation</h2>
        </div>
        <div className="p-4 bg-gray-50/50">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.explanation || 'No explanation provided.'}</p>
        </div>
      </div>

      {/* Declaration */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200 text-white">
          <p className="text-sm font-bold">Employee Declaration</p>
        </div>
        <div className="flex flex-col divide-y divide-gray-200">
          <div className="flex">
            <div className="w-1/3 md:w-1/4 bg-[#dbeafe] px-4 py-4 text-sm font-bold text-blue-900 border-r border-gray-200">Employee signature</div>
            <div className="w-2/3 md:w-3/4 px-4 py-4 font-serif italic text-gray-700">{req.employee_signature}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 md:w-1/4 bg-[#dbeafe] px-4 py-4 text-sm font-bold text-blue-900 border-r border-gray-200">Date</div>
            <div className="w-2/3 md:w-3/4 px-4 py-4 text-sm text-gray-900">{new Date(req.employee_signature_date).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Management Decision Section */}
      {isManagement && req.status === 'Pending' ? (
        <DecisionForm req={req} />
      ) : (
        req.status !== 'Pending' && (
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden mt-8 border-t-4 border-t-blue-600">
            <div className="bg-[#1e3a8a] px-6 py-3 border-b border-gray-200">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Management decision</h2>
            </div>
            <div className="p-0 flex flex-col divide-y divide-gray-200">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="w-full md:w-1/2 p-4 flex gap-6 items-center">
                  <span className={`text-sm font-bold ${req.status === 'Approved' ? 'text-green-600' : 'text-gray-400'}`}>☑ Approved</span>
                  <span className={`text-sm font-bold ${req.status === 'Rejected' ? 'text-red-600' : 'text-gray-400'}`}>☑ Rejected</span>
                </div>
                <div className="w-full md:w-1/2 p-4 flex gap-6 items-center bg-gray-50/50">
                  <span className={`text-sm font-bold ${req.payment_status === 'Paid' ? 'text-blue-600' : 'text-gray-400'}`}>☑ Paid</span>
                  <span className={`text-sm font-bold ${req.payment_status === 'Unpaid' ? 'text-gray-600' : 'text-gray-400'}`}>☑ Unpaid</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="w-full md:w-1/2 flex">
                  <div className="w-1/2 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-900 border-r border-gray-200">Manager signature</div>
                  <div className="w-1/2 px-4 py-4 font-serif italic text-gray-700">{req.manager_signature}</div>
                </div>
                <div className="w-full md:w-1/2 flex">
                  <div className="w-1/2 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-900 border-r border-gray-200">Signature of Head of Business</div>
                  <div className="w-1/2 px-4 py-4 font-serif italic text-gray-700">{req.hob_signature}</div>
                </div>
              </div>
              <div className="flex">
                <div className="w-1/4 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-200">Date</div>
                <div className="w-3/4 px-4 py-3 text-sm text-gray-900">{req.decision_date ? new Date(req.decision_date).toLocaleDateString() : ''}</div>
              </div>
            </div>
            
            <div className="bg-[#1e3a8a] px-6 py-3 border-y border-gray-200">
              <h2 className="text-sm font-bold text-white">Notes and comments of the Manager/Head of Business</h2>
            </div>
            <div className="p-4 bg-gray-50/50">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.manager_notes || 'No notes provided.'}</p>
            </div>
          </div>
        )
      )}
    </div>
  )
}
