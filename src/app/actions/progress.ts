'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStudentProgress(enrollmentId: string, batchId: string, field: string, value: number | null) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Fetch batch to verify access
    const { data: batch } = await supabase.from('batches').select('teacher_id, monitor_teacher_id').eq('id', batchId).single()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    const isAuthorized = profile?.role === 'Admin' || profile?.role === 'HR' || batch?.teacher_id === user.id || batch?.monitor_teacher_id === user.id
    if (!isAuthorized) throw new Error('Not authorized to update student progress')

    // Allowed fields to prevent injection
    const allowedFields = ['speaking', 'writing', 'reading', 'listening', 'weekly_practice_hours', 'mock_test_score']
    if (!allowedFields.includes(field)) throw new Error('Invalid field')

    // Check if record exists
    const { data: existing } = await supabase.from('exam_scores').select('id').eq('enrollment_id', enrollmentId).single()

    if (existing) {
      const { error } = await supabase
        .from('exam_scores')
        .update({ [field]: value })
        .eq('id', existing.id)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabase
        .from('exam_scores')
        .insert({
          enrollment_id: enrollmentId,
          [field]: value
        })
      if (error) throw new Error(error.message)
    }

    revalidatePath(`/dashboard/faculty/batches/${batchId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update progress' }
  }
}
