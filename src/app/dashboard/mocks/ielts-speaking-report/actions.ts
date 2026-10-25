'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import nodemailer from 'nodemailer'
import { generateIeltsSpeakingPdfBuffer, IeltsReportData } from './pdfGenerator'

export async function fetchIeltsMockCandidates() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: [], students: [], trainerName: '' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!['Admin', 'HR', 'BDM', 'Faculty'].includes(profile?.role || '')) {
    return { success: false, data: [], students: [], trainerName: '' }
  }

  const adminClient = createAdminClient()

  // 1. Fetch IELTS Mock bookings from mock_services
  const { data: mockBookings } = await adminClient
    .from('mock_services')
    .select('id, student_name, student_type, batch_number, email, phone, service_type, exam_date, speaking_time, speaking_method, assigned_speaking_teacher')
    .eq('service_type', 'IELTS Mock')
    .order('exam_date', { ascending: false })

  // 2. Also fetch registered students for selection flexibility
  const { data: students } = await adminClient
    .from('students')
    .select('id, system_id, name, email, phone')
    .order('name', { ascending: true })
    .limit(300)

  return {
    success: true,
    data: mockBookings || [],
    students: students || [],
    trainerName: profile?.display_name || user.email || 'YES Academy Faculty'
  }
}

export async function fetchIeltsSpeakingReports() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: [] }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('ielts_speaking_reports')
    .select('*')
    .order('test_date', { ascending: false })

  if (error) {
    console.error('Error fetching IELTS speaking reports:', error)
    return { success: false, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function fetchIeltsSpeakingReport(reportId: string) {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('ielts_speaking_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (error || !data) return { success: false, data: null }
  return { success: true, data }
}

export async function submitIeltsSpeakingReport(formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!['Admin', 'HR', 'BDM', 'Faculty'].includes(profile?.role || '')) {
    return { success: false, message: 'Unauthorized: insufficient role permissions.' }
  }

  // Basic Validation
  if (!formData.student_name || !formData.student_name.trim()) {
    return { success: false, message: 'Student Name is required.' }
  }
  if (!formData.test_date) {
    return { success: false, message: 'Test Date is required.' }
  }
  if (!formData.overall_band_score) {
    return { success: false, message: 'Overall IELTS Speaking Band Score is required.' }
  }

  const validLevels = ['Limited', 'Moderate', 'Good', 'Excellent']
  const criteria = [
    { key: 'fluency_coherence', name: 'Fluency & Coherence' },
    { key: 'lexical_resources', name: 'Lexical Resources' },
    { key: 'grammatical_range', name: 'Grammatical Range & Accuracy' },
    { key: 'pronunciation', name: 'Pronunciation' },
  ]

  for (const c of criteria) {
    const val = formData[c.key]
    if (!val || !validLevels.includes(val)) {
      return { success: false, message: `Please select a valid performance level (Limited, Moderate, Good, or Excellent) for ${c.name}.` }
    }
  }

  const adminClient = createAdminClient()

  // Prevent duplicate report for the same mock booking if booking ID is present
  if (formData.mock_booking_id) {
    const { data: existing } = await adminClient
      .from('ielts_speaking_reports')
      .select('id')
      .eq('mock_booking_id', formData.mock_booking_id)
      .single()

    if (existing) {
      return { success: false, message: 'An IELTS Speaking Report has already been submitted for this mock booking.' }
    }
  }

  const trainerName = profile?.display_name || user.email || 'YES Academy Faculty'
  const reportDate = new Date().toISOString().split('T')[0]

  const insertData = {
    mock_booking_id: formData.mock_booking_id || null,
    student_id: formData.student_id || null,
    trainer_id: user.id,
    trainer_name: trainerName,
    student_name: formData.student_name.trim(),
    student_email: formData.student_email?.trim() || null,
    candidate_number: formData.candidate_number?.trim() || null,
    student_type: formData.student_type || 'Inhouse',
    batch_number: formData.batch_number?.trim() || null,
    phone: formData.phone?.trim() || null,
    test_date: formData.test_date,
    report_date: reportDate,
    fluency_coherence: formData.fluency_coherence,
    lexical_resources: formData.lexical_resources,
    grammatical_range: formData.grammatical_range,
    pronunciation: formData.pronunciation,
    overall_band_score: String(formData.overall_band_score).trim(),
    suggestions: formData.suggestions?.trim() || null,
    additional_comments: formData.additional_comments?.trim() || null,
    email_status: 'Pending'
  }

  const { data: insertedReport, error: insertErr } = await adminClient
    .from('ielts_speaking_reports')
    .insert(insertData)
    .select()
    .single()

  if (insertErr) {
    console.error('Failed to insert IELTS speaking report:', insertErr)
    return { success: false, message: 'Failed to save report: ' + insertErr.message }
  }

  // Send Email with PDF Attachment
  if (!insertedReport.student_email) {
    await adminClient
      .from('ielts_speaking_reports')
      .update({ email_status: 'No Email', email_error: 'Student does not have an email address registered.' })
      .eq('id', insertedReport.id)

    return {
      success: true,
      data: insertedReport,
      message: 'Report saved successfully! (No email was sent because no email address was provided for this student.)'
    }
  }

  const emailResult = await sendIeltsReportEmail(insertedReport)

  if (!emailResult.success) {
    await adminClient
      .from('ielts_speaking_reports')
      .update({ email_status: 'Failed', email_error: emailResult.message })
      .eq('id', insertedReport.id)

    return {
      success: true,
      data: insertedReport,
      emailFailed: true,
      message: 'Report saved successfully, but email delivery failed: ' + emailResult.message + '. You can resend it later from Report History.'
    }
  }

  await adminClient
    .from('ielts_speaking_reports')
    .update({ email_status: 'Sent', email_sent_at: new Date().toISOString() })
    .eq('id', insertedReport.id)

  return {
    success: true,
    data: insertedReport,
    message: "IELTS Speaking Score Report submitted successfully! The report and PDF have been emailed to the student's registered email address."
  }
}

export async function resendIeltsReportEmail(reportId: string) {
  const adminClient = createAdminClient()
  const { data: report, error } = await adminClient
    .from('ielts_speaking_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (error || !report) return { success: false, message: 'Report not found' }
  if (!report.student_email) return { success: false, message: 'This student does not have an email address.' }

  const emailResult = await sendIeltsReportEmail(report)
  if (!emailResult.success) {
    await adminClient
      .from('ielts_speaking_reports')
      .update({ email_status: 'Failed', email_error: emailResult.message })
      .eq('id', reportId)
    return { success: false, message: 'Email sending failed: ' + emailResult.message }
  }

  await adminClient
    .from('ielts_speaking_reports')
    .update({ email_status: 'Sent', email_sent_at: new Date().toISOString(), email_error: null })
    .eq('id', reportId)

  return { success: true, message: 'Report email successfully resent with PDF attachment!' }
}

async function sendIeltsReportEmail(report: any) {
  if (!report.student_email) {
    return { success: false, message: 'No student email provided.' }
  }

  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS
  if (!emailUser || !emailPass) {
    return { success: false, message: 'Email credentials (EMAIL_USER/EMAIL_PASS) are not configured.' }
  }

  // Generate the PDF Attachment Buffer
  let pdfBuffer: Buffer
  try {
    pdfBuffer = generateIeltsSpeakingPdfBuffer({
      student_name: report.student_name,
      student_email: report.student_email,
      candidate_number: report.candidate_number,
      student_type: report.student_type,
      batch_number: report.batch_number,
      trainer_name: report.trainer_name,
      test_date: report.test_date,
      report_date: report.report_date,
      fluency_coherence: report.fluency_coherence,
      lexical_resources: report.lexical_resources,
      grammatical_range: report.grammatical_range,
      pronunciation: report.pronunciation,
      overall_band_score: report.overall_band_score,
      suggestions: report.suggestions,
      additional_comments: report.additional_comments,
    })
  } catch (err: any) {
    console.error('PDF generation error:', err)
    return { success: false, message: 'Failed to generate PDF: ' + err.message }
  }

  const safeName = report.student_name.replace(/[^a-zA-Z0-9]/g, '_')
  const safeDate = (report.test_date || '').replace(/[^a-zA-Z0-9]/g, '-')
  const filename = `YES_Academy_IELTS_Speaking_Report_${safeName}_${safeDate}.pdf`

  // Format criteria indicator
  const formatCell = (selectedLevel: string, targetLevel: string) => {
    if ((selectedLevel || '').toLowerCase() === targetLevel.toLowerCase()) {
      return `<td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; background-color: #dcfce7; color: #166534; font-weight: bold;">&#10003; ${targetLevel}</td>`
    }
    return `<td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #94a3b8;">-</td>`
  }

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 720px; margin: 0 auto; line-height: 1.6;">
      <div style="text-align: center; border-bottom: 3px solid #E10600; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #E10600; margin: 0 0 6px 0; font-size: 26px; letter-spacing: 1px;">YES ACADEMY</h1>
        <h2 style="color: #0f172a; margin: 0; font-size: 18px;">IELTS SPEAKING SCORE REPORT</h2>
        <p style="color: #64748b; margin: 6px 0 0 0; font-size: 13px;">STUDENT PERFORMANCE & CRITERIA EVALUATION</p>
      </div>

      <p style="font-size: 15px;">Dear <strong>${report.student_name}</strong>,</p>
      <p style="font-size: 15px;">Thank you for taking your IELTS Speaking assessment with YES Academy.</p>
      <p style="font-size: 15px;">
        Please find your <strong>IELTS Speaking Score Report</strong> attached to this email as a PDF document.
        The report includes your assessment across the four IELTS Speaking criteria, your overall band score, and personalized feedback from your examiner.
      </p>
      <p style="font-size: 15px;">
        We encourage you to review the feedback carefully and continue working on the areas identified for improvement.
      </p>

      <!-- Snapshot Box -->
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; width: 50%;"><strong>Student Name:</strong> ${report.student_name}</td>
            <td style="padding: 4px 0; width: 50%;"><strong>Candidate / Batch:</strong> ${[report.candidate_number, report.batch_number].filter(Boolean).join(' / ') || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Test Date:</strong> ${report.test_date}</td>
            <td style="padding: 4px 0;"><strong>Examiner:</strong> ${report.trainer_name}</td>
          </tr>
        </table>
      </div>

      <!-- Assessment Table -->
      <h3 style="color: #0f172a; font-size: 16px; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        Assessment Criteria Evaluation
      </h3>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 10px; border: 1px solid #cbd5e1; width: 36%;">Area of Scoring</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; width: 16%;">Limited</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; width: 16%;">Moderate</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; width: 16%;">Good</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; width: 16%;">Excellent</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Fluency & Coherence</td>
            ${formatCell(report.fluency_coherence, 'Limited')}
            ${formatCell(report.fluency_coherence, 'Moderate')}
            ${formatCell(report.fluency_coherence, 'Good')}
            ${formatCell(report.fluency_coherence, 'Excellent')}
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Lexical Resources</td>
            ${formatCell(report.lexical_resources, 'Limited')}
            ${formatCell(report.lexical_resources, 'Moderate')}
            ${formatCell(report.lexical_resources, 'Good')}
            ${formatCell(report.lexical_resources, 'Excellent')}
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Grammatical Range & Accuracy</td>
            ${formatCell(report.grammatical_range, 'Limited')}
            ${formatCell(report.grammatical_range, 'Moderate')}
            ${formatCell(report.grammatical_range, 'Good')}
            ${formatCell(report.grammatical_range, 'Excellent')}
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Pronunciation</td>
            ${formatCell(report.pronunciation, 'Limited')}
            ${formatCell(report.pronunciation, 'Moderate')}
            ${formatCell(report.pronunciation, 'Good')}
            ${formatCell(report.pronunciation, 'Excellent')}
          </tr>
        </tbody>
      </table>

      <!-- Overall Band Score Banner -->
      <div style="background-color: #fef2f2; border: 2px solid #E10600; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
        <span style="font-size: 14px; font-weight: bold; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">OVERALL IELTS SPEAKING BAND SCORE:</span>
        <span style="font-size: 28px; font-weight: bold; color: #E10600; margin-left: 12px;">${report.overall_band_score}</span>
      </div>

      <!-- Feedback -->
      ${report.suggestions ? `
        <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #E10600; border-radius: 4px; padding: 14px; margin: 16px 0;">
          <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px;">Examiner Suggestions & Improvements:</h4>
          <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap;">${report.suggestions}</p>
        </div>
      ` : ''}

      ${report.additional_comments ? `
        <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #0f172a; border-radius: 4px; padding: 14px; margin: 16px 0;">
          <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px;">Additional Comments:</h4>
          <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap;">${report.additional_comments}</p>
        </div>
      ` : ''}

      <p style="margin-top: 28px; font-size: 15px;">
        Best regards,<br/>
        <strong>YES Academy</strong><br/>
        <span style="font-size: 13px; color: #64748b;">Better English. Brighter Future.</span>
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin: 0;">
        YES Academy &copy; ${new Date().getFullYear()} | IELTS Preparation Program &bull; Dhaka, Bangladesh
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
      subject: `YES Academy | IELTS Speaking Score Report – ${report.student_name}`,
      html,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    })

    return { success: true }
  } catch (err: any) {
    console.error('Nodemailer error sending IELTS report:', err)
    return { success: false, message: err.message || 'Unknown email sending error' }
  }
}
