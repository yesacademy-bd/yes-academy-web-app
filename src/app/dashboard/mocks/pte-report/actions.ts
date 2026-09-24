'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import nodemailer from 'nodemailer'

export async function fetchPteMockBookings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: [] }

  const { data: profile } = await supabase.from('profiles').select('role, display_name').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM', 'Faculty'].includes(profile?.role || '')) return { success: false, data: [] }

  const adminClient = createAdminClient()
  
  // Fetch PTE Mock bookings only
  const { data, error } = await adminClient
    .from('mock_services')
    .select('id, student_name, student_type, batch_number, email, phone, service_type, exam_date')
    .eq('service_type', 'PTE Mock')
    .order('exam_date', { ascending: false })

  if (error) return { success: false, data: [] }
  
  return { success: true, data, trainerName: profile?.display_name || user.email }
}

export async function fetchPteMockReport(reportId: string) {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.from('pte_mock_reports').select('*').eq('id', reportId).single()
  if (error || !data) return { success: false, data: null }
  return { success: true, data }
}

export async function submitPteMockReport(formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role, display_name').eq('id', user.id).single()
  
  const adminClient = createAdminClient()

  // Verify booking exists and is a PTE Mock
  const { data: booking, error: bookingErr } = await adminClient
    .from('mock_services')
    .select('*')
    .eq('id', formData.mock_booking_id)
    .single()

  if (bookingErr || !booking) return { success: false, message: 'Booking not found.' }
  if (booking.service_type !== 'PTE Mock' && booking.mock_type !== 'PTE Mock') {
    return { success: false, message: 'Selected booking is not a PTE Mock.' }
  }

  // Check for duplicate
  const { data: existingReport } = await adminClient
    .from('pte_mock_reports')
    .select('id')
    .eq('mock_booking_id', formData.mock_booking_id)
    .single()
    
  if (existingReport) {
    return { success: false, message: 'A mock report has already been submitted for this booking.' }
  }

  // Prepare insert data
  const insertData = {
    mock_booking_id: formData.mock_booking_id,
    trainer_id: user.id,
    trainer_name: profile?.display_name || user.email,
    student_name: booking.student_name,
    student_type: booking.student_type,
    batch_number: booking.batch_number,
    student_email: booking.email,
    report_date: new Date().toISOString().split('T')[0],
    
    speaking_rating: formData.speaking_rating,
    speaking_score: formData.speaking_score,
    speaking_strengths: formData.speaking_strengths,
    speaking_improvements: formData.speaking_improvements,
    speaking_action_plan: formData.speaking_action_plan,
    
    writing_rating: formData.writing_rating,
    writing_score: formData.writing_score,
    writing_strengths: formData.writing_strengths,
    writing_improvements: formData.writing_improvements,
    writing_action_plan: formData.writing_action_plan,
    
    reading_rating: formData.reading_rating,
    reading_score: formData.reading_score,
    reading_strengths: formData.reading_strengths,
    reading_improvements: formData.reading_improvements,
    reading_action_plan: formData.reading_action_plan,
    
    listening_rating: formData.listening_rating,
    listening_score: formData.listening_score,
    listening_strengths: formData.listening_strengths,
    listening_improvements: formData.listening_improvements,
    listening_action_plan: formData.listening_action_plan,
    
    overall_score: formData.overall_score,
    overall_feedback: formData.overall_feedback,
    
    email_status: 'Pending'
  }

  const { data: insertedReport, error: insertErr } = await adminClient
    .from('pte_mock_reports')
    .insert(insertData)
    .select()
    .single()

  if (insertErr) {
    return { success: false, message: 'Failed to save report: ' + insertErr.message }
  }

  // Send Email
  const emailResult = await sendPteReportEmail(insertedReport)
  
  if (!emailResult.success) {
    await adminClient
      .from('pte_mock_reports')
      .update({ email_status: 'Failed', email_error: emailResult.message })
      .eq('id', insertedReport.id)
    return { success: true, message: 'Report saved successfully, but the email could not be sent. You can resend it later.', emailFailed: true }
  } else {
    await adminClient
      .from('pte_mock_reports')
      .update({ email_status: 'Sent', email_sent_at: new Date().toISOString() })
      .eq('id', insertedReport.id)
    return { success: true, message: 'Mock Report Submitted Successfully! The report has been saved and sent to the student\'s email address.' }
  }
}

