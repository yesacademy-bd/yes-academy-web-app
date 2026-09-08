'use client'

import { useState, useEffect } from 'react'
import { Calendar, Filter, Eye, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function LeaveRequestManagementClient({ employees }: { employees: any[] }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadRequests()
  }, [selectedMonth, selectedEmployee])

  const loadRequests = async () => {
    setLoading(true)
    let query = supabase.from('leave_requests').select('*').order('created_at', { ascending: false })
    
    if (selectedEmployee) {
      query = query.eq('user_id', selectedEmployee)
    }

    const { data } = await query
    
    if (data) {
      // For the bottom list, we can show all for the month or all. Let's just show all that overlap the month
      const filtered = data.filter((req: any) => req.starting_on?.startsWith(selectedMonth))
      setRequests(filtered)
    } else {
      setRequests([])
    }
    setLoading(false)
  }

  // Calculate monthly stats for management
  const statsMap = new Map()
  requests.forEach((req: any) => {
    if (req.status !== 'Approved') return 
    
    const empName = req.employee_name
    if (!statsMap.has(empName)) {
      statsMap.set(empName, { name: empName, dept: req.department, fullDays: 0, halfDays: 0, hours: 0 })
    }
    
    const stat = statsMap.get(empName)
    if (req.leave_type === 'Days') {
      const start = new Date(req.starting_on)
      const end = new Date(req.ending_on)
      const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      stat.fullDays += days
    } else if (req.leave_type === 'Half Day') {
      stat.halfDays += 1
    } else if (req.leave_type === 'Hours') {
      if (req.start_time && req.end_time) {
        const [sh, sm] = req.start_time.split(':').map(Number)
        const [eh, em] = req.end_time.split(':').map(Number)
        let diffHours = eh - sh + (em - sm) / 60
        if (diffHours < 0) diffHours += 24
        stat.hours += diffHours
      }
    }
  })
  const monthlyStats = Array.from(statsMap.values())

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
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
          />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={selectedEmployee} 
            onChange={(e) => setSelectedEmployee(e.target.value)} 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
          >
            <option value="">All Employees</option>
            {employees.filter(e => e.role === 'Faculty').length > 0 && (
              <optgroup label="Faculty">
                {employees.filter(e => e.role === 'Faculty').map(e => (
                  <option key={e.id} value={e.id}>{e.display_name}</option>
                ))}
              </optgroup>
            )}
            {employees.filter(e => e.role === 'Admin').length > 0 && (
              <optgroup label="Admin">
                {employees.filter(e => e.role === 'Admin').map(e => (
                  <option key={e.id} value={e.id}>{e.display_name}</option>
                ))}
              </optgroup>
            )}
            {employees.filter(e => e.role !== 'Faculty' && e.role !== 'Admin' && e.role !== 'HR' && e.role !== 'BDM').length > 0 && (
              <optgroup label="Other">
                {employees.filter(e => e.role !== 'Faculty' && e.role !== 'Admin' && e.role !== 'HR' && e.role !== 'BDM').map(e => (
                  <option key={e.id} value={e.id}>{e.display_name} ({e.role})</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            Monthly Leave Report Summary
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Full Days</th>
                <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Half Days</th>
                <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {monthlyStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    No approved leaves found for this selection.
                  </td>
                </tr>
              ) : (
                monthlyStats.map((stat, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm font-medium text-gray-900">{stat.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">{stat.dept}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-center font-semibold text-gray-700">{stat.fullDays}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-center font-semibold text-gray-700">{stat.halfDays}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-center font-semibold text-gray-700">{stat.hours.toFixed(1)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Requests */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            Individual Leave Requests ({selectedMonth})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading requests...</div>
          ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Info</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                      <div className="font-medium text-gray-900">{request.employee_name}</div>
                      <div className="text-gray-500">{request.department}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
          )}
        </div>
      </div>
    </div>
  )
}



