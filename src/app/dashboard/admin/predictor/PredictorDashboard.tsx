'use client'

import { useState, useTransition } from 'react'
import { generateMonthlyPrediction, confirmPrediction, updatePrediction } from '@/app/actions/predictor'
import { useRouter } from 'next/navigation'
import { Loader2, Calendar, Play, Users, AlertTriangle, X } from 'lucide-react'

export default function PredictorDashboard({ 
  initialPredictions, 
  eligibleTeachers,
  currentMonth,
  currentYear,
  currentCourse,
  activeCount
}: { 
  initialPredictions: any[], 
  eligibleTeachers: any[],
  currentMonth: number,
  currentYear: number,
  currentCourse: string,
  activeCount: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [month, setMonth] = useState(currentMonth)
  const [year, setYeer] = useState(currentYear)
  const [course, setCourse] = useState(currentCourse)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})

  const handleGenerate = () => {
    startTransition(async () => {
      const res = await generateMonthlyPrediction(month, year, course)
      if (res.success) {
        router.push('/dashboard/admin/predictor?month=' + month + 'year=' + year + '&course=' + course)
      } else {
        alert(res.message)
      }
    })
  }

  const handleConfirm = (id: string) => {
    startTransition(async () => {
      const res = await confirmPrediction(id)
      if (res.success) {
        router.refresh()
      } else {
        alert(res.message)
      }
    })
  }

  const handleSaveEdit = (id: string) => {
    startTransition(async () => {
      const res = await updatePrediction(id, editData)
      if (res.success) {
        setEditingId(null)
        router.refresh()
      } else {
        alert(res.message)
      }
    })
  }

  const startEdit = (p: any) => {
    setEditingId(p.id)
    setEditData({
      predicted_batch_name: p.predicted_batch_name,
      predicted_start_date: p.predicted_start_date,
      suggested_teacher_id: p.suggested_teacher_id,
    })
  }

  const predictions = initialPredictions.filter(p => {
    if (currentCourse === 'PTE') return p.course_type === 'PTE' || p.course_type === 'Online PTE'
    return p.course_type === currentCourse
  })

  const latestReferenceDate = predictions.length > 0 ? predictions[0].reference_date : null;

  return (
    <div className="space-y-6 relative">
      {
        // Controls
      }
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
          <select value={course} onChange={e => setCourse(e.target.value)} className="w-32 border border-gray-300 rounded-md px-3 py-2">
            <option value="PTE">PTE</option>
            <option value="IELTS">IELTS</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="w-32 border border-gray-300 rounded-md px-3 py-2">
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-24 border border-gray-300 rounded-md px-3 py-2" />
        </div>
        
        <button 
          onClick={handleGenerate}
          disabled={isPending}
          className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
          Generate Prediction
        </button>
      </div>

      {
        // Summary
      }
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2">{currentCourse} Overview</h3>
          <p className="text-sm text-blue-800">Batches Currently Active: {activeCount}</p>
          <p className="text-sm text-blue-800">Batches Ending This Month: {predictions.length}</p>
          <p className="text-sm text-blue-800">Replacement Batches: {predictions.length}</p>
        </div>
      </div>

      {
        // Reference Date Anchor Banner
      }
      {latestReferenceDate && (
        <div className="bg-purple-50 border border-purple-200 px-4 py-3 rounded-md flex items-center justify-between">
          <div className="text-purple-900">
            <strong>Your Prediction Reference Date is: </strong> 
            {latestReferenceDate}
          </div>
          <div className="text-purple-700 text-sm">
            All completion and start dates are synchronized from this anchor date.
          </div>
        </div>
      )}

      {
        // Tables
      }
      {predictions.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{currentCourse} Replacement Pipeline</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Current Batch</th>
                  <th className="px-6 py-3">Instructor</th>
                  <th className="px-6 py-3 text-right">Current Class</th>
                  <th className="px-6 py-3 text-right">Remaining</th>
                  <th className="px-6 py-3">Predicted End</th>
                  <th className="px-6 py-3 border-l">New Batch</th>
                  <th className="px-6 py-3">New Start</th>
                  <th className="px-6 py-3">New Instructor</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p, i) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {p.previous_batch?.batch_name || 'NA' }
                    </td>
                    <td className="px-6 py-4">
                      {p.suggested_teacher?.display_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.previous_batch_current_class || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.previous_batch_remaining_classes || 0}
                    </td>
                    <td className="px-6 py-4">
                      {p.previous_batch_completion_date || 'NAr'}
                    </td>
                    <td className="px-6 py-4 border-l font-medium text-gray-900">
                       {typeof editingId === 'string' && editingId === p.id ? (
                          <input type="text" className="border px-2 py-1 w-full" value={editData.predicted_batch_name} onChange={e => setEditData({...editData, predicted_batch_name: e.target.value})} />
                        ) : p.predicted_batch_name}
                    </td>
                    <td className="px-6 py-4">
                      {typeof editingId === 'string' && editingId === p.id ? (
                        <input type="date" className="border px-2 py-1 w-full" value={editData.predicted_start_date} onChange={e => setEditData({...editData, predicted_start_date: e.target.value})} />
                      ) : p.predicted_start_date}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        {p.suggested_teacher?.display_name || 'Unassigned'}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      
      {predictions.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No {currentCourse} Batches Ending This Month</h3>
          <p className="text-gray-500 max-w-sm mx-auto">All active {currentCourse} batches extend beyond this month or no active batches exist.</p>
        </div>
      )}
    </div>
  )
}

