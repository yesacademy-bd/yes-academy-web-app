'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import nodemailer from 'nodemailer'

export async function createMockService(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const student_type = formData.get('student_type') as string
  const student_name = formData.get('student_name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const mock_type = formData.get('mock_type') as string
  const mock_status = formData.get('mock_status') as string
  
  const amount = parseFloat(formData.get('amount') as string) || 0
  const paid_amount = parseFloat(formData.get('paid_amount') as string) || 0
  const payment_method = formData.get('payment_method') as string
  const exam_date = formData.get('exam_date') as string
  const exam_time = formData.get('exam_time') as string
  const exam_venue = formData.get('exam_venue') as string

  if (!student_type || !mock_status || !student_name || !phone || !mock_type || !exam_date) {
    return { success: false, message: 'Missing required fields' }
  }

  // 1. Validate Day
  const d = new Date(exam_date)
  const day = d.getDay() // 0 = Sunday, 2 = Tuesday, 4 = Thursday
  if (mock_type === 'PTE Mock' && day !== 0 && day !== 4) {
    return { success: false, message: 'PTE Mock is available only on Sunday and Thursday.' }
  }
  if (mock_type === 'IELTS Mock' && day !== 2) {
    return { success: false, message: 'IELTS Mock is available only on Tuesday.' }
  }

  // 2. Validate Free Inhouse limit
  if (student_type === 'Inhouse' && mock_status === 'Free') {
    const { count, error: countErr } = await supabase
      .from('mock_services')
      .select('*', { count: 'exact', head: true })
      .eq('phone', phone)
      .eq('student_type', 'Inhouse')
      .eq('mock_status', 'Free')
      
    if (count !== null && count >= 2) {
      return { success: false, message: 'Maximum limit passed. This Inhouse student has already used the maximum of 2 free mock registrations.' }
    }
  }

  // 3. Validate Session Capacity
  const { count: sessionCount } = await supabase
    .from('mock_services')
    .select('*', { count: 'exact', head: true })
    .eq('service_type', mock_type)
    .eq('exam_date', exam_date)
    
  if (sessionCount !== null && sessionCount >= 10) {
    return { success: false, message: 'This mock session is full. All 10 slots have been booked. Please select another date.' }
  }

  const { error } = await supabase
    .from('mock_services')
    .insert({
      student_type,
      student_name,
      phone,
      email,
      service_type: mock_type,
      mock_status,
      course_fee: amount,
      paid_amount,
      payment_method,
      exam_date,
      exam_time,
      exam_venue,
      registered_by: profile?.full_name || profile?.role || 'Unknown'
    })

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/mocks')
  return { success: true }
}

export async function sendConfirmationEmail(record: any, serviceLabel: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  if (!record.email) return { success: false, message: 'No email address provided for this student.' }

  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS
  if (!emailUser || !emailPass) return { success: false, message: 'Email credentials are not configured in environment variables.' }

  const due = (record.course_fee || 0) - (record.paid_amount || 0)

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">YES Academy - Booking Confirmation</h2>
      <p>Dear <strong>${record.student_name}</strong>,</p>
      <p>Your <strong>${record.service_type || record.exam_type || record.mock_type}</strong> has been successfully booked.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Exam Details</h3>
        <p><strong>Date:</strong> ${new Date(record.exam_date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${record.exam_time || 'TBD'}</p>
        <p><strong>Venue:</strong> ${record.exam_venue || 'TBD'}</p>
      </div>

      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Payment Summary</h3>
        <p><strong>Total Fee:</strong> ৳${record.course_fee || record.amount || 0}</p>
        <p><strong>Amount Paid:</strong> ৳${record.paid_amount || 0} (${record.payment_method || 'Cash'})</p>
        <p><strong>Remaining Due:</strong> <span style="color: #dc2626; font-weight: bold;">৳${due}</span></p>
      </div>

      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br/><strong>YES Academy Team</strong></p>
    </div>
  `

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    })

    await transporter.sendMail({
      from: `"YES Academy" <${emailUser}>`,
      to: record.email,
      subject: `YES Academy - ${serviceLabel} Confirmation`,
      html: html
    })

    return { success: true }
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error while sending email' }
  }
}

export async function deleteMockService(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) return { success: false, message: 'Admin or HR only' }

  const { error } = await supabase
    .from('mock_services')
    .delete()
    .eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/mocks')
  return { success: true }
}
