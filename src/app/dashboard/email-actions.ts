'use server'

import { createClient } from '@/utils/supabase/server'
import nodemailer from 'nodemailer'

export async function sendDirectEmail(to: string, subject: string, html: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  if (!to) return { success: false, message: 'No email address provided.' }

  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS
  if (!emailUser || !emailPass) return { success: false, message: 'Email credentials are not configured in environment variables.' }

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
      to,
      subject,
      html
    })

    return { success: true }
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error while sending email' }
  }
}
