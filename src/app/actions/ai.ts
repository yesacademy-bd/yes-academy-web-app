'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateAIFeedback(reportData: any, prompt: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' })

    const systemContext = `
You are an AI assistant helping a Business Development Manager (BDM) write a feedback reply to a teacher's class report.
Here is the teacher's report data:
- Batch: ${reportData.batches?.batch_name}
- Course: ${reportData.batches?.courses?.name}
- Last Class Summary: ${reportData.last_class_summary}
- Today's Given Lessons: ${reportData.todays_lessons}
- Taken Class Tests: ${reportData.class_tests}
- Given Homework: ${reportData.homework}

The BDM's instruction for the reply is: "${prompt}"

Draft a professional, concise reply directly addressing the teacher based strictly on the BDM's instruction and the context of the report. Do not include subject lines or formal letter sign-offs, just the body of the feedback message.
`

    const result = await model.generateContent(systemContext)
    const response = await result.response
    const text = response.text()

    return { success: true, data: text }
  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return { success: false, message: error.message }
  }
}
