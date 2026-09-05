'use server'

export async function submitAppointment(payload: any) {
  try {
    const webhookUrl = process.env.GOOGLE_APPOINTMENT_WEBHOOK_URL

    if (!webhookUrl) {
      console.error('GOOGLE_APPOINTMENT_WEBHOOK_URLis not set')
      return { success: false, message: 'Server configuration error. Please contact support.' }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to submit to Google Sheets')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Unknown error')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error submitting appointment:', error)
    return { success: false, message: error.message || 'Failed to submit appointment' }
  }
}

