'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitTeacherReport(data: {
  batch_id: string
  report_date: string
  last_class_summary: string
  todays_lessons: string
  class_tests: string
  homework: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  // Check if report already exists for this date and batch
  const { data: existing } = await supabase
    .from('teacher_reports')
    .select('id, status')
    .eq('batch_id', data.batch_id)
    .eq('report_date', data.report_date)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('teacher_reports')
      .update({
        last_class_summary: data.last_class_summary,
        todays_lessons: data.todays_lessons,
        class_tests: data.class_tests,
        homework: data.homework,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (error) return { success: false, message: error.message }
  } else {
    // Insert new
    const { error } = await supabase
      .from('teacher_reports')
      .insert({
        batch_id: data.batch_id,
        teacher_id: user.id,
        report_date: data.report_date,
        last_class_summary: data.last_class_summary,
        todays_lessons: data.todays_lessons,
        class_tests: data.class_tests,
        homework: data.homework,
        status: 'Awaiting Approval'
      })

    if (error) return { success: false, message: error.message }
  }

  revalidatePath('/dashboard/faculty/reports')
  revalidatePath('/dashboard/hr/reports')
  return { success: true }
}

export async function submitBDMFeedback(report_id: string, feedback: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) {
    return { success: false, message: 'Forbidden' }
  }

  const { error } = await supabase
    .from('teacher_reports')
    .update({
      bdm_feedback: feedback,
      status: 'Completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', report_id)

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/faculty/reports')
  revalidatePath('/dashboard/hr/reports')
  return { success: true }
}

export async function getTeacherReportsByDate(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: [] }

  const { data, error } = await supabase
    .from('teacher_reports')
    .select('*')
    .eq('teacher_id', user.id)
    .eq('report_date', date)

  if (error) return { success: false, data: [] }
  return { success: true, data }
}

export async function getReportsForBDM(date: string, teacherId: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: [] }

  let query = supabase
    .from('teacher_reports')
    .select(`
      *,
      batches ( batch_name, start_time, end_time, courses ( name ) ),
      profiles!teacher_reports_teacher_id_fkey ( display_name )
    `)
    .eq('report_date', date)

  if (teacherId) {
    query = query.eq('teacher_id', teacherId)
  }

  const { data, error } = await query
  if (error) return { success: false, data: [] }
  return { success: true, data }
}
