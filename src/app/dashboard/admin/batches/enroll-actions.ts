'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enrollStudent(batchId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const system_id = formData.get('system_id') as string || null
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const guardian_phone = formData.get('guardian_phone') as string
  const reference = formData.get('reference') as string
  const course_fee = parseFloat(formData.get('course_fee') as string) || 0
  const paid_amount = parseFloat(formData.get('paid_amount') as string) || 0

  if (!name) return { success: false, message: 'Student Name is required' }

  // 1. Find or create student
  let studentId: string | null = null
  if (system_id) {
    const { data: existingStudent } = await supabase.from('students').select('id').eq('system_id', system_id).single()
    if (existingStudent) {
      studentId = existingStudent.id
    }
  }

  if (!studentId) {
    const { data: newStudent, error: createError } = await supabase
      .from('students')
      .insert({ system_id: system_id, name, phone, guardian_phone })
      .select('id')
      .single()
    if (createError) return { success: false, message: createError.message }
    studentId = newStudent.id
  }

  // 2. Insert enrollment
  if (!studentId) return { success: false, message: 'Failed to resolve student' }
  const { error: enrollError } = await supabase
    .from('enrollments')
    .insert({ 
      batch_id: batchId, 
      student_id: studentId,
      course_fee,
      paid_amount,
      reference 
    })

  if (enrollError) {
    if (enrollError.code === '23505') return { success: false, message: 'Student is already enrolled in this batch' }
    return { success: false, message: enrollError.message }
  }

  revalidatePath(`/dashboard/admin/batches/${batchId}`)
  return { success: true, message: 'Student enrolled successfully' }
}

export async function removeEnrollment(batchId: string, studentId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const { error } = await supabase
    .from('enrollments')
    .delete()
    .match({ batch_id: batchId, student_id: studentId })

  if (error) return { success: false, message: error.message }

  revalidatePath(`/dashboard/admin/batches/${batchId}`)
  return { success: true, message: 'Student removed from batch' }
}

export async function updatePortalAssigned(enrollmentId: string, assigned: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) return { success: false }
  
  const { error } = await supabase.from('enrollments').update({ portal_assigned: assigned }).eq('id', enrollmentId)
  if (error) return { success: false, message: error.message }
  return { success: true }
}