'use client'

import { useEffect, useState } from 'react'

export default function CRMPrintPage() {
  const [printData, setPrintData] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = sessionStorage.getItem('crmPrintData')
      if (data) {
        setPrintData(JSON.parse(data))
        setTimeout(() => window.print(), 500)
      }
    }
  }, [])

  if (!printData) return <div className="p-10 text-center">Loading print data...</div>

  return (
    <div className="invoice-safe-zone bg-white min-h-screen p-8 text-black font-sans" style={{ color: 'black', backgroundColor: 'white' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { color-scheme: light !important; }
        html, body { background: white !important; background-color: white !important; background-image: none !important; }
        .invoice-safe-zone, .invoice-safe-zone h1, .invoice-safe-zone h2, .invoice-safe-zone h3, .invoice-safe-zone p, .invoice-safe-zone span, .invoice-safe-zone td, .invoice-safe-zone th, .invoice-safe-zone div {
          color: black !important; -webkit-text-fill-color: black !important; text-fill-color: black !important; background-image: none !important; background: transparent !important;
        }
        .invoice-safe-zone thead tr { background-color: transparent !important; background: none !important; -webkit-text-fill-color: black !important; }
        .invoice-safe-zone thead th { background-color: transparent !important; color: black !important; }
        .invoice-safe-zone .border-black, .invoice-safe-zone tr { border-color: black !important; }
        .invoice-safe-zone .border-y { border-top-width: 1px !important; border-bottom-width: 1px !important; border-top-style: solid !important; border-bottom-style: solid !important; }
        .invoice-safe-zone .border-b { border-bottom-width: 1px !important; border-bottom-style: solid !important; }
        @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .print\\:hidden { display: none !important; } }
      `}} />

      <div className="max-w-5xl mx-auto p-10 relative bg-white" style={{ backgroundColor: 'white' }}>
        
        <div className="absolute top-4 right-4 print:hidden">
          <button onClick={() => { if(typeof window !== 'undefined') window.print(); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors" style={{ color: 'white', WebkitTextFillColor: 'white' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Report
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-black tracking-tight text-black" style={{ color: 'black' }}>
            YES ACADEMY
          </div>
          <div className="mt-4 inline-block border border-black px-4 py-1 font-bold tracking-widest text-sm text-black uppercase">
            CRM {printData.tab} REPORT
          </div>
        </div>
        
        <hr className="border-t border-gray-300 mb-8" />

        <div className="flex justify-between items-start mb-8 text-sm text-black">
          <div>
            <p className="mb-1 font-bold">Report Context: <span className="font-medium">{printData.filterContext}</span></p>
            {(printData.tab === 'Sales' || printData.tab === 'Expenses') && (
              <p className="font-bold text-lg mt-2">Total Amount: ৳ {(printData.totalAmount || 0).toLocaleString()}</p>
            )}
            {printData.tab === 'Conversion' && printData.conversion && (
              <p className="font-bold text-lg mt-2">Conversion Rate: {printData.conversion.rate}%</p>
            )}
          </div>
          <div className="text-right">
            <p className="mb-1 font-medium">Generated On:</p>
            <p>Date: {printData.dateStr}</p>
            <p>Time: {printData.timeStr}</p>
          </div>
        </div>

        {/* DATA RENDERING */}
        {(printData.tab === 'Sales' || printData.tab === 'Expenses') && printData.filteredData && (
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-y border-black text-left text-sm uppercase tracking-wider font-bold">
                <th className="py-2 px-2 text-left">Date</th>
                <th className="py-2 px-2 text-left">Type</th>
                <th className="py-2 px-2 text-left">Item</th>
                {printData.tab === 'Sales' && <th className="py-2 px-2 text-left">Student</th>}
                <th className="py-2 px-2 text-left">Method</th>
                {printData.tab === 'Sales' && <th className="py-2 px-2 text-right">Fee</th>}
                {printData.tab === 'Sales' && <th className="py-2 px-2 text-right">Due</th>}
                <th className="py-2 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/20">
              {printData.filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">No transactions found for this period.</td>
                </tr>
              ) : printData.filteredData.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-3 px-2 text-sm">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                  <td className="py-3 px-2 text-sm">{item.type}</td>
                  <td className="py-3 px-2 text-sm">{item.item_name}</td>
                  {printData.tab === 'Sales' && (
                    <td className="py-3 px-2 text-sm">
                      <p className="font-bold">{item.student_name}</p>
                      <p className="text-xs">{item.phone}</p>
                    </td>
                  )}
                  <td className="py-3 px-2 text-sm">{item.payment_method}</td>
                  {printData.tab === 'Sales' && (
                    <td className="py-3 px-2 text-sm text-right">{item.total_fee > 0 ? `৳${item.total_fee.toLocaleString()}` : '-'}</td>
                  )}
                  {printData.tab === 'Sales' && (
                    <td className="py-3 px-2 text-sm text-right text-red-600 font-bold" style={{ color: '#dc2626', WebkitTextFillColor: '#dc2626' }}>
                      {item.due_amount > 0 ? `৳${item.due_amount.toLocaleString()}` : '-'}
                    </td>
                  )}
                  <td className="py-3 px-2 text-sm font-bold text-right">
                    ৳{item.paid_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {printData.tab === 'Conversion' && printData.conversion && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-gray-50 border border-black p-4 font-bold text-lg">
              <span>Total Leads: {printData.conversion.totalLeads}</span>
              <span>Total Walk-ins: {printData.conversion.totalWalkins}</span>
              <span>Converted: {printData.conversion.converted}</span>
            </div>

            {printData.conversion.convertedRecords && printData.conversion.convertedRecords.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-4 uppercase border-b border-black pb-2">Converted Students List</h3>
                <table className="w-full mb-8 border-collapse">
                  <thead>
                    <tr className="border-y border-black text-left text-sm uppercase tracking-wider font-bold">
                      <th className="py-2 px-2 text-left">Student</th>
                      <th className="py-2 px-2 text-left">Phone</th>
                      <th className="py-2 px-2 text-left">Lead By</th>
                      <th className="py-2 px-2 text-left">Walk-in By</th>
                      <th className="py-2 px-2 text-left">Service/Course</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/20">
                    {printData.conversion.convertedRecords.map((r: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-3 px-2 text-sm font-bold">{r.lead.student_name}</td>
                        <td className="py-3 px-2 text-sm">{r.lead.phone}</td>
                        <td className="py-3 px-2 text-sm">{r.lead.lead_call_person || '-'}</td>
                        <td className="py-3 px-2 text-sm">{r.walkin.lead_call_person || '-'}</td>
                        <td className="py-3 px-2 text-sm">{r.walkin.interested_course || r.lead.interested_course || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {printData.tab === 'Reference' && printData.reference && (
          <div className="space-y-8">
            {['Admission', 'LeadPerson', 'WalkinHandledBy'].map((refType) => {
              const refs = printData.reference[refType]
              if (!refs || refs.length === 0) return null
              
              const title = refType === 'Admission' ? 'Admission References' : refType === 'LeadPerson' ? 'Lead Calls By Staff' : 'Walk-ins Handled By'
              
              return (
                <div key={refType} className="mb-8">
                  <h3 className="font-bold text-lg mb-4 uppercase border-b border-black pb-2">{title}</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-black text-left text-sm uppercase tracking-wider font-bold">
                        <th className="py-2 px-2 text-left">Name</th>
                        <th className="py-2 px-2 text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/20">
                      {refs.map((ref: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 px-2 text-sm font-bold">{ref.name}</td>
                          <td className="py-2 px-2 text-sm font-bold text-right">{ref.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