export async function resendPteReportEmail(reportId: string) {
  const adminClient = createAdminClient()
  const { data: report, error } = await adminClient.from('pte_mock_reports').select('*').eq('id', reportId).single()
  if (error || !report) return { success: false, message: 'Report not found' }
  
  const emailResult = await sendPteReportEmail(report)
  if (!emailResult.success) {
    await adminClient.from('pte_mock_reports').update({ email_status: 'Failed' }).eq('id', reportId)
    return { success: false, message: 'Email sending failed: ' + emailResult.message }
  }
  
  await adminClient.from('pte_mock_reports').update({ email_status: 'Sent', email_sent_at: new Date().toISOString() }).eq('id', reportId)
  return { success: true, message: 'Email successfully resent!' }
}

async function sendPteReportEmail(report: any) {
  if (!report.student_email) return { success: false, message: 'No email address provided for this student.' }

  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS
  if (!emailUser || !emailPass) return { success: false, message: 'Email credentials are not configured.' }

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #b91c1c; text-align: center;">YES ACADEMY</h2>
      <h3 style="color: #1e3a8a; text-align: center;">PTE Academic &mdash; Student Progress & Module Evaluation</h3>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <h4 style="margin-top: 0; color: #1e293b;">Student Information:</h4>
        <p><strong>Student Name:</strong> ${report.student_name}</p>
        <p><strong>Student Type:</strong> ${report.student_type || 'N/A'}</p>
        <p><strong>Batch Number:</strong> ${report.batch_number || 'N/A'}</p>
        <p><strong>Trainer Name:</strong> ${report.trainer_name}</p>
        <p><strong>Date:</strong> ${new Date(report.report_date).toLocaleDateString()}</p>
      </div>

      <h4 style="color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">PTE Module Rating</h4>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 10px; border: 1px solid #cbd5e1;">Module</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">Rating</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">Score</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">Strengths</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">Areas for Improvement</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">Action Plan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Speaking</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${report.speaking_rating}/5</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${report.speaking_score || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.speaking_strengths || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.speaking_improvements || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.speaking_action_plan || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Writing</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${report.writing_rating}/5</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${report.writing_score || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.writing_strengths || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.writing_improvements || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.writing_action_plan || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Reading</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${report.reading_rating}/5</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${report.reading_score || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.reading_strengths || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.reading_improvements || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.reading_action_plan || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Listening</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${report.listening_rating}/5</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${report.listening_score || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.listening_strengths || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.listening_improvements || '-'}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${report.listening_action_plan || '-'}</td>
          </tr>
        </tbody>
      </table>

      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; display: inline-block;">
        <h4 style="margin: 0; color: #1e293b;">Overall Score: <span style="font-size: 1.25rem; color: #b91c1c;">${report.overall_score || '-'}</span></h4>
      </div>

      <div style="background-color: #fff; padding: 15px; border: 1px solid #cbd5e1; border-left: 4px solid #1e3a8a; border-radius: 4px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #1e3a8a;">Overall Suggestions / Trainer Feedback</h4>
        <p style="white-space: pre-wrap;">${report.overall_feedback || 'No additional feedback provided.'}</p>
      </div>
      
      <p style="margin-top: 30px;"><strong>Report Submitted By:</strong> ${report.trainer_name}</p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="text-align: center; color: #64748b; font-size: 0.875rem;">
        YES Academy &copy; ${new Date().getFullYear()} | PTE Academic Preparation Program
      </p>
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
      to: report.student_email,
      subject: `YES Academy - PTE Academic Mock Report (${report.student_name})`,
      html
    })
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err.message || 'Unknown error' }
  }
}



