'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Users, DollarSign, PieChart } from 'lucide-react'

export default function CRMClient({ initialData }: { initialData: any[] }) {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  
  const data = useMemo(() => {
    return initialData.filter(e => {
      const d = new Date(e.enrolled_at)
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
    })
  }, [initialData, selectedYear, selectedMonth])

  // Calculate analytics
  const totalEarnings = useMemo(() => data.reduce((sum, e) => sum + e.paid_amount, 0), [data])
  const totalDue = useMemo(() => data.reduce((sum, e) => sum + e.due_amount, 0), [data])
  
  const refStats = useMemo(() => {
    const counts: Record<string, number> = {}
    data.forEach(e => {
      const ref = e.reference || 'None'
      counts[ref] = (counts[ref] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [data])

  const courseTypeStats = useMemo(() => {
    const counts: Record<string, number> = {}
    data.forEach(e => {
      const type = e.course?.family || 'Unknown'
      counts[type] = (counts[type] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [data])

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <div className="space-y-6">
      
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select 
          value={selectedMonth} 
          onChange={e => setSelectedMonth(Number(e.target.value))}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <select 
          value={selectedYear} 
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">৳{totalEarnings}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg text-red-600"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Due</p>
            <p className="text-2xl font-bold text-gray-900">৳{totalDue}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Top Reference</p>
            <p className="text-lg font-bold text-gray-900">{refStats[0]?.[0] || 'N/A'} ({refStats[0]?.[1] || 0})</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><PieChart className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Top Course Type</p>
            <p className="text-lg font-bold text-gray-900">{courseTypeStats[0]?.[0] || 'N/A'} ({courseTypeStats[0]?.[1] || 0})</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">All Enrollments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Admission Date</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course / Batch</th>
                <th className="p-4">Fee</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Due</th>
                <th className="p-4">Reference</th>
                <th className="p-4">Last Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">No enrollment records found.</td>
                </tr>
              )}
              {data.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{e.student?.name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{e.course?.family}</p>
                    <p className="text-xs">{e.batch?.batch_name}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">৳{e.course_fee}</td>
                  <td className="p-4 text-sm font-medium text-green-600">৳{e.paid_amount}</td>
                  <td className="p-4 text-sm font-bold text-red-600">৳{e.due_amount}</td>
                  <td className="p-4 text-sm text-gray-600">{e.reference || '-'}</td>
                  <td className="p-4 text-xs text-gray-400">{e.last_modified_date ? new Date(e.last_modified_date).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
