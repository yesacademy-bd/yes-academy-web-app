'use client'

import { useEffect } from 'react'

export default function AutoPrint({ download, filename }: { download?: boolean, filename?: string }) {
  useEffect(() => {
    // Small delay to ensure styles and fonts are fully loaded
    const timeout = setTimeout(() => {
      if (download && filename) {
        import('html2pdf.js').then(html2pdfModule => {
           const html2pdf = html2pdfModule.default ? html2pdfModule.default : html2pdfModule;
           const element = document.getElementById('print-container');
           if (!element) return;
           
           const opt = {
             margin: 0.5,
             filename: filename,
             image: { type: 'jpeg', quality: 0.98 },
             html2canvas: { scale: 2, useCORS: true, logging: false },
             jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
           };
           
           html2pdf().set(opt).from(element).save().then(() => {
             // Close window after download is triggered
             setTimeout(() => window.close(), 500);
           });
        }).catch(err => console.error("Error loading html2pdf", err));
      } else {
        window.print();
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [download, filename]);

  return null;
}
