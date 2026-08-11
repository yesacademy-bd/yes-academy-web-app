'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Users, Clock, Search } from 'lucide-react'

export default function FacultyBatchList({ batches, isHR }: { batches: any[], isHR: boolean }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')

  // Unique teachers for filter dropdown
  const teachers = Array.from(new Set(batches.map(b => b.profiles?.display_name).filter(Boolean))).sort()

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTeacher = teacherFilter ? batch.profiles?.display_name === teacherFilter : true
    return matchesSearch && matchesTeacher
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Classes & Attendance</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search batches..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {isHR && (
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Teachers</option>
              {teachers.map((t: any) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch: any) => (
          <Link href={`/dashboard/faculty/batches/${batch.id}`} key={batch.id}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{batch.batch_name}</h3>
                  <p className="text-sm text-gray-500">{batch.courses?.name}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                  ${batch.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {batch.status}
                </span>
              </div>
              
              <div className="mt-auto space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {batch.schedule_days.join(', ')} <br/> {batch.start_time.substring(0,5)} - {batch.end_time.substring(0,5)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  Room: {batch.rooms?.name}
                  {isHR && batch.profiles?.display_name && ` • Teacher: ${batch.profiles?.display_name}`}
                </div>
              </div>
            </div>
          </Link>
        ))}
        
        {filteredBatches.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-gray-200 border-dashed">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No batches found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
