import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Eye, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import LeaveRequestManagementClient from '@/components/reports/LeaveRequestManagementClient'

export default async function LeaveRequestsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, display_name').eq('id', user.id).single()
  const role = profile?.role || 'Faculty'
  const isManagement = ['Admin', 'BDM', 'HR'].includes(role)

  if (isManagement) {
    const { data: employees } = await supabase.from('profiles').select('id, display_name, role').eq('is_suspended', false).order('display_name')
    return (
      <div className="space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Requests Management</h1>
            <p className="text-gray-500 mt-1">Manage and track official leave applications for all staff.</p>
          </div>
          <Link
            href="/dashboard/leave-requests/new"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            <Plus className="-ml-1.5 mr-2 h-5 w-5" />
            New Leave Request
          </Link>
        </div>
        <LeaveRequestManagementClient employees={employees || []} />
      </div>
    )
  }

  // Teacher / Faculty View
  const { data: requests } = await supabase.from('leave_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle className="w-3.5 h-3.5"/> Approved</span>
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3.5 h-3.5"/> Rejected</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"><Clock className="w-3.5 h-3.5"/> Pending</span>
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
          <p className="text-gray-500 mt-1">Manage and track your official leave applications.</p>
        </div>
        <Link
          href="/dashboard/leave-requests/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          <Plus className="-ml-1.5 mr-2 h-5 w-5" />
          New Leave Request
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">All Leave Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Info</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(!requests || requests.length === 0) ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    No leave requests submitted yet.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-gray-500">
                      <div>
                        {new Date(request.starting_on).toLocaleDateString()} 
                        {request.leave_type === 'Days' && ` - ${new Date(request.ending_on).toLocaleDateString()}`}
                      </div>
                      <div className="text-xs text-blue-600 font-medium mt-0.5">
                        {request.leave_type} 
                        {(request.leave_type === 'Half Day' || request.leave_type === 'Hours') && 
                          ` (${request.start_time?.slice(0,5) || ''} - ${request.end_time?.slice(0,5) || ''})`
                        }
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {request.reason}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      <Link href={`/dashboard/leave-requests/${request.id}`} className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

