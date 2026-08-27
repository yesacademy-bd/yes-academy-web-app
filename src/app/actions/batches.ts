'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const batchSchema = z.object({
  batch_name: z.string().optional().nullable(),
  course_id: z.string().uuid('Invalid course').optional().nullable(),
  teacher_id: z.string().uuid('Invalid teacher').optional().nullable(),
  monitor_teacher_id: z.string().uuid('Invalid monitor teacher').optional().nullable(),
  room_id: z.string().uuid('Invalid room').optional().nullable(),
  start_date: z.string().optional().nullable(),
  expected_end_date: z.string().optional().nullable(),
  max_students: z.coerce.number().min(1),
  total_classes: z.coerce.number().min(1),
  additional_classes: z.coerce.number().min(0).default(0),
  status: z.enum(['Upcoming', 'Active', 'Paused', 'Completed']),
  schedule_days: z.array(z.string()).optional().default([]),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
})

export async function createBatch(prevState: any, formData: FormData) {
  const supabase = await createClient()

  try {
    const rawData = Object.fromEntries(formData.entries())
    const schedule_days = formData.getAll('schedule_days') as string[]
    
    const validatedData = batchSchema.parse({
      ...rawData,
      schedule_days,
      batch_name: rawData.batch_name || null,
      course_id: rawData.course_id || null,
      teacher_id: rawData.teacher_id || null,
      room_id: rawData.room_id || null,
      start_time: rawData.start_time || null,
      end_time: rawData.end_time || null,
      monitor_teacher_id: rawData.monitor_teacher_id || null,
      start_date: rawData.start_date || null,
      expected_end_date: rawData.expected_end_date || null
    })

    const { data, error } = await supabase
      .from('batches')
      .insert([validatedData])
      .select()

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/admin/batches')
    return { success: true, message: 'Batch created successfully', data }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create batch' }
  }
}

export async function updateBatch(id: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  try {
    const rawData = Object.fromEntries(formData.entries())
    const schedule_days = formData.getAll('schedule_days') as string[]
    
    const validatedData = batchSchema.parse({
      ...rawData,
      schedule_days,
      batch_name: rawData.batch_name || null,
      course_id: rawData.course_id || null,
      teacher_id: rawData.teacher_id || null,
      room_id: rawData.room_id || null,
      start_time: rawData.start_time || null,
      end_time: rawData.end_time || null,
      monitor_teacher_id: rawData.monitor_teacher_id || null,
      start_date: rawData.start_date || null,
      expected_end_date: rawData.expected_end_date || null
    })

    const { data, error } = await supabase
      .from('batches')
      .update(validatedData)
      .eq('id', id)
      .select()

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/admin/batches')
    revalidatePath(`/dashboard/admin/batches/${id}`)
    return { success: true, message: 'Batch updated successfully', data }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update batch' }
  }
}

export async function deleteBatch(id: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!['HR', 'BDM'].includes(profile?.role || '')) {
      throw new Error('Only HR can delete batches')
    }

    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/admin/batches')
    return { success: true, message: 'Batch deleted successfully' }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete batch' }
  }
}
