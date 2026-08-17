'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWalkIn(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const student_name = formData.get('student_name') as string
  const phone = formData.get('phone') as string
  const interested_course = formData.get('interested_course') as string
  const summary = formData.get('summary') as string
  const lead_source = formData.get('lead_source') as string
  const lead_call_person = formData.get('lead_call_person') as string

  if (!student_name || !phone) {
    return { success: false, message: 'Name and Phone are required' }
  }

  const { error } = await supabase
    .from('walk_ins')
    .insert({
      student_name,
      phone,
      interested_course,
      summary,
      lead_source,
      lead_call_person
    })

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/walkins')
  return { success: true }
}
