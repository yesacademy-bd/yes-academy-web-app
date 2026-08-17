'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDuePayment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const id = formData.get('id') as string
  const type = formData.get('type') as string
  const payAmount = parseFloat(formData.get('pay_amount') as string) || 0

  if (!id || !type || payAmount <= 0) {
    return { success: false, message: 'Invalid payment details' }
  }

  let table = ''
  if (type === 'Enrollment') table = 'enrollments'
  else if (type === 'Mock Service') table = 'mock_services'
  else if (type === 'Registration') table = 'registrations'

  if (!table) return { success: false, message: 'Invalid record type' }

  // Get current record
  const { data: record, error: fetchErr } = await supabase
    .from(table)
    .select('paid_amount, due_amount')
    .eq('id', id)
    .single()

  if (fetchErr || !record) return { success: false, message: 'Record not found' }

  if (payAmount > record.due_amount) {
    return { success: false, message: 'Payment cannot exceed due amount' }
  }

  const newPaidAmount = record.paid_amount + payAmount

  const { error: updateErr } = await supabase
    .from(table)
    .update({ paid_amount: newPaidAmount })
    .eq('id', id)

  if (updateErr) return { success: false, message: updateErr.message }

  revalidatePath('/dashboard/dues')
  revalidatePath('/dashboard/crm')
  return { success: true }
}
