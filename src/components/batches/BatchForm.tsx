'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { createBatch, updateBatch, deleteBatch } from '@/app/actions/batches'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

const batchSchema = z.object({
  batch_name: z.string().min(1, 'Batch name is required'),
  course_id: z.string().uuid('Course is required'),
  teacher_id: z.string().uuid('Teacher is required'),
  monitor_teacher_id: z.string().optional().nullable(),
  room_id: z.string().uuid('Room is required'),
  start_date: z.string().optional().or(z.literal('')),
  expected_end_date: z.string().optional().or(z.literal('')),
  max_students: z.coerce.number().min(1),
  total_classes: z.coerce.number().min(1),
  additional_classes: z.coerce.number().min(0),
  status: z.enum(['Upcoming', 'Active', 'Paused', 'Completed']),
  schedule_days: z.array(z.string()).min(1, 'Select at least one day'),
  start_time: z.string().min(1, 'Start time required'),
  end_time: z.string().min(1, 'End time required'),
})

type BatchFormValues = z.infer<typeof batchSchema>

export default function BatchForm({ 
  initialData, 
  courses, 
  teachers, 
  rooms, 
  settings,
  userRole
}: { 
  initialData?: any,
  courses: any[],
  teachers: any[],
  rooms: any[],
  settings: any,
  userRole?: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const defaultValues: Partial<BatchFormValues> = initialData || {
    status: 'Upcoming',
    max_students: settings?.default_max_students || 12,
    total_classes: settings?.default_total_classes || 24,
    additional_classes: initialData?.additional_classes || 0,
    schedule_days: [],
  }

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues
  })

  const selectedCourseId = watch('course_id')
  const startDate = watch('start_date')
  const selectedCourse = courses.find(c => c.id === selectedCourseId)
  const isStrictCount = selectedCourse?.family === 'PTE' || selectedCourse?.family === 'IELTS'

  useEffect(() => {
    if (startDate && selectedCourseId) {
      const course = courses.find(c => c.id === selectedCourseId)
      if (course) {
        const start = new Date(startDate)
        let monthsToAdd = 0
        
        if (course.family === 'PTE') {
           if (course.name.toLowerCase().includes('crash')) monthsToAdd = 1
           else monthsToAdd = 2
        }
        else if (course.family === 'IELTS') {
           if (course.name.toLowerCase().includes('crash')) monthsToAdd = 1
           else monthsToAdd = 3
        }
        
        if (monthsToAdd > 0) {
          start.setMonth(start.getMonth() + monthsToAdd)
          const endStr = start.toISOString().split('T')[0]
          setValue('expected_end_date', endStr, { shouldValidate: true })
        }
      }
    }
  }, [startDate, selectedCourseId, courses, setValue])

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value
    setValue('course_id', courseId)
    const course = courses.find(c => c.id === courseId)
    if (course) {
      if (course.family === 'PTE') {
        if (course.name.toLowerCase().includes('crash')) {
          setValue('total_classes', 12)
        } else {
          setValue('total_classes', 24)
        }
      } else if (course.family === 'IELTS') {
        if (course.name.toLowerCase().includes('crash')) {
          setValue('total_classes', 24)
        } else {
          setValue('total_classes', 36)
        }
      } else if (!initialData) {
        setValue('total_classes', course.default_total_classes)
      }
      
      if (!initialData) {
        setValue('additional_classes', 0)
      }
    }
  }

  const onSubmit = async (data: BatchFormValues) => {
    setIsSubmitting(true)
    setError(null)
    
    // Convert data to FormData for Server Action
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'schedule_days') {
        ;(value as string[]).forEach(day => formData.append('schedule_days', day))
      } else if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value.toString())
      }
    })

    const result = initialData 
      ? await updateBatch(initialData.id, null, formData)
      : await createBatch(null, formData)

    if (result.success) {
      router.push('/dashboard/admin/batches')
      router.refresh()
    } else {
      setError(result.message)
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id || !confirm('Are you absolutely sure you want to permanently delete this batch and all its attendance/enrollment records?')) return
    setIsDeleting(true)
    setError(null)
    const res = await deleteBatch(initialData.id)
    if (res.success) {
      router.push('/dashboard/admin/batches')
    } else {
      setError(res.message)
      setIsDeleting(false)
    }
  }

  const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4 md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Info</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Batch Name</label>
            <input type="text" {...register('batch_name')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            {errors.batch_name && <p className="mt-1 text-xs text-red-500">{errors.batch_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select {...register('course_id')} onChange={handleCourseChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Select a course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.family} - {c.name}</option>)}
            </select>
            {errors.course_id && <p className="mt-1 text-xs text-red-500">{errors.course_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select {...register('status')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="Upcoming">Upcoming</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Room</label>
              <select {...register('room_id')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Select room...</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>)}
              </select>
              {errors.room_id && <p className="mt-1 text-xs text-red-500">{errors.room_id.message}</p>}
            </div>
          </div>
        </div>

        {/* Staff & Dates */}
        <div className="space-y-4 md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Staff & Dates</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Teacher</label>
              <select {...register('teacher_id')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Select teacher...</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}
              </select>
              {errors.teacher_id && <p className="mt-1 text-xs text-red-500">{errors.teacher_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Monitor Teacher</label>
              <select {...register('monitor_teacher_id')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">None</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" {...register('start_date')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expected End Date</label>
              <input type="date" {...register('expected_end_date')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              {errors.expected_end_date && <p className="mt-1 text-xs text-red-500">{errors.expected_end_date.message}</p>}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Schedule & Limits</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
              <div className="space-y-2">
                {daysOfWeek.map(day => (
                  <label key={day} className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" value={day} {...register('schedule_days')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    {day}
                  </label>
                ))}
              </div>
              {errors.schedule_days && <p className="mt-1 text-xs text-red-500">{errors.schedule_days.message}</p>}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input type="time" {...register('start_time')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                {errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input type="time" {...register('end_time')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                {errors.end_time && <p className="mt-1 text-xs text-red-500">{errors.end_time.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Students</label>
                <input type="number" {...register('max_students')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Classes</label>
                  <input 
                    type="number" 
                    {...register('total_classes')} 
                    readOnly={isStrictCount}
                    className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${isStrictCount ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional</label>
                  <input type="number" {...register('additional_classes')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div>
          {initialData && userRole === 'HR' && (
            <button 
              type="button" 
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete Batch'}
            </button>
          )}
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || isDeleting} className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : initialData ? 'Update Batch' : 'Create Batch'}
          </button>
        </div>
      </div>

    </form>
  )
}
