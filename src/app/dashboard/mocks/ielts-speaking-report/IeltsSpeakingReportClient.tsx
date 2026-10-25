'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  FileText, Search, CheckCircle, Mail, Printer, Download, 
  RotateCcw, History, PlusCircle, AlertCircle, RefreshCw, UserCheck
} from 'lucide-react'
import { submitIeltsSpeakingReport, resendIeltsReportEmail, fetchIeltsSpeakingReport } from './actions'

type Candidate = {
  id: string
  student_name: string
  student_type?: string
  batch_number?: string
  email?: string
  phone?: string
  service_type?: string
  exam_date?: string
  speaking_time?: string
  speaking_method?: string
}

type RegisteredStudent = {
  id: string
  system_id?: string
  name: string
  email?: string
  phone?: string
}

type Props = {
  initialBookings: Candidate[]
  initialStudents: RegisteredStudent[]
  initialReports: any[]
  trainerName: string
}

const BAND_SCORES = [
  '9.0', '8.5', '8.0', '7.5', '7.0', '6.5', '6.0', '5.5', '5.0', '4.5', '4.0', '3.5', '3.0'
]

const PERFORMANCE_LEVELS = [
  { level: 'Limited', desc: 'Frequent errors & hesitations', color: 'border-amber-300 hover:bg-amber-50 text-amber-900', active: 'bg-amber-600 text-white border-amber-600 shadow' },
  { level: 'Moderate', desc: 'Acceptable with occasional lapses', color: 'border-blue-300 hover:bg-blue-50 text-blue-900', active: 'bg-blue-600 text-white border-blue-600 shadow' },
  { level: 'Good', desc: 'Effective command & minor flaws', color: 'border-indigo-300 hover:bg-indigo-50 text-indigo-900', active: 'bg-indigo-600 text-white border-indigo-600 shadow' },
  { level: 'Excellent', desc: 'Fluent, precise, and natural', color: 'border-emerald-300 hover:bg-emerald-50 text-emerald-900', active: 'bg-emerald-600 text-white border-emerald-600 shadow' },
]

