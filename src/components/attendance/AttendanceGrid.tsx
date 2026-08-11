'use client'

import { useState, useTransition } from 'react'
import { markAttendance, createClassSession, unlockClassSession } from '@/app/actions/attendance'
import { computeClassSchedule } from '@/utils/schedule'
import { Check, X, Minus, Plus, Loader2, Lock, Unlock } from 'lucide-react'

export default function AttendanceGrid({
  batch,
  students,
  initialSessions,
  initialRecords,
  userRole
}: {
  batch: any
  students: any[]
  initialSessions: any[]
  initialRecords: any[]
  userRole: string
}) {
  const [sessions, setSessions] = useState(initialSessions)
  const [records, setRecords] = useState(initialRecords)
  const [isPending, startTransition] = useTransition()
  
  const totalClasses = batch.total_classes + batch.additional_classes
  const classNumbers = Array.from({ length: totalClasses }, (_, i) => i + 1)
  
  const [activeClassNum, setActiveClassNum] = useState<number | null>(
    sessions.length > 0 ? Math.max(...sessions.map(s => s.class_number)) : 1
  )

  const handleMarkAttendance = async (studentId: string, classNum: number, status: 'Present' | 'Absent' | 'Leave') => {
    // 1. Ensure class session exists
    let session = sessions.find(s => s.class_number === classNum)
    if (!session) {
      // Optimistically create session
      const tempId = `temp-${Date.now()}`
      session = { id: tempId, batch_id: batch.id, class_number: classNum, session_date: new Date().toISOString().split('T')[0] }
      setSessions([...sessions, session])
      
      const res = await createClassSession(batch.id, classNum, session.session_date)
      if (res.success && res.data) {
        session = res.data
        setSessions(prev => prev.map(s => s.class_number === classNum ? session! : s))
      } else {
        alert("Failed to create class session")
        return
      }
    }

    // 2. Optimistic update for record
    const recordIndex = records.findIndex(r => r.student_id === studentId && r.class_session_id === session!.id)
    const newRecord = { 
      id: recordIndex >= 0 ? records[recordIndex].id : `temp-rec-${Date.now()}`,
      student_id: studentId,
      class_session_id: session!.id,
      status
    }
    
    if (recordIndex >= 0) {
      const newRecords = [...records]
      newRecords[recordIndex] = newRecord
      setRecords(newRecords)
    } else {
      setRecords([...records, newRecord])
    }

    // 3. Server action
    startTransition(async () => {
      const result = await markAttendance(batch.id, session!.id, studentId, status)
      if (!result.success) {
        alert(result.message)
        // Rollback optimistic update
        setRecords(records) 
      }
    })
  }

  // Calculate attendance % per student
  const getStudentStats = (studentId: string) => {
    const studentRecords = records.filter(r => r.student_id === studentId)
    const present = studentRecords.filter(r => r.status === 'Present').length
    const total = studentRecords.length
    return {
      present,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    }
  }

  const schedule = computeClassSchedule(batch.start_date, batch.schedule_days, batch.start_time, batch.end_time, totalClasses)

  const getClassState = (classNum: number) => {
    const classWindow = schedule.find(s => s.class_number === classNum)
    if (!classWindow) return { locked: true, reason: 'No schedule' }
    
    const session = sessions.find(s => s.class_number === classNum)
    const now = new Date()
    const isOverrideActive = session?.override_unlock_until && new Date(session.override_unlock_until) > now
    
    if (now < classWindow.start_datetime) return { locked: true, reason: 'Upcoming' }
    if (now >= classWindow.start_datetime && now <= classWindow.end_datetime) return { locked: false, reason: 'In Progress' }
    if (isOverrideActive) return { locked: false, reason: 'Unlocked by HR' }
    return { locked: true, reason: 'Completed & Locked' }
  }

  const handleUnlock = async () => {
    if (!activeClassNum) return
    const session = sessions.find(s => s.class_number === activeClassNum)
    if (!session) {
      alert('Cannot unlock a session that has not started yet!')
      return
    }
    startTransition(async () => {
      const res = await unlockClassSession(batch.id, session.id, 60)
      if (res.success) {
        // Optimistic refresh
        setSessions(sessions.map(s => s.id === session.id ? { ...s, override_unlock_until: new Date(Date.now() + 60*60*1000).toISOString() } : s))
      } else {
        alert(res.message)
      }
    })
  }

  const activeClassState = activeClassNum ? getClassState(activeClassNum) : { locked: true, reason: 'Unknown' }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Mobile-first class selector */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2">
          {classNumbers.map(num => (
            <button
              key={num}
              onClick={() => setActiveClassNum(num)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeClassNum === num 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : sessions.some(s => s.class_number === num)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Class {num}
            </button>
          ))}
        </div>
      </div>

        {activeClassNum && (
          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">Class {activeClassNum} Attendance</h3>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                {activeClassState.locked ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                {activeClassState.reason} 
                {schedule.find(s => s.class_number === activeClassNum)?.date}
              </p>
            </div>
            {activeClassState.locked && ['HR', 'Admin'].includes(userRole) && (
              <button 
                onClick={handleUnlock}
                disabled={isPending}
                className="px-3 py-1.5 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Unlock className="w-4 h-4" /> Unlock (1hr)
              </button>
            )}
          </div>
        )}

      <div className="divide-y divide-gray-100">
        {activeClassNum === null ? (
          <div className="p-12 text-center text-gray-500">
            Select a class above to mark attendance.
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No students enrolled in this batch yet.
          </div>
        ) : (
          students.map(student => {
            const session = sessions.find(s => s.class_number === activeClassNum)
            const record = session ? records.find(r => r.student_id === student.id && r.class_session_id === session.id) : null
            const currentStatus = record?.status
            const stats = getStudentStats(student.id)

            return (
              <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900">{student.name}</h4>
                  <p className="text-xs text-gray-500">
                    Phone: {student.phone} | Attn: {stats.percentage}% ({stats.present}/{stats.total})
                  </p>
                </div>
                
                <div className={`flex items-center gap-2 ${activeClassState.locked ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button 
                    onClick={() => handleMarkAttendance(student.id, activeClassNum, 'Present')}
                    disabled={activeClassState.locked}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${currentStatus === 'Present' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                  >
                    <Check className="w-4 h-4" /> Present
                  </button>
                  <button 
                    onClick={() => handleMarkAttendance(student.id, activeClassNum, 'Absent')}
                    disabled={activeClassState.locked}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${currentStatus === 'Absent' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                  >
                    <X className="w-4 h-4" /> Absent
                  </button>
                  <button 
                    onClick={() => handleMarkAttendance(student.id, activeClassNum, 'Leave')}
                    disabled={activeClassState.locked}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${currentStatus === 'Leave' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                  >
                    <Minus className="w-4 h-4" /> Leave
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
      
      {isPending && (
        <div className="p-2 bg-blue-50 text-blue-600 text-xs font-medium text-center flex justify-center items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Saving changes...
        </div>
      )}
    </div>
  )
}
