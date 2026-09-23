'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function DownloadButton({ id, employeeName, requestDate }: { id: string, employeeName: string, requestDate: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDownloading) return;
    
    setIsDownloading(true);

    try {
      // Formulate a safe filename
      const safeName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
      const safeDate = requestDate.replace(/\//g, '-');
      const filename = `Leave_Request_${safeName}_${safeDate}.pdf`;

      // Fetch the print page's HTML
      const response = await fetch(`/dashboard/leave-requests/${id}/print`);
      const htmlText = await response.text();

      // Parse HTML to get just the body content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      // Create a hidden div in the current document to hold the content
      // We avoid iframes because html2canvas often freezes or hangs when rendering cross-document/iframe elements
      const container = document.createElement('div');
      container.innerHTML = doc.body.innerHTML;
      
      // Clean out all script tags to prevent Next.js from trying to hydrate or run print() dialogs
      const scripts = container.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        scripts[i].parentNode?.removeChild(scripts[i]);
      }

      // Apply off-screen styling
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '900px'; 
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '20px';
      container.style.color = '#000000'; // ensure text is black
      
      document.body.appendChild(container);

      // Dynamically import html2pdf so it doesn't block page load
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default ? html2pdfModule.default : html2pdfModule;

      const opt = {
        margin:       0.5,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // Generate the PDF
      await html2pdf().set(opt).from(container).save();

      // Cleanup
      document.body.removeChild(container);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isDownloading}
      className={`inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors shadow-sm ${isDownloading ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {isDownloading ? 'Generating PDF...' : 'Download Form'}
    </button>
  )
}
