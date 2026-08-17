'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createExpense(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const amount = parseFloat(formData.get('amount') as string) || 0
  const date = formData.get('date') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string

  if (amount <= 0 || !date || !category) {
    return { success: false, message: 'Missing required fields' }
  }

  const { error } = await supabase
    .from('expenses')
    .insert({
      amount,
      date,
      category,
      description
    })

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/expenses')
  return { success: true }
}
