'use client'

import { useState } from 'react'
import { UserPlus, Calendar, CreditCard, Filter } from 'lucide-react'
import { createEnrollment } from './actions'

type EnrollmentClientProps = {
  students: any[]
  courses: any[]
  batches: any[]
  teachers: any[]
}

export default function EnrollmentClient({ students, courses, batches, teachers }: EnrollmentClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedTeacherForm, setSelectedTeacherForm] = useState('All')
  const [installmentCount, setInstallmentCount] = useState(0)

  const filteredFormBatches = batches.filter(b => {
    let match = true
    if (selectedCourse) match = match && b.course_id?.toString() === selectedCourse
    if (selectedTeacherForm !== 'All') match = match && b.teacher_id === selectedTeacherForm
    return match
  })

  const handleEnroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await createEnrollment(formData)
    
    if (res.success) {
      alert('Enrollment created successfully!')
      window.location.reload()
    } else {
      setError(res.message || 'Failed to enroll student')
      setIsSubmitting(false)
    }
  }

  // Calculate Alarm (3 days before due)
  const isAlarmActive = (dueDateStr: string, paidAmount: number, totalAmount: number) => {
    if (paidAmount >= totalAmount) return false
    const due = new Date(dueDateStr)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }

  return (
    <div className="space-y-6">
      {/* Enrollment Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" /> New Enrollment
        </h2>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleEnroll} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input type="text" name="student_name" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input type="text" name="mobile_number" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Number</label>
              <input type="text" name="guardian_number" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Filter (Optional)</label>
              <select name="course_id" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Filter (Optional)</label>
              <select value={selectedTeacherForm} onChange={e => setSelectedTeacherForm(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="All">All Teachers</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <select name="batch_id" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Select Batch...</option>
                {filteredFormBatches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Course Fee</label>
              <input type="number" name="course_fee" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Paid Amount</label>
              <input type="number" name="paid_amount" defaultValue="0" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select name="payment_method" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="Cash">Cash</option>
                <option value="bKash">bKash</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Installment Plan</label>
              <select 
                name="installment_count" 
                value={installmentCount} 
                onChange={e => setInstallmentCount(Number(e.target.value))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="0">No Installments (Full Payment)</option>
                <option value="1">1 Installment</option>
                <option value="2">2 Installments</option>
                <option value="3">3 Installments</option>
              </select>
            </div>
          </div>

          {/* Installments Config */}
          {installmentCount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Installment Schedule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: installmentCount }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Inst {i + 1} Amount</label>
                    <input type="number" name={`inst_amount_${i+1}`} required className="w-full text-sm border-gray-300 rounded focus:ring-blue-500" />
                    <label className="block text-xs font-medium text-gray-600">Inst {i + 1} Date</label>
                    <input type="date" name={`inst_date_${i+1}`} required className="w-full text-sm border-gray-300 rounded focus:ring-blue-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Complete Enrollment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
