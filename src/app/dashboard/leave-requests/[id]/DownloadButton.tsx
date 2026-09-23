'use client'

import { Download } from 'lucide-react'

export default function DownloadButton({ id, employeeName, requestDate }: { id: string, employeeName: string, requestDate: string }) {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Formulate a safe filename
    const safeName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
    const safeDate = requestDate.replace(/\//g, '-');
    const filename = `Leave_Request_${safeName}_${safeDate}.pdf`;

    const url = `/dashboard/leave-requests/${id}/print?download=true&filename=${encodeURIComponent(filename)}`;
    const features = 'width=900,height=1000,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes';
    window.open(url, 'download_window', features);
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
