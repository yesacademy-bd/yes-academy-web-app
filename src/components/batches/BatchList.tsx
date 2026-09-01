'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Plus, Search } from 'lucide-react'

export default function BatchList({ batches, courses, userRole }: { batches: any[], courses: any[], userRole: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTab = searchParams.get('tab') || 'Active'
  const selectedCourse = searchParams.get('course') || ''
  const [searchQuery, setSearchQuery] = useState('')

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Determine available tabs based on role
  const tabs = ['Active', 'Upcoming']
  if (['HR', 'BDM'].includes(userRole)) {
    tabs.push('Completed')
  }

  // Filter batches by selected tab, search query, and selected course
  let filteredBatches = batches.filter(batch => {
    const matchesTab = batch.status === activeTab
    const matchesSearch = batch.batch_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCourse = selectedCourse ? batch.course_id === selectedCourse : true
    return matchesTab && matchesSearch && matchesCourse
  })

  // Sort batches alphanumerically ascending
  filteredBatches = filteredBatches.sort((a, b) => {
    const nameA = a.batch_name || ''
    const nameB = b.batch_name || ''
    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' })
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Batch Manager</h1>
        {['HR', 'Admin', 'BDM'].includes(userRole) && (
          <Link href="/dashboard/admin/batches/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Create New Batch
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full max-w-md">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => updateParam('tab', tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab} Batches
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by batch name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              value={selectedCourse}
              onChange={(e) => updateParam('course', e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Courses</option>
              {courses?.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Batch Name</th>
                <th className="p-4">Course</th>
                <th className="p-4">Teacher</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredBatches.map((batch: any) => (
                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{batch.batch_name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      {batch.courses?.family}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{batch.courses?.name}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{batch.profiles?.display_name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <div>{new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.expected_end_date).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                      ${batch.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        batch.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 
                        batch.status === 'Completed' ? 'bg-gray-100 text-gray-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/dashboard/faculty/batches/${batch.id}`} className="text-gray-600 hover:text-gray-900 text-sm font-medium mr-4">
                      Attendance
                    </Link>
                    {['HR', 'Admin', 'BDM'].includes(userRole) && (
                      <Link href={`/dashboard/admin/batches/${batch.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Manage
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
