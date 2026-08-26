'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWalkIn(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const student_name = formData.get('student_name') as string
  const phone = formData.get('phone') as string
  const interested_course = formData.get('interested_course') as string
  const summary = formData.get('summary') as string
  const lead_source = formData.get('lead_source') as string
  const lead_call_person = formData.get('lead_call_person') as string
  const last_qualification = formData.get('last_qualification') as string
  const last_qualification_year = formData.get('last_qualification_year') as string
  const cgpa = formData.get('cgpa') as string
  const interested_country = formData.get('interested_country') as string
  const interested_intake = formData.get('interested_intake') as string

  if (!student_name || !phone) {
    return { success: false, message: 'Name and Phone are required' }
  }

  const { error } = await supabase
    .from('walk_ins')
    .insert({
      date: new Date().toISOString().split('T')[0],
      student_name,
      phone,
      interested_course,
      summary,
      source: lead_source,
      lead_call_person,
      last_qualification,
      last_qualification_year,
      cgpa,
      interested_country,
      interested_intake
    })

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/walkins')
  return { success: true }
}

export async function deleteWalkIn(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const { error } = await supabase
    .from('walk_ins')
    .delete()
    .eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/walkins')
  return { success: true }
}
