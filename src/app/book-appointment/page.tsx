'use client'

import { useState } from 'react'
import { Check, Calendar, Clock, User, Phone, BookOpen, Globe, MessageSquare, AlertCircle, Loader2 } from 'lucide-react'
import { submitAppointment } from '@/app/actions/appointment'

type ServiceType = 'Admission Information' | 'Teacher Assessment'

export default function BookAppointmentPage() {
  const [serviceType, setServiceType] = useState<ServiceType>('Admission Information')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const rawData = Object.fromEntries(formData)
    
    const appointmentDate = rawData.appointmentDate as string
    const appointmentTime = rawData.appointmentTime as string
    const previousScore = rawData.previousScore as string

    const newData = {
      ...rawData,
      serviceType
    }

    if (serviceType === 'Admission Information' && previousScore) {
      if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(previousScore)) {
        setError('Previous score must be a valid number')
        return
      }
    }

    const [timeHour, timeMin] = appointmentTime.split(':').map(Number)
    if (timeHour < 10 || timeHour > 19 || (timeHour === 19 && timeMin > 0)) {
      setError('Please select a time between 10:00 AM and 07:00 PM.')
      return
    }

    const dateObj = new Date(appointmentDate)
    if (dateObj.getDay() === 5) {
      setError('Appointments are not available on Fridays. Please select another day.')
      return
    }

    setIsSubmitting(true)
    const result = await submitAppointment(newData)
    setIsSubmitting(false)

    if (result.success) {
      setSuccess(true)
      window.scrollTo(0, 0)
    } else {
      setError(result.message)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center border border-white/20">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Appointment Confirmed!</h2>
          <p className="text-white/80 mb-8">
            Thank you for booking with YES Academy. We have received your request and will see you at the scheduled time.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-md font-medium w-full hover:opacity-90 transition-opacity"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="pt-12 pb-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-blue-200 tracking-tight">
          YES Academy
        </h1>
        <p className="text-lg text-white/80 bg-black/10 inline-block px-4 py-1 rounded-full mt-4">
          Book Your Appointment
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex border-b border-white/10">
            <button
              type="button"
              onClick={() => setServiceType('Admission Information')}
              className={`${serviceType === 'Admission Information' ? 'bg-white/20 border-b-2 border-blue-400 text-blue-200' : 'text-white/70 hover:bg-white/5'} flex-1 py-4 px-4 text-center font-semibold transition-all`}
            >
              Admission Info
            </button>
            <button
              type="button"
              onClick={() => setServiceType('Teacher Assessment')}
              className={`${serviceType === 'Teacher Assessment' ? 'bg-white/20 border-b-2 border-blue-400 text-blue-200' : 'text-white/70 hover:bg-white/5'} flex-1 py-4 px-4 text-center font-semibold transition-all`}
            >
              Teacher Assessment
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 px-4 py-3 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-white/40" />
                    </div>
                    <input type="text" name="name" required className="w-full pl-10 py-2.5 bg-black/20 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-blue-400" placeholder="John Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-white/40" />
                    </div>
                    <input type="tel" name="mobile" required className="w-full pl-10 py-2.5 bg-black/20 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-blue-400" placeholder="01710000000" />
                  </div>
                </div>
              </div>

              {serviceType === 'Admission Information' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Last Education *</label>
                      <input type="text" name="lastEducation" required className="w-full py-2.5 px-3 bg-black/20 border border-white/10 text-white rounded-md focus:ring-2 focus:ring-blue-400" placeholder="e.g. H.S.C. / B.B.A" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Passing Year *</label>
                      <input type="number" name="passingYear" required min="1900" max="2100" className="w-full py-2.5 px-3 bg-black/20 border border-white/10 text-white rounded-md focus:ring-2 focus:ring-blue-400" placeholder="2024" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Interested Course *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BookOpen className="h-5 w-5 text-white/40" />
                        </div>
                        <select name="interestedCourse" required className="w-full pl-10 py-2.5 px-3 bg-gray-800 border border-white/10 text-white rounded-md focus:ring-2 focus:ring-blue-400">
                          <option value="">Select Course</option>
                          <option value="IELTS">IELTS</option>
                          <option value="PTE">PTE</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Intended Country <span className="text-white/50">(Optional)</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-white/40" />
                        </div>
                        <input type="text" name="intendedCountry" className="w-full pl-10 py-2.5 px-3 bg-black/20 border border-white/10 text-white rounded-md focus:ring-2 focus:ring-blue-400" placeholder="e.g. Australia, UK" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Previous IELTS/PTE Score <span className="text-white/50">(Optional)</span></label>
                    <input type="number" step="0.5" name="previousScore" className="w-full py-2.5 px-3 bg-black/20 border border-white/10 text-white rounded-md focus:ring-2 focus:ring-blue-400" placeholder="e.g. 6.5 or 65" />
                  </div>
                </>
              )}

              {serviceType === 'Teacher Assessment' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Student Type *</label>
                      <select name="studentType" required className="w-full py-2.5 px-3 bg-gray-800 border border-white/10 text-white rounded-md focus:ring-2 focus:ring-blue-400">
                        <option value="">Select Type</option>
                        <option value="In-house">In-house</option>
                        <option value="External">External</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Batch Number <span className="text-white/50">(If In-house)</span></label>
                      <input type="text" name="batchNumber" className="w-full py-2.5 px-3 bg-black/20 border border-white/10 text-white rounded-md focus:ring-2 focus:ring-blue-400" placeholder="e.g. PTE 164" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Course Teacher <span className="text-white/50">(If In-house)</span></label>
                      <input type="text" name="courseTeacher" className="w-full py-2.5 px-3 bg-black/20 border border-white/10 text-white rounded-md focus:ring-2 focus:ring-blue-400" placeholder="Teacher Name" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Problem Description <span className="text-white/50">(Optional)</span></label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-white/40" />
                      </div>
                      <textarea name="problemDescription" rows={3} className="w-full pl-10 py-2.5 px-3 bg-black/20 border border-white/10 text-white rounded-md focus:ring-2 focus:ring-blue-400" placeholder="Briefly describe your issue..."></textarea>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Appointment Date *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-white/40" />
                    </div>
                    <input type="date" name="appointmentDate" required min={new Date().toISOString().split('T')[0]} className="w-full pl-10 py-2.5 px-3 bg-black/20 border border-white/10 text-white rounded-md [color-scheme:dark] focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <p className="text-xs text-white/50 mt-1">Available: Saturday - Thursday</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Appointment Time *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-white/40" />
                    </div>
                    <input type="time" name="appointmentTime" required min="10:00" max="19:00" className="w-full pl-10 py-2.5 px-3 bg-black/20 border border-white/10 text-white rounded-md [color-scheme:dark] focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <p className="text-xs text-white/50 mt-1">Available: 10:00 AM - 07:00 PM</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? ( <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> ) : ( "Confirm Appointment" )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
