'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getStudentProgress(enrollmentId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('exam_scores')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .single()
    
  if (error && error.code !== 'PGRST116') {
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}

export async function updateStudentProgress(enrollmentId: string, updates: any) {
  const supabase = await createClient()
  
  // Verify if it exists
  const { data: existing } = await supabase
    .from('exam_scores')
    .select('id')
    .eq('enrollment_id', enrollmentId)
    .single()
    
  if (existing) {
    const { error } = await supabase
      .from('exam_scores')
      .update(updates)
      .eq('enrollment_id', enrollmentId)
      
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from('exam_scores')
      .insert({
        enrollment_id: enrollmentId,
        ...updates
      })
      
    if (error) return { success: false, error: error.message }
  }
  
  revalidatePath('/dashboard/faculty/batches/[id]', 'page')
  return { success: true }
}
