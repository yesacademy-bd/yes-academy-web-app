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
  pteTarget: number, 
  ieltsTarget: number,
  admissionGap: number = 0,
  mode: 'strict' | 'batch_count' | 'admission_gap' = 'strict'
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

  finishingBatches.sort((a, b) => new Date(a.completionDate!).getTime() - new Date(b.completionDate!).getTime())

  const { data: allBatches } = await supabase.from('batches').select('batch_name, courses(family)')
  let currentMaxNumbers = { 'PTE': 0, 'IELTS': 0, 'Online PTE': 0 }
  
  ;(allBatches || []).forEach(b => {
    const cat = getCourseTypeCategory(b.courses?.family || '', b.batch_name)
    const num = extractBatchNumber(b.batch_name)
    if (cat in currentMaxNumbers && num > currentMaxNumbers[cat as keyof typeof currentMaxNumbers]) {
      currentMaxNumbers[cat as keyof typeof currentMaxNumbers] = num
    }
  })

  const { data: teachers } = await supabase.from('profiles').select('*').in('role', ['Faculty', 'Admin', 'BDM'])
  
  const teacherWorkloads = (teachers || []).map(t => {
    const assigned = finishingBatches.filter(b => b.teacher_id === t.id)
    return {
      teacher: t,
      assignedBatches: assigned.map(b => ({ id: b.id, completionDate: b.completionDate }))
    }
  })

  const targetMap: Record<string, number> = {
    'PTE': pteTarget,
    'IELTS': ieltsTarget,
    'Online PTE': 0
  }

  const simulatePipeline = (categoryFinishingBatches: any[], target: number, enforcedGap: number) => {
    const results = []
    for (let i = 0; i < target; i++) {
      const finishingBatch = i < categoryFinishingBatches.length ? categoryFinishingBatches[i] : null
      let suggestedStartDate = todayDateStr
      let scheduleDays = ['Sunday', 'Tuesday', 'Thursday']

      if (finishingBatch) {
        scheduleDays = finishingBatch.schedule_days
        const [cy, cm, cd] = finishingBatch.completionDate!.split('-').map(Number)
        const gapDate = new Date(cy, cm - 1, cd, 12, 0, 0)
        gapDate.setDate(gapDate.getDate() + enforcedGap)
        const gapDateStr = `${gapDate.getFullYear()}-${String(gapDate.getMonth() + 1).padStart(2, '0')}-${String(gapDate.getDate()).padStart(2, '0')}`
        suggestedStartDate = findNextValidClassDay(gapDateStr, scheduleDays, holidays) || todayDateStr
      } else {
        suggestedStartDate = findNextValidClassDay(todayDateStr, scheduleDays, holidays) || todayDateStr
      }

      const [sy, sm] = suggestedStartDate.split('-').map(Number)
      if (sy > year || (sy === year && sm > month)) {
        break // Reached end of the month
      }
      if (sy < year || (sy === year && sm < month)) {
        const firstOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
        suggestedStartDate = findNextValidClassDay(`${year}-${String(month).padStart(2, '0')}-00`, scheduleDays, holidays) || firstOfMonth
      }
      
      results.push({ finishingBatch, suggestedStartDate, scheduleDays })
    }
    return results
  }

  const predictions = []

  for (const category of ['PTE', 'IELTS', 'Online PTE']) {
    let originalTarget = targetMap[category] || 0
    if (originalTarget === 0) continue

    const categoryFinishingBatches = finishingBatches.filter(b => b.category === category)
    
    // Feasibility Check
    const strictBatches = simulatePipeline(categoryFinishingBatches, originalTarget, admissionGap)
    const maxPossibleBatches = strictBatches.length
    
    if (mode === 'strict' && maxPossibleBatches < originalTarget) {
      return { 
        success: false, 
        isFeasible: false,
        failedCategory: category,
        target: originalTarget,
        maxPossible: maxPossibleBatches,
        message: `The requested target of ${originalTarget} ${category} batches cannot be achieved in ${month}/${year} while maintaining a ${admissionGap}-day admission gap.`
      }
    }

    let actualTarget = originalTarget
    let actualGapToUse = admissionGap

    if (mode === 'admission_gap') {
      actualTarget = maxPossibleBatches
    } else if (mode === 'batch_count') {
      actualTarget = originalTarget
      actualGapToUse = 0 // Relax the gap to paci
    }

    const finalSimulatedBatches = simulatePipeline(categoryFinishingBatches, actualTarget, actualGapToUse)
    
    for (let i = 0; i < finalSimulatedBatches.length; i++) {
      const { finishingBatch, suggestedStartDate } = finalSimulatedBatches[i]

      currentMaxNumbers[category as keyof typeof currentMaxNumbers]++
      const newBatchNumber = currentMaxNumbers[category as keyof typeof currentMaxNumbers]
      const prefix = getBatchPrefix(category)
      const newBatchName = `${prefix} ${newBatchNumber}`

      // Calculate actual gap for transparency
      let computedActualGap = admissionGap // Default if no previous batch
      if (finishingBatch) {
        const t1 = new Date(finishingBatch.completionDate + 'T12:00:00Z').getTime()
        const t2 = new Date(suggestedStartDate + 'T12:00:00Z').getTime()
        computedActualGap = Math.max(0, Math.floor((t2 - t1) / (1000 * 60 * 60 * 24)) - 1)
      }

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
        required_gap: admissionGap,
        actual_gap: computedActualGap,
        prediction_status: 'Suggested',
        reference_date: todayDateStr,
        previous_batch_current_class: finishingBatch ? finishingBatch.currentClass : null,
        previous_batch_remaining_classes: finishingBatch ? finishingBatch.remainingClasses : null
      })
      
      if (suggestedTeacherId) {
        const tw = teacherWorkloads.find(tw => tw.teacher.id === suggestedTeacherId)
        if (tw) {
        const endProjected = new Date(projectedStartMs + 30*24*60*60*1000).toISOString().split('T')[0]
          tw.assignedBatches.push({ id: 'temp', completionDate: endProjected })
        }
      }
    }
  }

  // Save to DB
  if (predictions.length > 0 && mode !== 'strict') {
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
  return { success: true, isFeasible: true }
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
  const supabase = await createClient()
  const { error } = await supabase
    .from('batch_predictions')
    .update({ prediction_status: 'Confirmed' })
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  revalidatePath('/dashboard/admin/predictor')
  return { success: true }
}

