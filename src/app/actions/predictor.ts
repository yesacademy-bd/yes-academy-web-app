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

export async function generateMonthlyPrediction(month: number, year: number, pteTarget: number, ieltsTarget: number) {
  const supabase = await createClient()
  
  // 1. Fetch holidays
  const holidays = await getHolidays()
  
  // 2. Fetch all batches (Active & Upcoming) with course info
  const { data: batches } = await supabase
    .from('batches')
    .select('*, courses(family, name)')
    .in('status', ['Active', 'Upcoming'])

  // 3. Fetch all class sessions to determine completed counts
  const { data: allSessions } = await supabase
    .from('class_sessions')
    .select('batch_id, class_number')
    .gt('class_number', 0)
    
  const sessionsByBatch = (allSessions || []).reduce((acc: any, curr: any) => {
    if (!acc[curr.batch_id]) acc[curr.batch_id] = []
    acc[curr.batch_id].push(curr.class_number)
    return acc
  }, {})

  // 4. Calculate completion date for each active batch
  const tzDateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
  const nowDhaka = new Date(tzDateStr)
  const todayDateStr = `-${String(nowDhaka.getMonth() + 1).padStart(2, '0')}-${String(nowDhaka.getDate()).padStart(2, '0')}`

  let finishingBatches = (batches || []).map(b => {
    const highestCompleted = sessionsByBatch[b.id] ? Math.max(...sessionsByBatch[b.id]) : 0
    const totalClasses = b.total_classes + b.additional_classes
    const remaining = totalClasses - highestCompleted
    
    const category = getCourseTypeCategory(b.courses.family, b.batch_name)
    const completionDate = predictCompletionDate(todayDateStr, b.schedule_days, remaining, holidays)
    
    return {
      ...b,
      category,
      remainingClasses: remaining,
      completionDate
    }
  }).filter(b => b.completionDate !== null)

  // Sort by completion date ascending
  finishingBatches.sort((a, b) => new Date(a.completionDate!).getTime() - new Date(b.completionDate!).getTime())

  // 5. Fetch existing highest batch numbers
  const { data: allBatches } = await supabase.from('batches').select('batch_name, courses(family)')
  let currentMaxNumbers = { 'PTE': 0, 'IELTS': 0, 'Online PTE': 0 }
  
  ;(allBatches || []).forEach(b => {
    const cat = getCourseTypeCategory(b.courses?.family || '', b.batch_name)
    const num = extractBatchNumber(b.batch_name)
    if (cat in currentMaxNumbers && num > currentMaxNumbers[cat as keyof typeof currentMaxNumbers]) {
      currentMaxNumbers[cat as keyof typeof currentMaxNumbers] = num
    }
  })

  // 6. Fetch profiles to find eligible teachers
  const { data: teachers } = await supabase.from('profiles').select('*').in('role', ['Faculty', 'Admin', 'BDM'])
  
  // Predict teacher workload map: teacher_id -> array of active batches and their end dates
  const teacherWorkloads = (teachers || []).map(t => {
    const assigned = finishingBatches.filter(b => b.teacher_id === t.id)
    return {
      teacher: t,
      assignedBatches: assigned.map(b => ({ id: b.id, completionDate: b.completionDate }))
    }
  })

  const predictions = []

  const targetMap: Record<string, number> = {
    'PTE': pteTarget,
    'IELTS': ieltsTarget,
    'Online PTE': 0 // Usually part of PTE target or handled manually
  }

  // Generate predictions for each category based on targets
  for (const category of ['PTE', 'IELTS', 'Online PTE']) {
    let target = targetMap[category] || 0
    if (target === 0) continue

    const categoryFinishingBatches = finishingBatches.filter(b => b.category === category)
    
    for (let i = 0; i < target; i++) {
      // If we run out of finishing batches, we can't perfectly map a "replacement", but we can still suggest a new batch
      const finishingBatch = i < categoryFinishingBatches.length ? categoryFinishingBatches[i] : null
      
      let suggestedStartDate = todayDateStr
      let scheduleDays = ['Sunday', 'Tuesday', 'Thursday'] // Default if no finishing batch

      if (finishingBatch) {
        scheduleDays = finishingBatch.schedule_days
        suggestedStartDate = findNextValidClassDay(finishingBatch.completionDate!, scheduleDays, holidays) || todayDateStr
      } else {
        // Find next valid day from today for default schedule
        suggestedStartDate = findNextValidClassDay(todayDateStr, scheduleDays, holidays) || todayDateStr
      }

      // Ensure the suggested start date is within the targeted month/year
      const [sy, sm] = suggestedStartDate.split('-').map(Number)
      if (sy > year || (sy === year && sm > month)) {
        // The projected date is beyond the target month, so we skip it to accurately report shortfall
        continue
      }
      if (sy < year || (sy === year && sm < month)) {
        // If the projected date is BEFORE the target month, we bump it to the 1st of the target month
        const firstOfMonth = `-${String(month).padStart(2, '0')}-01`
        suggestedStartDate = findNextValidClassDay(`-${String(month).padStart(2, '0')}-00`, scheduleDays, holidays) || firstOfMonth
      }

      currentMaxNumbers[category as keyof typeof currentMaxNumbers]++
      const newBatchNumber = currentMaxNumbers[category as keyof typeof currentMaxNumbers]
      const prefix = getBatchPrefix(category)
      const newBatchName = ` `

      // Rank teachers based on workload on suggestedStartDate
      // A teacher's workload is the number of batches that finish AFTER the suggestedStartDate
      const projectedStartMs = new Date(suggestedStartDate).getTime()
      
      const rankedTeachers = teacherWorkloads.map(tw => {
        const activeCount = tw.assignedBatches.filter(b => new Date(b.completionDate!).getTime() >= projectedStartMs).length
        return { teacher_id: tw.teacher.id, activeCount }
      }).sort((a, b) => a.activeCount - b.activeCount)

      const suggestedTeacherId = rankedTeachers.length > 0 ? rankedTeachers[0].teacher_id : null

      predictions.push({
        planning_month: month,
        planning_year: year,
        course_type: category,
        predicted_batch_name: newBatchName,
        predicted_start_date: suggestedStartDate,
        previous_batch_id: finishingBatch ? finishingBatch.id : null,
        previous_batch_completion_date: finishingBatch ? finishingBatch.completionDate : null,
        suggested_teacher_id: suggestedTeacherId,
        prediction_status: 'Suggested'
      })
      
      // Update teacher workload to simulate them picking up this batch
      if (suggestedTeacherId) {
        const tw = teacherWorkloads.find(tw => tw.teacher.id === suggestedTeacherId)
        if (tw) {
          // Approximate the new batch takes 1 month to finish
          const endProjected = new Date(projectedStartMs + 30*24*60*60*1000).toISOString().split('T')[0]
          tw.assignedBatches.push({ id: 'temp', completionDate: endProjected })
        }
      }
    }
  }

  // Save to DB
  if (predictions.length > 0) {
    // Delete old unconfirmed predictions for this month/year to avoid duplicates
    await supabase.from('batch_predictions')
      .delete()
      .eq('planning_month', month)
      .eq('planning_year', year)
      .eq('prediction_status', 'Suggested')

    const { error } = await supabase.from('batch_predictions').insert(predictions)
    if (error) {
      console.error('Error inserting predictions:', error)
      return { success: false, message: error.message }
    }
  }

  revalidatePath('/dashboard/admin/predictor')
  return { success: true }
}

export async function getPredictions(month: number, year: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('batch_predictions')
    .select('*, previous_batch:batches(batch_name), suggested_teacher:profiles(display_name)')
    .eq('planning_month', month)
    .eq('planning_year', year)
    .order('predicted_start_date', { ascending: true })

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
  // Logic to turn a prediction into a real batch could go here.
  // For now, we just mark it Confirmed.
  const supabase = await createClient()
  const { error } = await supabase
    .from('batch_predictions')
    .update({ prediction_status: 'Confirmed' })
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  revalidatePath('/dashboard/admin/predictor')
  return { success: true }
}
