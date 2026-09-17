'use client'

import { Printer } from 'lucide-react'

export default function PrintButton({ id }: { id: string }) {
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        const url = `/dashboard/leave-requests/${id}/print`;
        const features = 'width=900,height=1000,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes';
        window.open(url, 'print_window', features);
      }}
      className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm"
    >
      <Printer className="w-4 h-4" /> Print Form
    </button>
  )
}