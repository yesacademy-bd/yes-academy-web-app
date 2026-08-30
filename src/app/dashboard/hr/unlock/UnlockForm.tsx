'use client'

import { useState, useTransition } from 'react'
import { unlockClassSession, unlockEntireBatch, unlockAllActiveBatches } from '@/app/actions/attendance'
import { Key, Unlock, AlertCircle } from 'lucide-react'

export default function UnlockForm({ batches }: { batches: any[] }) {
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [selectedClassNum, setSelectedClassNum] = useState('ALL')
  const [duration, setDuration] = useState('60')
  const [isPending, startTransition] = useTransition()

  const selectedBatch = batches.find(b => b.id === selectedBatchId)
  const maxClasses = selectedBatch ? (selectedBatch.total_classes + selectedBatch.additional_classes) : 0
  const classNumbers = Array.from({ length: maxClasses }, (_, i) => i + 1)

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatchId) return

    const durationNum = parseInt(duration)

    startTransition(async () => {
      let res;
      if (selectedBatchId === 'ALL_EXISTING_BATCHES') {
        res = await unlockAllActiveBatches(durationNum)
      } else if (selectedClassNum === 'ALL') {
        res = await unlockEntireBatch(selectedBatchId, durationNum)
      } else {
        const classNum = parseInt(selectedClassNum)
        res = await unlockClassSession(selectedBatchId, classNum, durationNum)
      }

      if (res?.success) {
        alert('Unlock successful!')
        setSelectedBatchId('')
        setSelectedClassNum('ALL')
      } else {
        alert(res?.message || 'Failed to unlock')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" /> Unlock Configuration
        </h2>
        
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
            <select 
              value={selectedBatchId}
              onChange={(e) => { setSelectedBatchId(e.target.value); setSelectedClassNum('ALL'); }}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="" className="text-gray-900">-- Choose a Batch --</option>
              <option value="ALL_EXISTING_BATCHES" className="text-gray-900 font-bold bg-gray-100">Unlock All Existing Batches</option>
              {batches.map(b => (
                <option key={b.id} value={b.id} className="text-gray-900">{b.batch_name} ({b.status})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Class</label>
            <select 
              value={selectedClassNum}
              onChange={(e) => setSelectedClassNum(e.target.value)}
              disabled={!selectedBatchId || selectedBatchId === 'ALL_EXISTING_BATCHES'}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="ALL" className="text-gray-900">Entire Batch (All past/current classes)</option>
              {classNumbers.map(num => (
                <option key={num} value={num} className="text-gray-900">Class {num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unlock Duration</label>
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="15" className="text-gray-900">15 Minutes</option>
              <option value="30" className="text-gray-900">30 Minutes</option>
              <option value="60" className="text-gray-900">1 Hour</option>
              <option value="120" className="text-gray-900">2 Hours</option>
              <option value="1440" className="text-gray-900 font-bold">24 Hours</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={!selectedBatchId || isPending}
            className="w-full mt-4 flex justify-center items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            <Unlock className="w-5 h-5" />
            {isPending ? 'Unlocking...' : 'Grant Access Override'}
          </button>
        </form>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 space-y-4">
        <h3 className="text-blue-900 font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> How it works
        </h3>
        <p className="text-sm text-blue-800">
          <strong>All Existing Batches:</strong> Force unlocks every single class session for all currently active/upcoming batches at once.
        </p>
        <p className="text-sm text-blue-800">
          <strong>Entire Batch:</strong> Unlocks every single class session currently registered for the selected batch. Use this if a teacher needs to go back and audit multiple days of attendance.
        </p>
        <p className="text-sm text-blue-800">
          <strong>Specific Class:</strong> Only targets the exact class number (e.g. Class 02). Note: The teacher must have at least tried to open the class on the original day for it to be registered in the system.
        </p>
        <p className="text-sm text-blue-800">
          The unlock window begins instantly and will automatically hard-lock again once the duration expires.
        </p>
      </div>
    </div>
  )
}
