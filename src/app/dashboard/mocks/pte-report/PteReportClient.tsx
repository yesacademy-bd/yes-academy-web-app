'use client'

import { useState } from 'react'
import { submitPteMockReport } from './actions'
import { CheckCircle, Search } from 'lucide-react'

type Booking = {
  id: string
  student_name: string
  student_type: string
  batch_number: string
  email: string
  phone: string
  service_type: string
  mock_type: string
  exam_date: string
}

type ModuleData = {
  rating: number | ''
  score: string
  strengths: string
  improvements: string
  action_plan: string
}

export default function PteReportClient({ initialBookings, trainerName }: { initialBookings: Booking[], trainerName: string }) {
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    const offset = d.getTimezoneOffset()
    d.setMinutes(d.getMinutes() - offset)
    return d.toISOString().split('T')[0]
  })

  const [modules, setModules] = useState<{ [key: string]: ModuleData }>({
    speaking: { rating: '', score: '', strengths: '', improvements: '', action_plan: '' },
    writing: { rating: '', score: '', strengths: '', improvements: '', action_plan: '' },
    reading: { rating: '', score: '', strengths: '', improvements: '', action_plan: '' },
    listening: { rating: '', score: '', strengths: '', improvements: '', action_plan: '' },
  })

  const [overallScore, setOverallScore] = useState('')
  const [overallFeedback, setOverallFeedback] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [emailFailed, setEmailFailed] = useState(false)

  const selectedBooking = initialBookings.find(b => b.id === selectedBookingId)

  // Filter bookings for the dropdown based on search
  const filteredBookings = initialBookings.filter(b => {
    if (selectedDate && b.exam_date !== selectedDate) return false
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return b.student_name.toLowerCase().includes(search) || 
           (b.phone && b.phone.includes(search)) || 
           (b.email && b.email.toLowerCase().includes(search)) ||
           (b.batch_number && b.batch_number.toLowerCase().includes(search))
  })

  const handleModuleChange = (mod: string, field: string, val: string | number) => {
    setModules(prev => ({
      ...prev,
      [mod]: { ...prev[mod], [field]: val }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return

    // Validation
    const requiredModules = ['speaking', 'writing', 'reading', 'listening']
    for (const mod of requiredModules) {
      if (modules[mod].rating === '') {
        return setErrorMsg(`Please select a rating (1-5) for ${mod}.`)
      }
    }

    if (!overallScore) return setErrorMsg('Overall Score is required.')

    setErrorMsg('')
    setIsSubmitting(true)

    const formData = {
      mock_booking_id: selectedBooking.id,
      speaking_rating: modules.speaking.rating,
      speaking_score: modules.speaking.score,
      speaking_strengths: modules.speaking.strengths,
      speaking_improvements: modules.speaking.improvements,
      speaking_action_plan: modules.speaking.action_plan,

      writing_rating: modules.writing.rating,
      writing_score: modules.writing.score,
      writing_strengths: modules.writing.strengths,
      writing_improvements: modules.writing.improvements,
      writing_action_plan: modules.writing.action_plan,

      reading_rating: modules.reading.rating,
      reading_score: modules.reading.score,
      reading_strengths: modules.reading.strengths,
      reading_improvements: modules.reading.improvements,
      reading_action_plan: modules.reading.action_plan,

      listening_rating: modules.listening.rating,
      listening_score: modules.listening.score,
      listening_strengths: modules.listening.strengths,
      listening_improvements: modules.listening.improvements,
      listening_action_plan: modules.listening.action_plan,

      overall_score: overallScore,
      overall_feedback: overallFeedback
    }

    const res = await submitPteMockReport(formData)
    setIsSubmitting(false)

    if (res.success) {
      setSuccess(true)
      if (res.emailFailed) {
        setEmailFailed(true)
      }
    } else {
      setErrorMsg(res.message || 'Failed to submit report.')
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center max-w-2xl mx-auto mt-10">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mock Report Submitted Successfully</h2>
        <p className="text-gray-600 mb-6">
          {emailFailed 
            ? "The report was saved successfully, but the email could not be sent to the student. You can resend it later from Mock History."
            : "The report has been saved and sent to the student's email address."}
        </p>
        <button 
          onClick={() => window.location.href = '/dashboard/mocks'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Return to Mock Services
        </button>
      </div>
    )
  }

  const renderModuleSection = (moduleName: string, title: string) => {
    const mod = modules[moduleName]
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 border-b border-gray-100 pb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rating (1-5) <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleModuleChange(moduleName, 'rating', num)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border ${mod.rating === num ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Score</label>
            <input 
              type="text" 
              placeholder="Enter Score"
              value={mod.score}
              onChange={e => handleModuleChange(moduleName, 'score', e.target.value)}
              className="w-full max-w-[200px] border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Strengths</label>
            <textarea 
              rows={3}
              value={mod.strengths}
              onChange={e => handleModuleChange(moduleName, 'strengths', e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-sm"
              placeholder="Enter strengths..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Areas for Improvement</label>
            <textarea 
              rows={3}
              value={mod.improvements}
              onChange={e => handleModuleChange(moduleName, 'improvements', e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-sm"
              placeholder="Enter improvements..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Action Plan</label>
            <textarea 
              rows={3}
              value={mod.action_plan}
              onChange={e => handleModuleChange(moduleName, 'action_plan', e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-sm"
              placeholder="Enter action plan..."
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="text-red-700 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Booking Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Select Mock Booking</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4 max-w-xl">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
              placeholder="Search by Name, Email, Phone, or Batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[220px] relative">
            <input
              type="date"
              title="Filter by Exam Date"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-700 font-medium"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 text-xs font-bold px-2 py-1 rounded bg-gray-100 hover:bg-red-50 transition-colors"
                title="Clear Date Filter"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="max-w-xl">
          <select 
            size={5}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
          >
            {filteredBookings.map(b => (
              <option key={b.id} value={b.id} className="p-2 hover:bg-blue-50 border-b border-gray-100 cursor-pointer">
                {b.student_name} — {b.batch_number || 'No Batch'} — {new Date(b.exam_date).toLocaleDateString()} — {b.service_type || b.mock_type}
              </option>
            ))}
            {filteredBookings.length === 0 && (
              <option disabled className="p-2 text-gray-500">No PTE mock bookings found...</option>
            )}
          </select>
        </div>
      </div>

      {/* Student Info Snapshot */}
      {selectedBooking && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Student Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Student Name</p>
              <p className="font-bold text-gray-900 text-lg">{selectedBooking.student_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Student Type</p>
              <p className="font-bold text-gray-900">{selectedBooking.student_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Batch Number</p>
              <p className="font-bold text-gray-900">{selectedBooking.batch_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Student Email</p>
              <p className="font-bold text-gray-900 break-all">{selectedBooking.email || 'No email'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Trainer Name</p>
              <p className="font-bold text-gray-900">{trainerName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</p>
              <p className="font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {selectedBooking && (
        <>
          <div className="mt-8 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">PTE MODULE RATING</h2>
            <p className="text-gray-500">Evaluate each module. Rating (1-5) is required.</p>
          </div>

          {renderModuleSection('speaking', 'Speaking')}
          {renderModuleSection('writing', 'Writing')}
          {renderModuleSection('reading', 'Reading')}
          {renderModuleSection('listening', 'Listening')}

          {/* Overall Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm mb-6">
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-900 mb-2">Overall Score <span className="text-red-500">*</span></label>
              <p className="text-sm text-gray-500 mb-3">Do not calculate this automatically. Enter the final score manually.</p>
              <input 
                type="text" 
                value={overallScore}
                onChange={(e) => setOverallScore(e.target.value)}
                placeholder="Enter Overall Score"
                className="w-full max-w-xs border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 font-bold text-xl" 
                required
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-2">OVERALL SUGGESTIONS / TRAINER FEEDBACK</label>
              <textarea 
                rows={5}
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                placeholder="Provide overall feedback, recommendations, and guidance for the student's next stage of preparation."
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">Report Submitted By:</p>
              <p className="font-bold text-gray-900">{trainerName}</p>
            </div>
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
            </button>
          </div>
        </>
      )}

    </form>
  )
}

