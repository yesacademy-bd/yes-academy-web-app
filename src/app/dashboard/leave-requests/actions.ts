'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitLeaveRequest(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const employee_name = formData.get('employee_name') as string
  const department = formData.get('department') as string
  const job_title = formData.get('job_title') as string
  const staff_id = formData.get('staff_id') as string
  const leave_type = formData.get('leave_type') as string
  const starting_on = formData.get('starting_on') as string
  const ending_on = formData.get('ending_on') as string
  const start_time = formData.get('start_time') as string
  const end_time = formData.get('end_time') as string
  const reason = formData.get('reason') as string
  const other_reason = formData.get('other_reason') as string
  const explanation = formData.get('explanation') as string
  const employee_signature = formData.get('employee_signature') as string
  
  const todayDate = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase.from('leave_requests').insert({
    user_id: user.id,
    employee_name,
    department,
    job_title,
    staff_id,
    leave_type,
    starting_on,
    ending_on,
    start_time: start_time || null,
    end_time: end_time || null,
    reason,
    other_reason,
    explanation,
    employee_signature,
    employee_signature_date: todayDate,
    status: 'Pending'
  }).select().single()

  if (error) {
    console.error('Error submitting leave request:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/leave-requests')
  return { success: true, id: data.id }
}

export async function processLeaveDecision(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const decision = formData.get('decision') as string
  const payment_status = formData.get('payment_status') as string
  const manager_notes = formData.get('manager_notes') as string
  const manager_signature = formData.get('manager_signature') as string
  const hob_signature = formData.get('hob_signature') as string
  
  const todayDate = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('leave_requests').update({
    status: decision,
    payment_status: payment_status || null,
    manager_notes,
    manager_signature,
    hob_signature,
    decision_date: todayDate
  }).eq('id', id)

  if (error) {
    console.error('Error processing leave request:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/leave-requests')
  revalidatePath(`/dashboard/leave-requests/${id}`)
  return { success: true }
}

