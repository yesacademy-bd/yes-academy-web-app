'use client'

import { useState } from 'react'
import { addHoliday, deleteHoliday } from '@/app/actions/holidays'
import { Calendar, Trash2, Plus, Loader2 } from 'lucide-react'

export default function HolidaysClient({ initialHolidays }: { initialHolidays: any[] }) {
  const [holidays, setHolidays] = useState(initialHolidays)
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !reason) return

    setIsSubmitting(true)
    setError(null)

    const res = await addHoliday(date, reason)
    if (res.success) {
      // Optimistic update
      setHolidays([...holidays, { id: 'temp-' + Date.now(), holiday_date: date, reason }].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date)))
      setDate('')
      setReason('')
    } else {
      setError(res.message || 'Failed to add holiday')
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this holiday?')) return
    
    // Optimistic delete
    const prev = [...holidays]
    setHolidays(holidays.filter(h => h.id !== id))
    
    const res = await deleteHoliday(id)
    if (!res.success) {
      alert(res.message || 'Failed to delete holiday')
      setHolidays(prev) // Revert
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Form Card */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Holiday</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Event Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Eid ul-Fitr"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !date || !reason}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Declare Holiday
            </button>
          </form>
        </div>
      </div>

      {/* List Card */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" /> Declared Holidays
            </h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              {holidays.length} Total
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {holidays.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No holidays declared yet.
              </div>
            ) : (
              holidays.map(h => (
                <div key={h.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{h.reason}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(h.holiday_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(h.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Holiday"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
