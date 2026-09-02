'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { computeClassSchedule } from '@/utils/schedule'

export async function markAttendance(
  batchId: string, 
  classSessionId: string, 
  studentId: string, 
  status: 'Present' | 'Absent' | 'Leave'
) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Fetch session and batch to validate time window
    const { data: session } = await supabase.from('class_sessions').select('*').eq('id', classSessionId).single()
    if (!session) throw new Error('Session not found')

    // Fetch batch-level unlock (-1 row)
    const { data: batchSession } = await supabase.from('class_sessions').select('*').eq('batch_id', batchId).eq('class_number', -1).maybeSingle()

    const { data: batch } = await supabase.from('batches').select('*').eq('id', batchId).single()
    if (!batch) throw new Error('Batch not found')

    const now = Date.now()
    const isSessionOverrideActive = session.override_unlock_until && new Date(session.override_unlock_until).getTime() > now
    const isBatchOverrideActive = batchSession?.override_unlock_until && new Date(batchSession.override_unlock_until).getTime() > now
    const isOverrideActive = isSessionOverrideActive || isBatchOverrideActive

    // Only compute and validate time window if there is no active HR override
    if (!isOverrideActive) {
      // 1. Timezone-aware current time
      const tzDateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
      const nowDhaka = new Date(tzDateStr)
      const todayDateStr = `${nowDhaka.getFullYear()}-${String(nowDhaka.getMonth() + 1).padStart(2, '0')}-${String(nowDhaka.getDate()).padStart(2, '0')}`

      // 2. Fetch all real sessions to determine N+1
      const { data: allSessions } = await supabase.from('class_sessions')
        .select('class_number, session_date')
        .eq('batch_id', batchId)
        .gt('class_number', 0)
      
      const sessionsArr = allSessions || []
      const sessionToday = sessionsArr.find(s => s.session_date === todayDateStr)
      const highestCompleted = sessionsArr.length > 0 ? Math.max(...sessionsArr.map(s => s.class_number)) : 0
      const allowedClassNum = sessionToday ? sessionToday.class_number : highestCompleted + 1

      if (session.class_number > allowedClassNum) {
        throw new Error(`Attendance is locked. You cannot mark a future class. (Expected Class ${allowedClassNum})`)
      }
      if (session.class_number < allowedClassNum) {
        throw new Error('Attendance is locked. This is a previous class that can no longer be modified without HR override.')
      }

      // 3. Holiday Validation
      const { data: holidays } = await supabase.from('holidays').select('holiday_date')
      const holidayDates = holidays?.map(h => h.holiday_date) || []
      if (holidayDates.includes(todayDateStr)) {
        throw new Error('Attendance is locked. Today is a holiday.')
      }

      // 4. Scheduled Day Validation
      const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const todayName = DAYS_OF_WEEK[nowDhaka.getDay()]
      if (!batch.schedule_days.includes(todayName)) {
        throw new Error('Attendance is locked. Today is not a scheduled class day for this batch.')
      }

      // 5. Scheduled Time Validation
      const [startHour, startMin] = batch.start_time.split(':').map(Number)
      const [endHour, endMin] = batch.end_time.split(':').map(Number)
      
      const startDatetime = new Date(nowDhaka.getFullYear(), nowDhaka.getMonth(), nowDhaka.getDate(), startHour, startMin, 0)
      const endDatetime = new Date(nowDhaka.getFullYear(), nowDhaka.getMonth(), nowDhaka.getDate(), endHour, endMin, 0)
      
      if (nowDhaka < startDatetime) {
        throw new Error('Attendance is locked. The class has not started yet.')
      }
      
      if (nowDhaka > endDatetime) {
        throw new Error('Attendance is locked. The scheduled class time has ended.')
      }
    }

    // Upsert the attendance record
    const { error } = await supabase
      .from('attendance_records')
      .upsert({
        class_session_id: classSessionId,
        student_id: studentId,
        status: status,
        marked_by_user_id: user.id,
        marked_at: new Date().toISOString()
      }, {
        onConflict: 'class_session_id, student_id'
      })

    if (error) throw new Error(error.message)

    // Log the action
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action_type: 'MARK_ATTENDANCE',
      batch_id: batchId,
      student_id: studentId,
      detail: { status, class_session_id: classSessionId }
    })

    revalidatePath(`/dashboard/faculty/batches/${batchId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to mark attendance' }
  }
}

export async function createClassSession(batchId: string, classNumber: number, sessionDate: string) {
  const supabase = await createClient()

  try {
    // 1. Validate N+1 constraint before creating
    const tzDateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
    const nowDhaka = new Date(tzDateStr)
    const todayDateStr = `${nowDhaka.getFullYear()}-${String(nowDhaka.getMonth() + 1).padStart(2, '0')}-${String(nowDhaka.getDate()).padStart(2, '0')}`

    const { data: allSessions } = await supabase.from('class_sessions')
      .select('class_number, session_date')
      .eq('batch_id', batchId)
      .gt('class_number', 0)
    
    const sessionsArr = allSessions || []
    const sessionToday = sessionsArr.find(s => s.session_date === todayDateStr)
    const highestCompleted = sessionsArr.length > 0 ? Math.max(...sessionsArr.map(s => s.class_number)) : 0
    const allowedClassNum = sessionToday ? sessionToday.class_number : highestCompleted + 1

    if (classNumber > allowedClassNum) {
      throw new Error(`Cannot create future class session. Expected Class ${allowedClassNum}`)
    }

    const { data, error } = await supabase
      .from('class_sessions')
      .insert({
        batch_id: batchId,
        class_number: classNumber,
        session_date: sessionDate
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        // Session already exists, fetch it
        const { data: existing } = await supabase
          .from('class_sessions')
          .select('*')
          .eq('batch_id', batchId)
          .eq('class_number', classNumber)
          .single()
        return { success: true, data: existing }
      }
      throw new Error(error.message)
    }

    revalidatePath(`/dashboard/faculty/batches/${batchId}`)
    return { success: true, data }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create session' }
  }
}

export async function unlockClassSession(batchId: string, classNum: number, durationMinutes: number = 60) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify HR/Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!['HR', 'Admin', 'BDM'].includes(profile?.role || '')) {
      throw new Error('Only HR or Admin can unlock sessions')
    }

    const { data: batch } = await supabase.from('batches').select('*').eq('id', batchId).single()
    if (!batch) throw new Error('Batch not found')

    let sessionDate = new Date().toISOString().split('T')[0]
    if (batch.start_date) {
      const totalClasses = batch.total_classes + batch.additional_classes
      const schedule = computeClassSchedule(batch.start_date, batch.schedule_days, batch.start_time, batch.end_time, totalClasses)
      sessionDate = schedule.find(s => s.class_number === classNum)?.date || sessionDate
    }

    const unlockUntil = new Date()
    unlockUntil.setMinutes(unlockUntil.getMinutes() + durationMinutes)

    const { error } = await supabase
      .from('class_sessions')
      .upsert({
        batch_id: batchId,
        class_number: classNum,
        session_date: sessionDate,
        override_unlock_until: unlockUntil.toISOString()
      }, { onConflict: 'batch_id,class_number' })

    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard/faculty/batches/${batchId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to unlock session' }
  }
}

export async function unlockEntireBatch(batchId: string, durationMinutes: number = 60) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify HR/Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!['HR', 'Admin', 'BDM'].includes(profile?.role || '')) {
      throw new Error('Only HR or Admin can unlock sessions')
    }

    const unlockUntil = new Date()
    unlockUntil.setMinutes(unlockUntil.getMinutes() + durationMinutes)

    const todayDateStr = new Date().toISOString().split('T')[0]

    // Create a dummy batch-level session row (-1) to represent the batch unlock
    const { error } = await supabase
      .from('class_sessions')
      .upsert({
        batch_id: batchId,
        class_number: -1,
        session_date: todayDateStr,
        override_unlock_until: unlockUntil.toISOString()
      }, { onConflict: 'batch_id,class_number' })

    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard/faculty/batches/${batchId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to unlock batch' }
  }
}

export async function unlockAllActiveBatches(durationMinutes: number = 60) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify HR/Admin/BDM
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!['HR', 'Admin', 'BDM'].includes(profile?.role || '')) {
      throw new Error('Only HR or Admin can unlock sessions')
    }

    const unlockUntil = new Date()
    unlockUntil.setMinutes(unlockUntil.getMinutes() + durationMinutes)
    const todayDateStr = new Date().toISOString().split('T')[0]

    const { data: activeBatches } = await supabase.from('batches').select('id').eq('status', 'Active')
    if (!activeBatches || activeBatches.length === 0) return { success: true }
    
    // Bulk upsert dummy -1 class_number rows for ALL active batches
    const bulkUpsertPayload = activeBatches.map(b => ({
      batch_id: b.id,
      class_number: -1,
      session_date: todayDateStr,
      override_unlock_until: unlockUntil.toISOString()
    }))

    const { error } = await supabase
      .from('class_sessions')
      .upsert(bulkUpsertPayload, { onConflict: 'batch_id,class_number' })

    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard`)
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to unlock batches' }
  }
}
