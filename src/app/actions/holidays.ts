'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getHolidays() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('holidays')
    .select('holiday_date, reason')
    .order('holiday_date', { ascending: true })

  if (error) {
    console.error('Error fetching holidays:', error)
    return []
  }

  // Return just the date strings
  return data.map(h => h.holiday_date)
}

export async function getAllHolidays() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('holidays')
    .select('*')
    .order('holiday_date', { ascending: true })
  return data || []
}

export async function addHoliday(date: string, reason: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('holidays')
    .insert({ holiday_date: date, reason })

  if (error) return { success: false, message: error.message }
  revalidatePath('/dashboard/hr/holidays')
  return { success: true }
}

export async function deleteHoliday(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('holidays')
    .delete()
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  revalidatePath('/dashboard/hr/holidays')
  return { success: true }
}
