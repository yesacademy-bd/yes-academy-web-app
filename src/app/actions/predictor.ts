'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { predictCompletionDate, findNextValidClassDay } from '@/utils/schedule'
import { getHolidays } from '@/app/actions/holidays'

function getCourseTypeCategory(courseFamily: string, batchName: string) {
  if (batchName.toLowerCase().startsWith('online')) return 'Online PTE'
  if (courseFamily === 'PTE') return 'PTE'
  if (courseFamily === 'IELTS') return 'IELTS'
  return 'Other'
}

function extractBatchNumber(batchName: string): number {
  const match = batchName.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

function getBatchPrefix(category: string): string {
  if (category === 'Online PTE') return 'Online'
  if (category === 'PTE') return 'PTE'
  if (category === 'IELTS') return 'IELTS'
  return 'Batch'
}

export async function generateMonthlyPrediction(
  month: number, 
  year: number, 
  courseType: string
) {
  const supabase = await createClient()
  const holidays = await getHolidays()
  
  const { data: batches } = await supabase
    .from('batches')
    .select('*, courses(family, name)')
    .in('status', ['Active', 'Upcoming'])

  const { data: allSessions } = await supabase
    .from('class_sessions')
    .select('batch_id, class_number, session_date')
    .gt('class_number', 0)
    
  const tzDateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
  const nowDhaka = new Date(tzDateStr)
  const todayDateStr = `${nowDhaka.getFullYear()}-${String(nowDhaka.getMonth() + 1).padStart(2, '0')}-${String(nowDhaka.getDate()).padStart(2, '0')}`

  const sessionsByBatch = (allSessions || []).reduce((acc: any, curr: any) => {
    if (!acc[curr.batch_id]) acc[curr.batch_id] = { maxNum: 0, maxDate: '' }
    if (curr.class_number > acc[curr.batch_id].maxNum) {
      acc[curr.batch_id].maxNum = curr.class_number
      acc[curr.batch_id].maxDate = curr.session_date
    }
    return acc
  }, {})

  let finishingBatches = (batches || []).map(b => {
    const highestCompleted = sessionsByBatch[b.id]?.maxNum || 0
    const highestDate = sessionsByBatch[b.id]?.maxDate || ''
    const totalClasses = b.total_classes + b.additional_classes
    const remaining = totalClasses - highestCompleted
    
    const category = getCourseTypeCategory(b.courses.family, b.batch_name)
    
    const isReferenceDateCompleted = (highestDate === todayDateStr)

    const completionDate = predictCompletionDate(todayDateStr, b.schedule_days, remaining, isReferenceDateCompleted, holidays)
    
    return {
      ...b,
      category,
      currentClass: highestCompleted,
      remainingClasses: remaining,
      completionDate
    }
  }).filter(b => b.completionDate !== null)

  const targetCategories = courseType === 'PTE' ? ['PTE', 'Online PTE'] : ['IELTS']

  finishingBatches = finishingBatches
    .filter(b => targetCategories.includes(b.category))
    .sort((a, b) => new Date(a.completionDate!).getTime() - new Date(b.completionDate!).getTime())

  const { data: allBatches } = await supabase.from('batches').select('batch_name, courses(family)')
  let currentMaxNumbers = { 'PTE': 0, 'IELTS': 0, 'Online PTE': 0 }
  
  ;(allBatches || []).forEach(b => {
    const cat = getCourseTypeCategory(b.courses?.family || '', b.batch_name)
    const num = extractBatchNumber(b.batch_name)
    if (cat in currentMaxNumbers && num > currentMaxNumbers[cat as keyof typeof currentMaxNumbers]) {
      currentMaxNumbers[cat as keyof typeof currentMaxNumbers] = num
    }
  })

  const predictions = []

  for (const b of finishingBatches) {
    const [cy, cm] = b.completionDate!.split('-').map(Number)
    if (cy !== year || cm !== month) continue
    
    const suggestedStartDate = findNextValidClassDay(b.completionDate, b.schedule_days, holidays) || todayDateStr
    
    currentMaxNumbers[b.category as keyof typeof currentMaxNumbers]++
    const newBatchNumber = currentMaxNumbers[b.category as keyof typeof currentMaxNumbers]
    const prefix = getBatchPrefix(b.category)
    const newBatchName = `${prefix} ${newBatchNumber}`
    
    predictions.push({
      planning_month: month,
      planning_year: year,
      course_type: b.category,
      predicted_batch_name: newBatchName,
      predicted_start_date: suggestedStartDate,
      previous_batch_id: b.id,
      previous_batch_completion_date: b.completionDate,
      suggested_teacher_id: b.teacher_id,
      prediction_status: 'Suggested',
      reference_date: todayDateStr,
      previous_batch_current_class: b.currentClass,
      previous_batch_remaining_classes: b.remainingClasses
    })
  }

  // Save to DB
  if (predictions.length > 0) {
    // Delete old predictions for this month/year/course
    for (const cat of targetCategories) {
      await supabase.from('batch_predictions')
        .delete()
        .eq('planning_month', month)
        .eq('planning_year', year)
        .eq('course_type', cat)
        .eq('prediction_status', 'Suggested')
    }

    const { error } = await supabase.from('batch_predictions').insert(predictions)
    if (error) {
      console.error('Error inserting predictions:', error)
      return { success: false, message: error.message }
    }
  }
  
  // If no batches end this month, also clear old suggestions for this course
  else {
    for (const cat of targetCategories) {
      await supabase.from('batch_predictions')
        .delete()
        .eq('planning_month', month)
        .eq('planning_year', year)
        .eq('course_type', cat)
        .eq('prediction_status', 'Suggested')
    }
  }

  revalidatePath('/dashboard/admin/predictor')
  return { success: true }
}

export async function getPredictions(month: number, year: number, courseType: string = 'All') {
  const supabase = await createClient()
  let query = supabase
    .from('batch_predictions')
    .select('*, previous_batch:batches(batch_name), suggested_teacher:profiles(display_name)')
    .eq('planning_month', month)
    .eq('planning_year', year)
    .order('predicted_start_date', { ascending: true })

  if (courseType !== 'All') {
    const targets = courseType === 'PTE' ? ['PTE', 'Online PTE'] : ['IELTS']
    query = query.in('course_type', targets)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}

export async function updatePrediction(id: string, updates: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('batch_predictions')
    .update({ ...updates, manually_modified: true })
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  revalidatePath('/dashboard/admin/predictor')
  return { success: true }
}

export async function getEligibleTeachers() {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('id, display_name').in('role', ['Faculty', 'Admin', 'BDM'])
  return data || []
}

export async function confirmPrediction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('batch_predictions')
    .update({ prediction_status: 'Confirmed' })
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  revalidatePath('/dashboard/admin/predictor')
  return { success: true }
}
