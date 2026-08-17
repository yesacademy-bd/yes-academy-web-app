'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEnrollment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const name = formData.get('student_name') as string
  const phone = formData.get('mobile_number') as string
  const guardian_phone = formData.get('guardian_number') as string

  const course_id = formData.get('course_id') as string
  const batch_id = formData.get('batch_id') as string
  const course_fee = parseFloat(formData.get('course_fee') as string) || 0
  const paid_amount = parseFloat(formData.get('paid_amount') as string) || 0
  const payment_method = formData.get('payment_method') as string
  const installment_count = parseInt(formData.get('installment_count') as string) || 0

  if (!name || !phone || !batch_id) {
    return { success: false, message: 'Missing required fields' }
  }

  // Check if student exists
  let student_id = ''
  const { data: existingStudent } = await supabase
    .from('students')
    .select('id')
    .eq('phone', phone)
    .single()

  if (existingStudent) {
    student_id = existingStudent.id
  } else {
    const { data: newStudent, error: createError } = await supabase
      .from('students')
      .insert({ name, phone, guardian_phone })
      .select('id')
      .single()
    if (createError) return { success: false, message: 'Failed to create student: ' + createError.message }
    student_id = newStudent.id
  }

  // 1. Create Enrollment
  const { data: enrollment, error: enrollError } = await supabase
    .from('enrollments')
    .insert({
      student_id,
      batch_id,
      course_fee,
      paid_amount,
      payment_method
    })
    .select('id')
    .single()

  if (enrollError) {
    if (enrollError.code === '23505') return { success: false, message: 'Student is already enrolled in this batch' }
    return { success: false, message: enrollError.message }
  }

  // 2. Create Installments if applicable
  if (installment_count > 0 && enrollment) {
    const installments = []
    for (let i = 1; i <= installment_count; i++) {
      const amount = parseFloat(formData.get(`inst_amount_${i}`) as string) || 0
      const due_date = formData.get(`inst_date_${i}`) as string
      
      if (amount > 0 && due_date) {
        installments.push({
          enrollment_id: enrollment.id,
          student_id,
          installment_number: i,
          amount,
          due_date,
          status: 'Due'
        })
      }
    }

    if (installments.length > 0) {
      const { error: instError } = await supabase.from('installments').insert(installments)
      if (instError) {
        console.error('Installments Error:', instError.message)
      }
    }
  }

  revalidatePath('/dashboard/enrollments')
  return { success: true }
}
