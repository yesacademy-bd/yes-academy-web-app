'use client'

import { useState, useEffect } from 'react'
import { getTeacherReportsByDate, submitTeacherReport } from '@/app/actions/reports'
import { Calendar, CheckCircle, Clock } from 'lucide-react'

export default function TeacherReportClient({ batches, teacherId }: { batches: any[], teacherId: string }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    last_class_summary: '',
    todays_lessons: '',
    class_tests: '',
    homework: ''
  })

  useEffect(() => {
    loadReports(selectedDate)
  }, [selectedDate])

  const loadReports = async (date: string) => {
    setLoading(true)
    const res = await getTeacherReportsByDate(date)
    if (res.success) {
      setReports(res.data)
    }
    setLoading(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    const today = new Date().toISOString().split('T')[0]
    if (newDate > today) {
      alert('Cannot select a future date.')
      return
    }
    setSelectedDate(newDate)
    setExpandedBatchId(null)
  }

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const selectedDayName = DAYS[new Date(selectedDate).getDay()]

  const todaysBatches = batches.filter(b => b.schedule_days && b.schedule_days.includes(selectedDayName))

  const handleExpand = (batchId: string) => {
    const existing = reports.find(r => r.batch_id === batchId)
    if (existing) {
      setFormData({
        last_class_summary: existing.last_class_summary,
        todays_lessons: existing.todays_lessons,
        class_tests: existing.class_tests,
        homework: existing.homework
      })
    } else {
      setFormData({
        last_class_summary: '',
        todays_lessons: '',
        class_tests: '',
        homework: ''
      })
    }
    setExpandedBatchId(expandedBatchId === batchId ? null : batchId)
  }

  const handleSubmit = async (batchId: string, e: React.FormEvent) => {
    e.preventDefault()
    const res = await submitTeacherReport({
      batch_id: batchId,
      report_date: selectedDate,
      ...formData
    })
    if (res.success) {
      alert('Report submitted for BDM approval.')
      setExpandedBatchId(null)
      loadReports(selectedDate)
    } else {
      alert('Error submitting report.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <label className="font-medium text-gray-700 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          Select Date:
        </label>
        <input 
          type="date" 
          value={selectedDate}
          max={new Date().toISOString().split('T')[0]}
          onChange={handleDateChange}
          className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="text-gray-500 font-medium">({selectedDayName})</span>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading batches...</div>
      ) : todaysBatches.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-500 rounded-xl border border-gray-200">
          No active batches scheduled for {selectedDayName}.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {todaysBatches.map(batch => {
            const report = reports.find(r => r.batch_id === batch.id)
            const isCompleted = report?.status === 'Completed'
            const isAwaiting = report?.status === 'Awaiting Approval'
            
            return (
              <div key={batch.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleExpand(batch.id)}
                >
                  <div>
                    <h3 className="font-bold text-gray-900">{batch.batch_name}</h3>
                    <p className="text-sm text-gray-500">{batch.courses?.name} • {batch.start_time} - {batch.end_time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isCompleted && <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full"><CheckCircle className="w-4 h-4" /> Completed</span>}
                    {isAwaiting && <span className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full"><Clock className="w-4 h-4" /> Awaiting Approval</span>}
                    {!report && <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Pending Submission</span>}
                  </div>
                </div>

                {expandedBatchId === batch.id && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <form onSubmit={(e) => handleSubmit(batch.id, e)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Class Summary</label>
                          <textarea required disabled={isCompleted} value={formData.last_class_summary} onChange={e => setFormData({...formData, last_class_summary: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Today's Given Lessons</label>
                          <textarea required disabled={isCompleted} value={formData.todays_lessons} onChange={e => setFormData({...formData, todays_lessons: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Taken Class Tests</label>
                          <textarea required disabled={isCompleted} value={formData.class_tests} onChange={e => setFormData({...formData, class_tests: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Given Homework</label>
                          <textarea required disabled={isCompleted} value={formData.homework} onChange={e => setFormData({...formData, homework: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"></textarea>
                        </div>
                      </div>
                      
                      {report?.bdm_feedback && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <h4 className="font-semibold text-blue-900 text-sm mb-1">BDM Feedback</h4>
                          <p className="text-blue-800 text-sm whitespace-pre-wrap">{report.bdm_feedback}</p>
                        </div>
                      )}

                      {!isCompleted && (
                        <div className="flex justify-end pt-2">
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                            Send For BDM approval
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
