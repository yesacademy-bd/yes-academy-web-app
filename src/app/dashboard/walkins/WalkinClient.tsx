'use client'

import { useState } from 'react'
import { UserCheck, Calendar, Trash2, Info } from 'lucide-react'
import { createWalkIn, deleteWalkIn } from './actions'

export default function WalkinClient({ initialWalkins, courses }: { initialWalkins: any[], courses: any[] }) {
  const [walkins] = useState(initialWalkins)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWalkin, setSelectedWalkin] = useState<any>(null)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await createWalkIn(formData)
    
    if (res.success) {
      window.location.reload()
    } else {
      setError(res.message || 'Failed to add walk-in')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this walk-in?')) return
    const res = await deleteWalkIn(id)
    if (res.success) {
      window.location.reload()
    } else {
      alert(res.message || 'Failed to delete walk-in')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-600" /> New Walk-in
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
                <option value="Direct Visit">Direct Visit</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Qualification</label>
              <input type="text" name="last_qualification" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Qualification Year</label>
              <input type="text" name="last_qualification_year" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CGPA / GPA</label>
              <input type="text" name="cgpa" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interested Country</label>
              <input type="text" name="interested_country" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interested Intake</label>
              <input type="text" name="interested_intake" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Walk-in Handled By</label>
              <input type="text" name="lead_call_person" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea name="summary" rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Add Walk-in Record'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" /> Walk-in History
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
                {walkins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No walk-ins recorded.</td>
                  </tr>
                )}
                {walkins.map(w => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-500">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{w.student_name}</p>
                      <p className="text-sm text-gray-500">{w.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600 block mb-1 w-fit">{w.lead_source || 'Unknown'}</span>
                      <p className="text-sm text-gray-600">{w.interested_course || '-'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-700">{w.lead_call_person || '-'}</p>
                      <p className="text-xs text-gray-500 max-w-[200px] truncate">{w.summary || '-'}</p>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => setSelectedWalkin(w)}
                        className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="View Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="inline-flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete Walk-in"
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

      {selectedWalkin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Walk-in Details</h3>
            <div className="space-y-3 text-sm">
              <p><strong>Student:</strong> {selectedWalkin.student_name}</p>
              <p><strong>Phone:</strong> {selectedWalkin.phone}</p>
              <p><strong>Interested Course:</strong> {selectedWalkin.interested_course || '-'}</p>
              <p><strong>Last Qualification:</strong> {selectedWalkin.last_qualification || '-'}</p>
              <p><strong>Qualification Year:</strong> {selectedWalkin.last_qualification_year || '-'}</p>
              <p><strong>CGPA:</strong> {selectedWalkin.cgpa || '-'}</p>
              <p><strong>Interested Country:</strong> {selectedWalkin.interested_country || '-'}</p>
              <p><strong>Interested Intake:</strong> {selectedWalkin.interested_intake || '-'}</p>
            </div>
            <button onClick={() => setSelectedWalkin(null)} className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg">Close</button>
          </div>
        </div>
      )}

    </div>
  )
}
