'use client'

import { useState, useEffect } from 'react'
import { getReportsForBDM, submitBDMFeedback } from '@/app/actions/reports'
import { Calendar, Filter, CheckCircle, Clock } from 'lucide-react'

export default function BDMReportClient({ teachers }: { teachers: any[] }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})

  useEffect(() => {
    loadReports()
  }, [selectedDate, selectedTeacher])

  const loadReports = async () => {
    setLoading(true)
    const res = await getReportsForBDM(selectedDate, selectedTeacher || null)
    if (res.success) {
      setReports(res.data)
      const initialFeedbacks: Record<string, string> = {}
      res.data.forEach((r: any) => {
        initialFeedbacks[r.id] = r.bdm_feedback || ''
      })
      setFeedbacks(initialFeedbacks)
    }
    setLoading(false)
  }

  const handleFeedbackSubmit = async (reportId: string) => {
    const res = await submitBDMFeedback(reportId, feedbacks[reportId] || '')
    if (res.success) {
      alert('Feedback submitted and report completed.')
      loadReports()
    } else {
      alert('Failed to submit feedback.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={selectedTeacher}
            onChange={e => setSelectedTeacher(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Teachers</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.display_name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-500 rounded-xl border border-gray-200">
          No reports submitted for this date/filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map(report => {
            const isCompleted = report.status === 'Completed'
            return (
              <div key={report.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{report.batches?.batch_name}</h3>
                    <p className="text-sm text-gray-600 font-medium">Teacher: {report.profiles?.display_name}</p>
                    <p className="text-xs text-gray-500">{report.batches?.courses?.name} • {report.batches?.start_time} - {report.batches?.end_time}</p>
                  </div>
                  <div>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full"><CheckCircle className="w-4 h-4" /> Completed</span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full"><Clock className="w-4 h-4" /> Awaiting Approval</span>
                    )}
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Class Summary</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{report.last_class_summary}</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Today's Given Lessons</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{report.todays_lessons}</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Taken Class Tests</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{report.class_tests}</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Given Homework</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{report.homework}</div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-blue-50/50">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">BDM Feedback</h4>
                  {isCompleted ? (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                      {report.bdm_feedback || 'No feedback provided.'}
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <textarea 
                        value={feedbacks[report.id] || ''}
                        onChange={e => setFeedbacks({...feedbacks, [report.id]: e.target.value})}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[80px] text-sm"
                        placeholder="Type feedback here..."
                      ></textarea>
                      <button 
                        onClick={() => handleFeedbackSubmit(report.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium h-fit"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