export default function IeltsSpeakingReportClient({
  initialBookings,
  initialStudents,
  initialReports,
  trainerName
}: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form')

  // Candidate Selection State
  const [candidateSource, setCandidateSource] = useState<'mock' | 'student' | 'manual'>('mock')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')

  // Form Fields State
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [candidateNumber, setCandidateNumber] = useState('')
  const [studentType, setStudentType] = useState('Inhouse')
  const [batchNumber, setBatchNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [testDate, setTestDate] = useState(() => new Date().toISOString().split('T')[0])

  // 4 Assessment Criteria
  const [fluencyCoherence, setFluencyCoherence] = useState('')
  const [lexicalResources, setLexicalResources] = useState('')
  const [grammaticalRange, setGrammaticalRange] = useState('')
  const [pronunciation, setPronunciation] = useState('')

  // Score & Feedback
  const [overallBandScore, setOverallBandScore] = useState('6.5')
  const [suggestions, setSuggestions] = useState('')
  const [additionalComments, setAdditionalComments] = useState('')

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null)

  // Report History State
  const [reports, setReports] = useState(initialReports)
  const [historySearch, setHistorySearch] = useState('')
  const [historyDateFilter, setHistoryDateFilter] = useState('')

  // Report Viewer Modal
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; data: any | null; isLoading: boolean }>({
    isOpen: false,
    data: null,
    isLoading: false,
  })
  const [isResending, setIsResending] = useState(false)

  // Filtered mock bookings
  const filteredBookings = useMemo(() => {
    return initialBookings.filter(b => {
      if (selectedDate && b.exam_date !== selectedDate) return false
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        b.student_name.toLowerCase().includes(q) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q)) ||
        (b.batch_number && b.batch_number.toLowerCase().includes(q))
      )
    })
  }, [initialBookings, selectedDate, searchQuery])

  // Filtered registered students
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return initialStudents.slice(0, 30)
    const q = searchQuery.toLowerCase()
    return initialStudents.filter(s => {
      return (
        s.name.toLowerCase().includes(q) ||
        (s.system_id && s.system_id.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      )
    }).slice(0, 40)
  }, [initialStudents, searchQuery])

  // Handle Mock Booking selection
  const handleSelectBooking = (id: string) => {
    setSelectedBookingId(id)
    const booking = initialBookings.find(b => b.id === id)
    if (booking) {
      setStudentName(booking.student_name || '')
      setStudentEmail(booking.email || '')
      setStudentType(booking.student_type || 'Inhouse')
      setBatchNumber(booking.batch_number || '')
      setPhone(booking.phone || '')
      if (booking.exam_date) setTestDate(booking.exam_date)
      setCandidateNumber(booking.id.slice(0, 8).toUpperCase())
    }
  }

  // Handle Registered Student selection
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id)
    const student = initialStudents.find(s => s.id === id)
    if (student) {
      setStudentName(student.name || '')
      setStudentEmail(student.email || '')
      setCandidateNumber(student.system_id || '')
      setPhone(student.phone || '')
      setStudentType('Inhouse')
    }
  }

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!studentName.trim()) {
      return setSubmitError('Student Name is required.')
    }
    if (!testDate) {
      return setSubmitError('Test Date is required.')
    }
    if (!fluencyCoherence) {
      return setSubmitError('Please select a performance level for Fluency & Coherence.')
    }
    if (!lexicalResources) {
      return setSubmitError('Please select a performance level for Lexical Resources.')
    }
    if (!grammaticalRange) {
      return setSubmitError('Please select a performance level for Grammatical Range & Accuracy.')
    }
    if (!pronunciation) {
      return setSubmitError('Please select a performance level for Pronunciation.')
    }
    if (!overallBandScore) {
      return setSubmitError('Overall Band Score is required.')
    }

    setIsSubmitting(true)

    const payload = {
      mock_booking_id: candidateSource === 'mock' ? selectedBookingId || null : null,
      student_id: candidateSource === 'student' ? selectedStudentId || null : null,
      student_name: studentName,
      student_email: studentEmail,
      candidate_number: candidateNumber,
      student_type: studentType,
      batch_number: batchNumber,
      phone,
      test_date: testDate,
      fluency_coherence: fluencyCoherence,
      lexical_resources: lexicalResources,
      grammatical_range: grammaticalRange,
      pronunciation,
      overall_band_score: overallBandScore,
      suggestions,
      additional_comments: additionalComments,
    }

    const res = await submitIeltsSpeakingReport(payload)
    setIsSubmitting(false)

    if (res.success) {
      setSubmitSuccess(res)
      if (res.data) {
        setReports(prev => [res.data, ...prev])
      }
    } else {
      setSubmitError(res.message || 'Failed to submit IELTS Speaking Report.')
    }
  }

  // Reset Form
  const handleResetForm = () => {
    setSelectedBookingId('')
    setSelectedStudentId('')
    setStudentName('')
    setStudentEmail('')
    setCandidateNumber('')
    setBatchNumber('')
    setPhone('')
    setFluencyCoherence('')
    setLexicalResources('')
    setGrammaticalRange('')
    setPronunciation('')
    setOverallBandScore('6.5')
    setSuggestions('')
    setAdditionalComments('')
    setSubmitSuccess(null)
    setSubmitError(null)
  }

  // View Report
  const handleViewReport = async (reportId: string) => {
    setReportModal({ isOpen: true, data: null, isLoading: true })
    const res = await fetchIeltsSpeakingReport(reportId)
    if (res.success && res.data) {
      setReportModal({ isOpen: true, data: res.data, isLoading: false })
    } else {
      alert('Failed to load report data.')
      setReportModal({ isOpen: false, data: null, isLoading: false })
    }
  }

  // Resend Email
  const handleResendEmail = async (reportId: string) => {
    setIsResending(true)
    const res = await resendIeltsReportEmail(reportId)
    setIsResending(false)
    alert(res.message)
    if (res.success) {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, email_status: 'Sent' } : r))
      if (reportModal.data && reportModal.data.id === reportId) {
        setReportModal(prev => ({ ...prev, data: { ...prev.data, email_status: 'Sent' } }))
      }
    }
  }

  // Filtered History Reports
  const filteredHistory = useMemo(() => {
    return reports.filter(r => {
      if (historyDateFilter && r.test_date !== historyDateFilter) return false
      if (!historySearch) return true
      const q = historySearch.toLowerCase()
      return (
        r.student_name.toLowerCase().includes(q) ||
        (r.candidate_number && r.candidate_number.toLowerCase().includes(q)) ||
        (r.batch_number && r.batch_number.toLowerCase().includes(q)) ||
        (r.student_email && r.student_email.toLowerCase().includes(q)) ||
        (r.trainer_name && r.trainer_name.toLowerCase().includes(q))
      )
    })
  }, [reports, historySearch, historyDateFilter])

  // Download PDF using html2pdf
  const handleDownloadPdf = (reportData: any) => {
    const safeName = (reportData.student_name || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_')
    const safeDate = (reportData.test_date || '').replace(/[^a-zA-Z0-9]/g, '-')
    const filename = `YES_Academy_IELTS_Speaking_Report_${safeName}_${safeDate}.pdf`

    const element = document.getElementById('printable-ielts-report')
    if (!element) {
      return alert('Report element not found for PDF export.')
    }

    import('html2pdf.js').then(module => {
      const html2pdf = module.default || module
      const opt = {
        margin: 10,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      html2pdf().set(opt).from(element).save()
    }).catch(err => {
      console.error('PDF export error:', err)
      alert('Could not generate PDF download.')
    })
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-[#E10600]">YES Academy</span> IELTS Speaking Score Report
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Standard 4-Criteria Assessment &bull; Automated PDF Generation &bull; Student Email Delivery
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'form'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#E10600]" /> New Assessment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'history'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-4 h-4 text-blue-600" /> Report History ({reports.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NEW ASSESSMENT FORM */}
      {/* ========================================================================= */}
      {activeTab === 'form' && (
        <>
          {submitSuccess ? (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 sm:p-10 max-w-2xl mx-auto text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">IELTS Speaking Report Submitted!</h2>
              <p className="text-gray-600 text-sm max-w-lg mx-auto">
                {submitSuccess.message}
              </p>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left max-w-md mx-auto text-sm space-y-1">
                <p><strong>Candidate:</strong> {submitSuccess.data?.student_name}</p>
                <p><strong>Overall Band Score:</strong> <span className="font-bold text-[#E10600] text-base">{submitSuccess.data?.overall_band_score}</span></p>
                <p><strong>Email:</strong> {submitSuccess.data?.student_email || 'No email provided'}</p>
                <p><strong>Examiner:</strong> {submitSuccess.data?.trainer_name}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => handleViewReport(submitSuccess.data.id)}
                  className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
                >
                  View / Print Report
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  Create Another Assessment
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="bg-red-50 border-l-4 border-[#E10600] p-4 rounded-r-xl flex items-center gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-[#E10600] shrink-0" />
                  <p className="text-red-700 font-semibold text-sm">{submitError}</p>
                </div>
              )}

              {/* 1. Candidate Selection Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-blue-600" /> 1. Select Student Candidate
                    </h2>
                    <p className="text-xs text-gray-500">Pick from booked mock sessions, registered student database, or enter manually.</p>
                  </div>

                  {/* Candidate Source Selector */}
                  <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setCandidateSource('mock')}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        candidateSource === 'mock' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      IELTS Mock Bookings ({initialBookings.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidateSource('student')}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        candidateSource === 'student' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Registered Students
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCandidateSource('manual')
                        setSelectedBookingId('')
                        setSelectedStudentId('')
                      }}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        candidateSource === 'manual' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Manual Entry
                    </button>
                  </div>
                </div>

                {/* Search & Date Filters for Mock Source */}
                {candidateSource !== 'manual' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="sm:col-span-2 relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search candidate by name, phone, email, or batch..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {candidateSource === 'mock' && (
                      <div className="relative">
                        <input
                          type="date"
                          title="Filter by Exam Date"
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-700"
                        />
                        {selectedDate && (
                          <button
                            type="button"
                            onClick={() => setSelectedDate('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded text-gray-700"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Candidate Selection List */}
                {candidateSource === 'mock' && (
                  <div className="pt-1">
                    <select
                      size={4}
                      value={selectedBookingId}
                      onChange={e => handleSelectBooking(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {filteredBookings.map(b => (
                        <option key={b.id} value={b.id} className="p-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 rounded">
                          {b.student_name} &bull; {b.batch_number || 'External'} &bull; Exam: {b.exam_date || 'No Date'} &bull; {b.phone || 'No phone'}
                        </option>
                      ))}
                      {filteredBookings.length === 0 && (
                        <option disabled className="p-4 text-center text-gray-400">
                          No IELTS Mock bookings match your search.
                        </option>
                      )}
                    </select>
                  </div>
                )}

                {candidateSource === 'student' && (
                  <div className="pt-1">
                    <select
                      size={4}
                      value={selectedStudentId}
                      onChange={e => handleSelectStudent(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {filteredStudents.map(s => (
                        <option key={s.id} value={s.id} className="p-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 rounded">
                          {s.name} {s.system_id ? `(${s.system_id})` : ''} &bull; {s.email || 'No email'} &bull; {s.phone || 'No phone'}
                        </option>
                      ))}
                      {filteredStudents.length === 0 && (
                        <option disabled className="p-4 text-center text-gray-400">
                          No students match your search.
                        </option>
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* 2. Candidate & Test Information Snapshot */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
                  <span>2. Candidate & Assessment Information</span>
                  <span className="text-xs font-normal text-gray-500">Auto-populated from selection</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Candidate full name"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Student Email
                    </label>
                    <input
                      type="email"
                      placeholder="student@example.com (for automated delivery)"
                      value={studentEmail}
                      onChange={e => setStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Candidate Number / ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. YES-1029 or System ID"
                      value={candidateNumber}
                      onChange={e => setCandidateNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Test Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={testDate}
                      onChange={e => setTestDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Examiner / Faculty Name
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={trainerName}
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Batch Number / Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CD IELTS-114"
                      value={batchNumber}
                      onChange={e => setBatchNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. IELTS Speaking Assessment Categories Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-lg font-bold text-gray-900">3. IELTS Speaking Criteria Evaluation</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select exactly one performance level for each of the four official IELTS Speaking assessment categories.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Category 1: Fluency & Coherence */}
                  <CriteriaRow
                    title="1. Fluency & Coherence"
                    description="Speech flow, continuity, hesitation management, and logical linking of ideas."
                    value={fluencyCoherence}
                    onChange={setFluencyCoherence}
                  />

                  {/* Category 2: Lexical Resources */}
                  <CriteriaRow
                    title="2. Lexical Resources"
                    description="Vocabulary range, precise word choice, idiomatic language, and paraphrase ability."
                    value={lexicalResources}
                    onChange={setLexicalResources}
                  />

                  {/* Category 3: Grammatical Range & Accuracy */}
                  <CriteriaRow
                    title="3. Grammatical Range & Accuracy"
                    description="Variety of sentence structures, subordinate clauses, tense consistency, and error tolerance."
                    value={grammaticalRange}
                    onChange={setGrammaticalRange}
                  />

                  {/* Category 4: Pronunciation */}
                  <CriteriaRow
                    title="4. Pronunciation"
                    description="Intonation, stress patterns, clarity, accent neutrality, and effortless intelligibility."
                    value={pronunciation}
                    onChange={setPronunciation}
                  />
                </div>
              </div>

              {/* 4. Overall Band Score & Feedback */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">4. Overall Band Score & Examiner Feedback</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Enter the final evaluated band score and personalized suggestions.</p>
                </div>

                {/* Overall Band Score Selector */}
                <div className="bg-red-50/60 border border-red-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="block text-base font-bold text-gray-900">
                      Overall IELTS Speaking Band Score <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Explicitly enter or select the evaluated band score (0.0 – 9.0).
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={overallBandScore}
                      onChange={e => setOverallBandScore(e.target.value)}
                      className="px-4 py-2.5 bg-white border-2 border-[#E10600] rounded-xl font-black text-xl text-[#E10600] shadow-sm focus:ring-2 focus:ring-red-500"
                    >
                      {BAND_SCORES.map(score => (
                        <option key={score} value={score}>
                          Band {score}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">IELTS Scale</span>
                  </div>
                </div>

                {/* Suggestions & Additional Comments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      Suggestions & Areas for Improvement
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Personalized guidance on weaknesses and preparation action items.</p>
                    <textarea
                      rows={5}
                      value={suggestions}
                      onChange={e => setSuggestions(e.target.value)}
                      placeholder="e.g. Focus on expanding Part 2 cue-card responses with structured anecdotes. Avoid overusing fillers like 'you know' or 'basically'..."
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      Additional Examiner Comments
                    </label>
                    <p className="text-xs text-gray-500 mb-2">General observations on demeanor, fluency cadence, or test-taking pace.</p>
                    <textarea
                      rows={5}
                      value={additionalComments}
                      onChange={e => setAdditionalComments(e.target.value)}
                      placeholder="e.g. The candidate exhibited pleasant confidence throughout Part 1. Maintained good eye contact and answered questions directly..."
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action Bar */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Report Submitted By:</p>
                  <p className="text-base font-bold text-gray-900">{trainerName}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm shadow-sm"
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 bg-[#E10600] text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving & Emailing...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" /> Submit Report & Email PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REPORT HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Submitted IELTS Speaking Reports</h2>
              <p className="text-xs text-gray-500">History of all assessments, PDF downloads, and email delivery statuses.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student, ID, batch, examiner..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={historyDateFilter}
                  onChange={e => setHistoryDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium"
                />
                {historyDateFilter && (
                  <button
                    type="button"
                    onClick={() => setHistoryDateFilter('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-200 px-1.5 py-0.5 rounded"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full pt-2">
            <table className="w-full text-left border-collapse border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 text-xs uppercase tracking-wider">
                  <th className="p-3 border-r border-gray-200">Student Name</th>
                  <th className="p-3 border-r border-gray-200">Candidate / Batch</th>
                  <th className="p-3 border-r border-gray-200 text-center">Test Date</th>
                  <th className="p-3 border-r border-gray-200 text-center">Overall Band</th>
                  <th className="p-3 border-r border-gray-200">Examiner</th>
                  <th className="p-3 border-r border-gray-200 text-center">Email Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map(rep => (
                  <tr key={rep.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3 font-semibold text-gray-900 border-r border-gray-200">
                      <div>{rep.student_name}</div>
                      <div className="text-xs text-gray-400 font-normal">{rep.student_email || 'No email'}</div>
                    </td>
                    <td className="p-3 text-gray-700 border-r border-gray-200">
                      <span className="font-mono text-xs">{rep.candidate_number || '-'}</span>
                      {rep.batch_number && <div className="text-xs text-gray-500">{rep.batch_number}</div>}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap text-gray-700 border-r border-gray-200">
                      {rep.test_date ? new Date(rep.test_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="p-3 text-center border-r border-gray-200">
                      <span className="inline-block px-2.5 py-1 bg-red-50 text-[#E10600] font-black rounded-lg border border-red-200 text-base">
                        {rep.overall_band_score}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 border-r border-gray-200 whitespace-nowrap">
                      {rep.trainer_name}
                    </td>
                    <td className="p-3 text-center border-r border-gray-200">
                      {rep.email_status === 'Sent' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Sent
                        </span>
                      ) : rep.email_status === 'Failed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      ) : rep.email_status === 'No Email' ? (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                          No Email
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                          {rep.email_status || 'Pending'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewReport(rep.id)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors border border-blue-200"
                        >
                          View Report
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResendEmail(rep.id)}
                          disabled={!rep.student_email || isResending}
                          title={rep.student_email ? 'Resend Report Email' : 'No email address'}
                          className="p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg text-xs font-bold transition-colors border border-sky-200 disabled:opacity-40"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                      No IELTS Speaking reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REPORT VIEWER & PRINT / PDF MODAL */}
      {/* ========================================================================= */}
      {reportModal.isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-gray-300 relative overflow-hidden" style={{ opacity: 1, isolation: 'isolate' }}>
            
            {reportModal.isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading report document...</p>
              </div>
            ) : reportModal.data ? (
              <>
                {/* Modal Top Action Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#E10600]" />
                    <span className="font-bold text-gray-900">IELTS Speaking Score Report</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(reportModal.data)}
                      className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.print()
                      }}
                      className="px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportModal({ isOpen: false, data: null, isLoading: false })}
                      className="px-3 py-1.5 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Printable Document Body */}
                <div id="printable-ielts-report" className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white">
                  <style>{`
                    @media print {
                      body * { visibility: hidden; }
                      #printable-ielts-report, #printable-ielts-report * { visibility: visible; }
                      #printable-ielts-report { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; }
                    }
                  `}</style>

                  {/* Header */}
                  <div className="border-b-2 border-[#E10600] pb-4 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-3xl font-black text-[#E10600] tracking-wider uppercase">YES ACADEMY</h1>
                        <h2 className="text-xl font-bold text-slate-900 mt-1">IELTS SPEAKING SCORE REPORT</h2>
                        <p className="text-xs text-gray-500 font-semibold tracking-wide">STUDENT PERFORMANCE & CRITERIA EVALUATION</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-red-50 text-[#E10600] text-xs font-bold rounded-full border border-red-200">
                          Official Evaluation
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Information Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50/80 p-5 rounded-xl border border-gray-200 mb-6 text-sm">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Student Name</p>
                      <p className="font-bold text-gray-900 text-base">{reportModal.data.student_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Student Email</p>
                      <p className="font-medium text-gray-800 break-all">{reportModal.data.student_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Candidate / Batch</p>
                      <p className="font-semibold text-gray-800">
                        {[reportModal.data.candidate_number, reportModal.data.batch_number].filter(Boolean).join(' / ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Test Date</p>
                      <p className="font-semibold text-gray-800">
                        {reportModal.data.test_date ? new Date(reportModal.data.test_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Examiner / Faculty</p>
                      <p className="font-semibold text-gray-800">{reportModal.data.trainer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Student Type</p>
                      <p className="font-semibold text-gray-800">{reportModal.data.student_type || 'Inhouse'}</p>
                    </div>
                  </div>

                  {/* Assessment Criteria Table */}
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Assessment Criteria Evaluation
                  </h3>

                  <div className="overflow-x-auto w-full mb-6">
                    <table className="w-full text-left border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 border border-gray-300 font-bold text-gray-800 w-1/3">Area of Scoring</th>
                          <th className="p-3 border border-gray-300 font-bold text-center text-gray-700">Limited</th>
                          <th className="p-3 border border-gray-300 font-bold text-center text-gray-700">Moderate</th>
                          <th className="p-3 border border-gray-300 font-bold text-center text-gray-700">Good</th>
                          <th className="p-3 border border-gray-300 font-bold text-center text-gray-700">Excellent</th>
                        </tr>
                      </thead>
                      <tbody>
                        <ModalCriteriaRow
                          label="Fluency & Coherence"
                          selectedValue={reportModal.data.fluency_coherence}
                        />
                        <ModalCriteriaRow
                          label="Lexical Resources"
                          selectedValue={reportModal.data.lexical_resources}
                        />
                        <ModalCriteriaRow
                          label="Grammatical Range & Accuracy"
                          selectedValue={reportModal.data.grammatical_range}
                        />
                        <ModalCriteriaRow
                          label="Pronunciation"
                          selectedValue={reportModal.data.pronunciation}
                        />
                      </tbody>
                    </table>
                  </div>

                  {/* Overall Band Score Banner */}
                  <div className="bg-red-50/70 border-2 border-[#E10600] rounded-xl p-4 sm:p-5 mb-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Overall Band Score</span>
                      <span className="text-sm font-bold text-slate-900">IELTS Speaking Performance Level</span>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-black text-[#E10600]">{reportModal.data.overall_band_score}</span>
                      <span className="text-xs text-gray-500 font-bold block">/ 9.0</span>
                    </div>
                  </div>

                  {/* Feedback Sections */}
                  {reportModal.data.suggestions && (
                    <div className="mb-4 bg-white border border-gray-200 border-l-4 border-l-[#E10600] rounded-r-xl p-4">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Examiner Suggestions & Improvements:</h4>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{reportModal.data.suggestions}</p>
                    </div>
                  )}

                  {reportModal.data.additional_comments && (
                    <div className="mb-6 bg-white border border-gray-200 border-l-4 border-l-slate-800 rounded-r-xl p-4">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Additional Comments:</h4>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{reportModal.data.additional_comments}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                    <div>
                      <strong>YES ACADEMY</strong> &bull; Better English. Brighter Future.
                    </div>
                    <div>
                      Report Date: {new Date(reportModal.data.report_date || reportModal.data.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Status & Resend */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Email Delivery:</span>
                    {reportModal.data.email_status === 'Sent' ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Delivered</span>
                    ) : reportModal.data.email_status === 'Failed' ? (
                      <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">Delivery Failed</span>
                    ) : (
                      <span className="text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded">{reportModal.data.email_status || 'Pending'}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResendEmail(reportModal.data.id)}
                    disabled={!reportModal.data.student_email || isResending}
                    className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs disabled:opacity-40"
                  >
                    <Mail className="w-3.5 h-3.5" /> {isResending ? 'Sending...' : 'Resend Email'}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function CriteriaRow({
  title,
  description,
  value,
  onChange
}: {
  title: string
  description: string
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-white transition-colors">
      <div className="mb-3">
        <label className="block text-sm font-bold text-gray-900">{title} <span className="text-red-500">*</span></label>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {PERFORMANCE_LEVELS.map(lvl => {
          const isSelected = value === lvl.level
          return (
            <button
              key={lvl.level}
              type="button"
              onClick={() => onChange(lvl.level)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected ? lvl.active : `bg-white ${lvl.color}`
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-sm">{lvl.level}</span>
                {isSelected && <CheckCircle className="w-4 h-4 shrink-0" />}
              </div>
              <span className={`text-[11px] mt-1 line-clamp-1 ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                {lvl.desc}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ModalCriteriaRow({ label, selectedValue }: { label: string; selectedValue: string }) {
  const levels = ['Limited', 'Moderate', 'Good', 'Excellent']
  const sel = (selectedValue || '').toLowerCase()

  return (
    <tr>
      <td className="p-3 border border-gray-300 font-semibold text-gray-900">{label}</td>
      {levels.map(l => {
        const isMatch = sel === l.toLowerCase()
        return (
          <td
            key={l}
            className={`p-3 border border-gray-300 text-center text-xs ${
              isMatch
                ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-300'
                : 'text-gray-400'
            }`}
          >
            {isMatch ? `✓ ${l}` : '-'}
          </td>
        )
      })}
    </tr>
  )
}
