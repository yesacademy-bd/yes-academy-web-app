import { jsPDF } from 'jspdf'

export type IeltsReportData = {
  id?: string
  student_name: string
  student_email?: string | null
  candidate_number?: string | null
  student_type?: string | null
  batch_number?: string | null
  phone?: string | null
  trainer_name: string
  test_date: string
  report_date?: string
  fluency_coherence: string // 'Limited' | 'Moderate' | 'Good' | 'Excellent'
  lexical_resources: string
  grammatical_range: string
  pronunciation: string
  overall_band_score: string
  suggestions?: string | null
  additional_comments?: string | null
}

export function generateIeltsSpeakingPdfBuffer(report: IeltsReportData): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const primaryRed: [number, number, number] = [225, 6, 0]
  const darkNavy: [number, number, number] = [15, 23, 42]
  const slateBorder: [number, number, number] = [203, 213, 225]
  const lightBg: [number, number, number] = [248, 250, 252]
  const activeGreen: [number, number, number] = [22, 101, 52]

  const margin = 14
  const pageWidth = 210
  const contentWidth = pageWidth - margin * 2

  // Top Accent Bar
  doc.setFillColor(...primaryRed)
  doc.rect(margin, 12, contentWidth, 3, 'F')

  // Header Titles
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...primaryRed)
  doc.text('YES ACADEMY', margin, 24)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...darkNavy)
  doc.text('IELTS SPEAKING SCORE REPORT', margin, 32)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('STUDENT PERFORMANCE & CRITERIA EVALUATION', margin, 37)

  // Candidate Information Box
  const infoY = 42
  const infoH = 26
  doc.setFillColor(...lightBg)
  doc.setDrawColor(...slateBorder)
  doc.roundedRect(margin, infoY, contentWidth, infoH, 2, 2, 'FD')

  // Column 1: Student Name & Email
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('STUDENT NAME', margin + 5, infoY + 6)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkNavy)
  doc.text(report.student_name || 'N/A', margin + 5, infoY + 12)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('STUDENT EMAIL', margin + 5, infoY + 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkNavy)
  doc.text(report.student_email || 'N/A', margin + 5, infoY + 23)

  // Column 2: Candidate / Batch & Test Date
  const col2X = margin + 65
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('CANDIDATE / BATCH', col2X, infoY + 6)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkNavy)
  const candBatch = [report.candidate_number, report.batch_number].filter(Boolean).join(' / ') || 'N/A'
  doc.text(candBatch, col2X, infoY + 12)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('TEST DATE', col2X, infoY + 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkNavy)
  doc.text(report.test_date || new Date().toISOString().split('T')[0], col2X, infoY + 23)

  // Column 3: Examiner & Student Type
  const col3X = margin + 125
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('EXAMINER / FACULTY', col3X, infoY + 6)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkNavy)
  doc.text(report.trainer_name || 'YES Academy Faculty', col3X, infoY + 12)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('STUDENT TYPE', col3X, infoY + 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkNavy)
  doc.text(report.student_type || 'Inhouse', col3X, infoY + 23)

  // Criteria Table
  const tableY = 74
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkNavy)
  doc.text('IELTS SPEAKING ASSESSMENT CRITERIA', margin, tableY)

  const colW = [62, 30, 30, 30, 30] // total 182mm
  const levels = ['Limited', 'Moderate', 'Good', 'Excellent']
  const rows = [
    { name: 'Fluency & Coherence', key: 'fluency_coherence' as const },
    { name: 'Lexical Resources', key: 'lexical_resources' as const },
    { name: 'Grammatical Range & Accuracy', key: 'grammatical_range' as const },
    { name: 'Pronunciation', key: 'pronunciation' as const },
  ]

  let currentY = tableY + 4
  const rowH = 12

  // Table Header
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, currentY, contentWidth, 8, 'F')
  doc.setDrawColor(...slateBorder)
  doc.rect(margin, currentY, contentWidth, 8, 'S')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkNavy)
  doc.text('AREA OF SCORING', margin + 4, currentY + 5.5)

  let curX = margin + colW[0]
  levels.forEach((lvl, i) => {
    doc.text(lvl.toUpperCase(), curX + colW[i + 1] / 2, currentY + 5.5, { align: 'center' })
    curX += colW[i + 1]
  })

  currentY += 8

  // Table Body Rows
  rows.forEach((r, idx) => {
    const selectedLevel = (report[r.key] || '').toLowerCase()

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, currentY, contentWidth, rowH, 'F')
    }
    doc.setDrawColor(...slateBorder)
    doc.rect(margin, currentY, contentWidth, rowH, 'S')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkNavy)
    doc.text(r.name, margin + 4, currentY + 7.5)

    curX = margin + colW[0]
    levels.forEach((lvl, i) => {
      doc.setDrawColor(...slateBorder)
      doc.line(curX, currentY, curX, currentY + rowH)

      const isSelected = selectedLevel === lvl.toLowerCase()
      if (isSelected) {
        doc.setFillColor(220, 252, 231) // Light green indicator
        doc.rect(curX + 1, currentY + 1, colW[i + 1] - 2, rowH - 2, 'F')

        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...activeGreen)
        doc.text('[ YES ]', curX + colW[i + 1] / 2, currentY + 7.5, { align: 'center' })
      } else {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(148, 163, 184)
        doc.text('-', curX + colW[i + 1] / 2, currentY + 7.5, { align: 'center' })
      }

      curX += colW[i + 1]
    })

    currentY += rowH
  })

  // Overall Band Score Banner
  currentY += 6
  const scoreBoxH = 18
  doc.setFillColor(254, 242, 242)
  doc.setDrawColor(...primaryRed)
  doc.roundedRect(margin, currentY, contentWidth, scoreBoxH, 2, 2, 'FD')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkNavy)
  doc.text('OVERALL IELTS SPEAKING BAND SCORE:', margin + 8, currentY + 11)

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryRed)
  doc.text(String(report.overall_band_score || '-'), margin + 95, currentY + 12.5)

  currentY += scoreBoxH + 6

  // Suggestions Box
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkNavy)
  doc.text('EXAMINER SUGGESTIONS & IMPROVEMENTS', margin, currentY)
  currentY += 3

  const suggH = 34
  doc.setFillColor(...lightBg)
  doc.setDrawColor(...slateBorder)
  doc.roundedRect(margin, currentY, contentWidth, suggH, 2, 2, 'FD')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkNavy)
  const suggText = report.suggestions || 'No specific suggestions noted.'
  const wrappedSugg = doc.splitTextToSize(suggText, contentWidth - 8)
  doc.text(wrappedSugg, margin + 4, currentY + 6)

  currentY += suggH + 6

  // Additional Comments Box
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkNavy)
  doc.text('ADDITIONAL EXAMINER COMMENTS', margin, currentY)
  currentY += 3

  const commH = 30
  doc.setFillColor(...lightBg)
  doc.setDrawColor(...slateBorder)
  doc.roundedRect(margin, currentY, contentWidth, commH, 2, 2, 'FD')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkNavy)
  const commText = report.additional_comments || 'None.'
  const wrappedComm = doc.splitTextToSize(commText, contentWidth - 8)
  doc.text(wrappedComm, margin + 4, currentY + 6)

  // Footer
  const footerY = 280
  doc.setDrawColor(...slateBorder)
  doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('YES ACADEMY -- Better English. Brighter Future.', margin, footerY)
  doc.text(
    `Report generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    margin + contentWidth,
    footerY,
    { align: 'right' }
  )

  return Buffer.from(doc.output('arraybuffer'))
}
