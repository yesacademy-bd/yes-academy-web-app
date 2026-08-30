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

    const { data: batch } = await supabase.from('batches').select('*').eq('id', batchId).single()
    if (!batch) throw new Error('Batch not found')

    const totalClasses = batch.total_classes + batch.additional_classes
    const schedule = computeClassSchedule(batch.start_date, batch.schedule_days, batch.start_time, batch.end_time, totalClasses)
    
    const classWindow = schedule.find(s => s.class_number === session.class_number)
    if (!classWindow) throw new Error('Class window could not be computed')

    const now = new Date()
    const isOverrideActive = session.override_unlock_until && new Date(session.override_unlock_until) > now

    // Check if within window (with 15 minute grace period before/after)
    // Actually strictly sticking to exact window based on requirements
    const isWithinWindow = now >= classWindow.start_datetime && now <= classWindow.end_datetime

    if (!isWithinWindow && !isOverrideActive) {
      throw new Error(`Cannot modify attendance. This class is locked. Scheduled window was ${classWindow.start_datetime.toLocaleString()} to ${classWindow.end_datetime.toLocaleString()}`)
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
