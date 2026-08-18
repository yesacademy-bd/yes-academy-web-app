'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRegistration(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const student_name = formData.get('student_name') as string
  const phone = formData.get('phone') as string
  const exam_type = formData.get('exam_type') as string
  const amount = parseFloat(formData.get('amount') as string) || 0
  const paid_amount = parseFloat(formData.get('paid_amount') as string) || 0
  const payment_method = formData.get('payment_method') as string
  const exam_date = formData.get('exam_date') as string

  if (!student_name || !phone || !exam_type) {
    return { success: false, message: 'Name, Phone, and Exam Type are required' }
  }

  const { error } = await supabase
    .from('registrations')
    .insert({
      student_name,
      phone,
      exam_type,
      registration_fee: amount,
      paid_amount,
      payment_method,
      exam_date
    })

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/registrations')
  return { success: true }
}
