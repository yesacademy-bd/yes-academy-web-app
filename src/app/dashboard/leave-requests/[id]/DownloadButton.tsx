'use client'

import { Download } from 'lucide-react'

export default function DownloadButton({ id, employeeName, requestDate }: { id: string, employeeName: string, requestDate: string }) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Formulate a safe filename
    const safeName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
    const safeDate = requestDate.replace(/\//g, '-');
    const filename = `Leave_Request_${safeName}_${safeDate}.pdf`;

    // Fetch the print page's HTML
    const response = await fetch(`/dashboard/leave-requests/${id}/print`);
    const htmlText = await response.text();

    // Create an invisible iframe to render the HTML for PDF conversion
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '900px';
    iframe.style.height = '1000px';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      // Remove auto-print script so it doesn't trigger print dialog in iframe
      const cleanedHtml = htmlText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      doc.write(cleanedHtml);
      doc.close();
      
      // We will wait a bit for styles to apply and then use html2pdf
      setTimeout(() => {
        const html2pdf = require('html2pdf.js');
        const element = doc.body;
        const opt = {
          margin:       0.5,
          filename:     filename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
          document.body.removeChild(iframe);
        });
      }, 500);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors shadow-sm"
    >
      <Download className="w-4 h-4" /> Download Form
    </button>
  )
}
