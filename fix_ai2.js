const fs = require('fs');
let code = fs.readFileSync('src/app/actions/ai.ts', 'utf8');

const newAction = `
export async function generateAutoFeedback(reportData: any) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.')
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' })

    const systemContext = \`
You are an AI assistant helping a Business Development Manager (BDM) evaluate a teacher's class report.
The report has 4 sections:
1. Last Class Summary: \${reportData.last_class_summary}
2. Today's Given Lessons: \${reportData.todays_lessons}
3. Taken Class Tests: \${reportData.class_tests}
4. Given Homework: \${reportData.homework}

Task: Evaluate the report and generate a constructive BDM feedback/reply.
For each of the 4 sections, check if the teacher provided an answer, if it's complete, relevant, clear, detailed, and check for grammar/spelling. Do not judge solely on length.

Structure your response EXACTLY as follows:

**Overall Feedback:**
[Brief overall assessment]

**1. Last Class Summary:**
[Feedback on completeness, relevance, clarity, language]

**2. Today's Given Lessons:**
[Feedback on whether lesson details are explained and relevant]

**3. Taken Class Tests:**
[Feedback on test info]

**4. Given Homework:**
[Feedback on homework info]

**Language & Grammar:**
[Mention important spelling, grammar, or sentence-structure issues if found]

**BDM Suggestions:**
[Clear and constructive suggestions for improving future reports]

Maintain a professional, respectful, and constructive tone. Do not insult or use overly harsh language. Do not just repeat the report. Be concise but useful.
\`

    const result = await model.generateContent(systemContext)
    const response = await result.response
    const text = response.text()

    return { success: true, data: text }
  } catch (error: any) {
    console.error('Auto AI Generation Error:', error)
    return { success: false, message: error.message }
  }
}
`;

if (!code.includes('generateAutoFeedback')) {
  code = code + '\n' + newAction;
  fs.writeFileSync('src/app/actions/ai.ts', code);
}
