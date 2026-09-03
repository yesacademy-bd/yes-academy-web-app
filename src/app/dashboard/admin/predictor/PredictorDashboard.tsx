'use client'

import { useState, useTransition } from 'react'
import { generateMonthlyPrediction, confirmPrediction, updatePrediction } from '@/app/actions/predictor'
import { useRouter } from 'next/navigation'
import { Loader2, Calendar, Play, Users, AlertTriangle, X } from 'lucide-react'

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
  const [year, setYeer] = useState(currentYear)
  const [pteTarget, setPteTarget] = useState(8)
  const [ieltsTarget, setIeltsTarget] = useState(5)
  const [admissionGap, setAdmissionGap] = useState(5)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})

  // Modal state
  const [feasibilityError, setFeasibilityError] = useState<any>(null)

  const handleGenerate = (mode: 'strict' | 'batch_count' | 'admission_gap' = 'strict') => {
    if (mode === 'strict' && !confirm('This will clear unconfirmed predictions for the selected month. Continue?')) return
    
    startTransition(async () => {
      const res = await generateMonthlyPrediction(month, year, pteTarget, ieltsTarget, admissionGap, mode)
      if (res.success) {
        setFeasibilityError(null)
        router.push('/dashboard/admin/predictor?month=' + month + '&year=' + year)
      } else if (res.isFeasible === false) {
        setFeasibilityError(res)
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

  const handleSaveEdit = (id: string, originalCompletionDate: string) => {
    startTransition(async () => {
      let actualGap = editData.required_gap
      if (editData.predicted_start_date && originalCompletionDate) {
        const t1 = new Date(originalCompletionDate + 'T12:00:00Z').getTime()
        const t2 = new Date(editData.predicted_start_date + 'T12:00:00Z').getTime()
        actualGap = Math.max(0, Math.floor((t2 - t1) / (1000 * 60 * 60 * 24)) - 1)
      }

      const res = await supdatePrediction(id, { ...editData, actual_gap: actualGap })
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
      required_gap: p.required_gap
    })
  }

  const ptePredictions = initialPredictions.filter(p => p.course_type === 'PTE')
  const ieltsPredictions = initialPredictions.filter(p => p.course_type === 'IELTS')
  const onlinePredictions = initialPredictions.filter(p => p.course_type === 'Online PTE')

  // Find latest reference date
  const latestReferenceDate = initialPredictions.length > 0 ? initialPredictions[0].reference_date : null;

  return (
    <div className="space-y-6 relative">
      {/* Feasibility Modal */}
      {feasibilityError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 text-orange-600">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-xl font-bold text-gray-900">Prediction Not Possible</h2>
              </div>
              <button onClick={() => setFeasibilityError(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Your current requirements cannot be satisfied simultaneously. 
              {feasibilityError.message}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
              <p><strong>Month:</strong> {month}/{year}</p>
              <p><strong>Required {feasibilityError.failedCategory} Batches:</strong> {feasibilityError.target}</p>
              <p><strong>Required Admission Gap:</strong> {admissionGap} Days</p>
              <p className="mt-2 text-orange-700 font-medium">Maximum Possible With {admissionGap}-Day Gap: {feasibilityError.maxPossible} Batches</p>
            </div>

            <p className="text-sm font-medium text-gray-900 mb-3">What would you like to do?</p>
            <div className="space-y-3">
              <button onClick={() => handleGenerate('admission_gap')} className="w-full text-left px-4 py-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="font-medium text-blue-700">Predict Using {admissionGap}-Day Admission Gap</div>
                <div className="text-xs text-gray-500">Generate {feasibilityError.maxPossible} batches to strictly maintain the admission period.</div>
              </button>
              <button onClick={() => handleGenerate('batch_count')} className="w-full text-left px-4 py-3 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
                <div className="font-medium text-orange-700">Predict Based on Batch Count</div>
                <div className="text-xs text-gray-500">Force {feasibilityError.target} batches to be generated, relaxing the admission gap where necessary.</div>
              </button>
              <button onClick={() => setFeasibilityError(null)} className="w-full text-left px-4 py-3 border rounded-lg hover:border-gray-400 hover:bg-gray-100 transition-colors">
                <div className="font-medium text-gray-700">Change Inputs</div>
                <div className="text-xs text-gray-500">Go back and adjust your monthly targets or admission gap.</div>
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admission Gap (Days)</label>
          <input type="number" value={admissionGap} onChange={e => setAdmissionGap(Number(e.target.value))} className="w-24 border border-gray-300 rounded-md px-3 py-2" />
        </div>
        
        <button 
          onClick={() => handleGenerate('strict')}
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

      {/* Reference Date Anchor Banner */}
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

      {/* Tables */}
      {[
        { title: 'PTE Academic Predictions', data: ptePredictions },
        { title: 'IELTS Predictions', data: ieltsPredictions },
        { title: 'Online PTE Predictions', data: onlinePredictions }
      ].map(section => section.data.length > 0 && (
        <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-3">New Batch</th>
                  <th className="px-6 py-3">New Start</th>
                  <th className="px-6 py-3">Previous Batch (Anchor)</th>
                  <th className="px-6 py-3 text-center">Admission Gap</th>
                  <th className="px-6 py-3">Suggested Teacher</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {section.data.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
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
                      {p.previous_batch?.batch_name ? (
                        <div>
                          <span className="block font-medium text-gray-900">{p.previous_batch.batch_name} (Class {p.previous_batch_current_class})</span>
                          <span className="block text-xs text-gray-500">Remaining: {p.previous_batch_remaining_classes} â€¢ Completes: {p.previous_batch_completion_date}</span>
                        </div>
                      ) : <span className="text-gray-400">N/A (New Slot)</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.previous_batch?.batch_name ? (
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-gray-900">{p.actual_gap} days</span>
                          <span className="text-xs text-gray-500">Required: {p.required_gap}</span>
                          {p.actual_gap < p.required_gap && (
                            <span className="mt-1 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                              âš¡ Below Req.
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {typeof editingId === 'string' && editingId === p.id ? (
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
                      <span className={'px-2 py-1 text-xs font-medium rounded-full ' + (p.prediction_status === 'Confirmed' ? 'bg-green-100 text-green-700' : p.manually_modified ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>
                        {p.prediction_status === 'Confirmed' ? 'Confirmed' : p.manually_modified ? 'Modified' : 'Suggested'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {typeof editingId === 'string' && editingId === p.id ? (
                        <button onClici={() => handleSaveEdit(p.id, p.previous_batch_completion_date)} className="text-green-600 hover:text-green-800 font-medium">Save</button>
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
      ))
}
      
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

