'use client'

import { useState, useTransition } from 'react'
import { generateMonthlyPrediction, confirmPrediction, updatePrediction } from '@/app/actions/predictor'
import { useRouter } from 'next/navigation'
import { Loader2, Calendar, Check, Edit2, Play, Users } from 'lucide-react'

export default function PredictorDashboard({ 
  initialPredictions, 
  eligibleTeachers,
  currentMonth,
  currentYear
}: { 
  initialPredictions: any[], 
  eligibleTeachers: any[],
  currentMonth: number,
  currentYear: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [pteTarget, setPteTarget] = useState(8)
  const [ieltsTarget, setIeltsTarget] = useState(5)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})

  const handleGenerate = () => {
    if (!confirm('This will clear unconfirmed predictions for the selected month. Continue?')) return
    
    startTransition(async () => {
      const res = await generateMonthlyPrediction(month, year, pteTarget, ieltsTarget)
      if (res.success) {
        router.push('/dashboard/admin/predictor?month=' + month + '&year=' + year)
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
      suggested_teacher_id: p.suggested_teacher_id
    })
  }

  const ptePredictions = initialPredictions.filter(p => p.course_type === 'PTE')
  const ieltsPredictions = initialPredictions.filter(p => p.course_type === 'IELTS')
  const onlinePredictions = initialPredictions.filter(p => p.course_type === 'Online PTE')

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PTE Target</label>
          <input type="number" value={pteTarget} onChange={e => setPteTarget(Number(e.target.value))} className="w-24 border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IELTS Target</label>
          <input type="number" value={ieltsTarget} onChange={e => setIeltsTarget(Number(e.target.value))} className="w-24 border border-gray-300 rounded-md px-3 py-2" />
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2">PTE Academic Overview</h3>
          <p className="text-sm text-blue-800">Target: {pteTarget}</p>
          <p className="text-sm text-blue-800">Predicted: {ptePredictions.length}</p>
          <p className="text-sm text-blue-800">Shortfall: {Math.max(0, pteTarget - ptePredictions.length)}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
          <h3 className="font-semibold text-emerald-900 mb-2">IELTS Overview</h3>
          <p className="text-sm text-emerald-800">Target: {ieltsTarget}</p>
          <p className="text-sm text-emerald-800">Predicted: {ieltsPredictions.length}</p>
          <p className="text-sm text-emerald-800">Shortfall: {Math.max(0, ieltsTarget - ieltsPredictions.length)}</p>
        </div>
      </div>

      {/* Tables */}
      {[
        { title: 'PTE Academic Predictions', data: ptePredictions },
        { title: 'IELTS Predictions', data: ieltsPredictions },
        { title: 'Online PTE Predictions', data: onlinePredictions }
      ].map(section => section.data.length > 0 && (
        <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-3">Batch Name</th>
                  <th className="px-6 py-3">Predicted Start</th>
                  <th className="px-6 py-3">Replaces</th>
                  <th className="px-6 py-3">Suggested Teacher</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {section.data.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {editingId === p.id ? (
                        <input type="text" className="border px-2 py-1 w-full" value={editData.predicted_batch_name} onChange={e => setEditData({...editData, predicted_batch_name: e.target.value})} />
                      ) : p.predicted_batch_name}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === p.id ? (
                        <input type="date" className="border px-2 py-1 w-full" value={editData.predicted_start_date} onChange={e => setEditData({...editData, predicted_start_date: e.target.value})} />
                      ) : p.predicted_start_date}
                    </td>
                    <td className="px-6 py-4">
                      {p.previous_batch?.batch_name ? (
                        <div>
                          <span className="block font-medium text-gray-900">{p.previous_batch.batch_name}</span>
                          <span className="block text-xs text-gray-500">Ends: {p.previous_batch_completion_date}</span>
                        </div>
                      ) : <span className="text-gray-400">N/A (New Slot)</span>}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === p.id ? (
                        <select className="border px-2 py-1 w-full" value={editData.suggested_teacher_id || ''} onChange={e => setEditData({...editData, suggested_teacher_id: e.target.value})}>
                          <option value="">Select Teacher</option>
                          {eligibleTeachers.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}
                        </select>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          {p.suggested_teacher?.display_name || 'Unassigned'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={'px-2 py-1 text-xs font-medium rounded-full ' + (p.prediction_status === 'Confirmed' ? 'bg-green-100 text-green-700' : p.manually_modified ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700')}>
                        {p.prediction_status === 'Confirmed' ? 'Confirmed' : p.manually_modified ? 'Modified' : 'Suggested'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {editingId === p.id ? (
                        <button onClick={() => handleSaveEdit(p.id)} className="text-green-600 hover:text-green-800 font-medium">Save</button>
                      ) : p.prediction_status !== 'Confirmed' ? (
                        <>
                          <button onClick={() => startEdit(p)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">Edit</button>
                          <button onClick={() => handleConfirm(p.id)} className="text-green-600 hover:text-green-800 font-medium">Confirm</button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      
      {initialPredictions.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Predictions Generated</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Set your targets and click "Generate Prediction" to see the suggested batch pipeline.</p>
        </div>
      )}
    </div>
  )
}
