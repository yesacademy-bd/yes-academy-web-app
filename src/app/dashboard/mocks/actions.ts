'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMockService(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const student_name = formData.get('student_name') as string
  const phone = formData.get('phone') as string
  const mock_type = formData.get('mock_type') as string
  const amount = parseFloat(formData.get('amount') as string) || 0
  const paid_amount = parseFloat(formData.get('paid_amount') as string) || 0
  const payment_method = formData.get('payment_method') as string

  if (!student_name || !phone || !mock_type) {
    return { success: false, message: 'Name, Phone, and Mock Type are required' }
  }

  const { error } = await supabase
    .from('mock_services')
    .insert({
      student_name,
      phone,
      mock_type,
      amount,
      paid_amount,
      payment_method
    })

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/mocks')
  return { success: true }
}
