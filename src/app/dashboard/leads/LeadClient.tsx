'use client'

import { useState } from 'react'
import { Phone, Calendar, Trash2 } from 'lucide-react'
import { createLead, deleteLead } from './actions'

export default function LeadClient({ initialLeads, courses }: { initialLeads: any[], courses: any[] }) {
  const [leads] = useState(initialLeads)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await createLead(formData)
    
    if (res.success) {
      window.location.reload()
    } else {
      setError(res.message || 'Failed to add lead')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return
    const res = await deleteLead(id)
    if (res.success) {
      window.location.reload()
    } else {
      alert(res.message || 'Failed to delete lead')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" /> New Lead Call
          </h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input type="text" name="student_name" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
              <select name="lead_source" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Select Source...</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Messenger">Messenger</option>
                <option value="Instagram">Instagram</option>
                <option value="Direct Call">Direct Call</option>
                <option value="Physical Marketing">Physical Marketing</option>
                <option value="Student Ref">Student Reference</option>
                <option value="Staff Ref">Staff Reference</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interested Service</label>
              <select name="interested_course" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Select Service...</option>
                <optgroup label="Courses">
                  {courses.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Mock Tests">
                  <option value="Mock Test - IELTS">Mock Test - IELTS</option>
                  <option value="Mock Test - PTE">Mock Test - PTE</option>
                </optgroup>
                <optgroup label="Exam Registration">
                  <option value="Exam Registration - IELTS">Exam Registration - IELTS</option>
                  <option value="Exam Registration - PTE">Exam Registration - PTE</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Call Person</label>
              <input type="text" name="lead_call_person" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea name="summary" rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Add Lead Record'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" /> Call History
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Source & Service</th>
                  <th className="p-4">Staff & Remarks</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No leads recorded.</td>
                  </tr>
                )}
                {leads.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-500">{new Date(l.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{l.student_name}</p>
                      <p className="text-sm text-gray-500">{l.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600 block mb-1 w-fit">{l.lead_source || 'Unknown'}</span>
                      <p className="text-sm text-gray-600">{l.interested_course || '-'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-700">{l.lead_call_person || '-'}</p>
                      <p className="text-xs text-gray-500 max-w-[200px] truncate">{l.summary || '-'}</p>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="inline-flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
