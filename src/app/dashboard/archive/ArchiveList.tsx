'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function ArchiveList({ batches }: { batches: any[] }) {
  const [activeTab, setActiveTab] = useState<string>('PTE')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = ['PTE', 'IELTS', 'Grammar']

  const filteredBatches = batches.filter(batch => {
    let batchTab = ''
    if (batch.courses?.name === 'PTE Booster' || batch.courses?.family === 'Grammar') {
      batchTab = 'Grammar'
    } else if (batch.courses?.family === 'PTE') {
      batchTab = 'PTE'
    } else if (batch.courses?.family === 'IELTS') {
      batchTab = 'IELTS'
    }

    const matchesTab = batchTab === activeTab
    const matchesSearch = batch.batch_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab.replace('_', ' ')} archives...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Batch Name</th>
                <th className="p-4">Course Details</th>
                <th className="p-4">Teacher</th>
                <th className="p-4">Duration</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredBatches.map((batch: any) => (
                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{batch.batch_name}</td>
                  <td className="p-4 text-sm text-gray-600">{batch.courses?.name}</td>
                  <td className="p-4 text-sm text-gray-600">{batch.profiles?.display_name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.expected_end_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/dashboard/archive/${batch.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Full Record
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    No completed batches found for {activeTab.replace('_', ' ')}.
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
