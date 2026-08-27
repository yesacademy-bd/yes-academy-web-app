'use client'

import { useState, useEffect, useTransition } from 'react'
import { getStudentProgress, updateStudentProgressDetails } from '@/app/actions/progress'
import { Loader2 } from 'lucide-react'

export default function StudentProgressModal({ 
  isOpen, 
  onClose, 
  student 
}: { 
  isOpen: boolean
  onClose: () => void
  student: any 
}) {
  const [loading, setLoading] = useState(true)
  const [saving, startSaving] = useTransition()
  
  const [practiceDetails, setPracticeDetails] = useState<any>({})
  const [mockScore, setMockScore] = useState<string>('')
  const [speaking, setSpeaking] = useState<string>('')
  const [listening, setListening] = useState<string>('')
  const [reading, setReading] = useState<string>('')
  const [writing, setWriting] = useState<string>('')

  useEffect(() => {
    if (isOpen && student?.enrollment_id) {
      setLoading(true)
      getStudentProgress(student.enrollment_id).then(res => {
        if (res.success && res.data) {
          setPracticeDetails(res.data.practice_details || {})
          setMockScore(res.data.mock_test_score?.toString() || '')
          setSpeaking(res.data.speaking?.toString() || '')
          setListening(res.data.listening?.toString() || '')
          setReading(res.data.reading?.toString() || '')
          setWriting(res.data.writing?.toString() || '')
        } else {
          setPracticeDetails({})
          setMockScore('')
          setSpeaking('')
          setListening('')
          setReading('')
          setWriting('')
        }
        setLoading(false)
      })
    }
  }, [isOpen, student])

  if (!isOpen) return null

  const handleSave = () => {
    startSaving(async () => {
      const updates = {
        practice_details: practiceDetails,
        mock_test_score: mockScore ? parseFloat(mockScore) : null,
        speaking: speaking ? parseFloat(speaking) : null,
        listening: listening ? parseFloat(listening) : null,
        reading: reading ? parseFloat(reading) : null,
        writing: writing ? parseFloat(writing) : null,
      }
      
      const res = await updateStudentProgressDetails(student.enrollment_id, updates)
      if (res.success) {
        alert('Student progress updated successfully!')
        onClose()
      } else {
        alert('Failed to update: ' + res.error)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h3 className="font-bold text-lg text-white" style={{ WebkitTextFillColor: 'white' }}>
            Progress & Details: {student?.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Exam Scores Section */}
              <section>
                <h4 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">Exam Scores</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Mock Test</label>
                    <input type="number" step="0.5" value={mockScore} onChange={e => setMockScore(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Speaking</label>
                    <input type="number" step="0.5" value={speaking} onChange={e => setSpeaking(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Listening</label>
                    <input type="number" step="0.5" value={listening} onChange={e => setListening(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Reading</label>
                    <input type="number" step="0.5" value={reading} onChange={e => setReading(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Writing</label>
                    <input type="number" step="0.5" value={writing} onChange={e => setWriting(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </section>

              {/* Weekly Practice Section */}
              <section>
                <h4 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">Weekly Practice Hours & Remarks</h4>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(week => (
                    <div key={week} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                      <div className="w-32 flex-shrink-0">
                        <span className="text-sm font-medium text-slate-200">Week {week}</span>
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label className="block text-[10px] text-slate-400 mb-1 uppercase">Practice HRS</label>
                        <input 
                          type="number" 
                          step="0.5"
                          value={practiceDetails[`week_${week}_hrs`] || ''} 
                          onChange={e => setPracticeDetails({...practiceDetails, [`week_${week}_hrs`]: e.target.value})} 
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                          placeholder="e.g. 10.5"
                        />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label className="block text-[10px] text-slate-400 mb-1 uppercase">Remarks</label>
                        <input 
                          type="text" 
                          value={practiceDetails[`week_${week}_remarks`] || ''} 
                          onChange={e => setPracticeDetails({...practiceDetails, [`week_${week}_remarks`]: e.target.value})} 
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="Student feedback..." 
                        />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label className="block text-[10px] text-slate-400 mb-1 uppercase">Practiced Q's</label>
                        <input 
                          type="text" 
                          value={practiceDetails[`week_${week}_questions`] || ''} 
                          onChange={e => setPracticeDetails({...practiceDetails, [`week_${week}_questions`]: e.target.value})} 
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="Questions count..." 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading || saving} 
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </div>
    </div>
  )
}
