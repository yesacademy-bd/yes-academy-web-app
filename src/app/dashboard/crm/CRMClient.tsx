'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet, Printer } from 'lucide-react'
import CRMSummaryCharts from '@/components/batches/CRMSummaryCharts'

export default function CRMClient({ initialData }: { initialData: any[] }) {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [filterMethod, setFilterMethod] = useState('All')
  
  const data = useMemo(() => {
    return initialData.filter(item => {
      const d = new Date(item.date)
      const matchDate = d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
      const matchMethod = filterMethod === 'All' || item.payment_method === filterMethod
      return matchDate && matchMethod
    })
  }, [initialData, selectedYear, selectedMonth, filterMethod])

  // Calculate analytics
  const totalSales = useMemo(() => data.filter(e => e.type !== 'Expense').reduce((sum, e) => sum + e.paid_amount, 0), [data])
  const totalExpenses = useMemo(() => data.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.paid_amount, 0), [data])
  const netProfit = totalSales - totalExpenses

  const handlePrint = () => {
    window.print()
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between print:hidden">
        <div className="flex gap-4">
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select 
            value={filterMethod} 
            onChange={e => setFilterMethod(e.target.value)}
            className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="All">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="bKash">bKash</option>
            <option value="Bank">Bank</option>
          </select>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:border-black">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center print:hidden">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 print:text-black">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-900 print:text-black">৳{totalSales.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:border-black">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center print:hidden">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 print:text-black">Total Expenses</p>
              <h3 className="text-2xl font-bold text-gray-900 print:text-black">৳{totalExpenses.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:border-black">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center print:hidden">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 print:text-black">Net Profit</p>
              <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'} print:text-black`}>
                ৳{netProfit.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts (Hidden on print) */}
      <CRMSummaryCharts initialData={initialData} selectedYear={selectedYear} />

      {/* Unified Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 border-b border-gray-200 bg-gray-50 print:bg-white print:border-black">
          <h3 className="font-semibold text-gray-900 print:text-black">
            Unified Transaction Report - {months[selectedMonth]} {selectedYear}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold print:bg-white print:text-black print:border-black">
                <th className="p-4 print:p-2 border-r print:border-black">Date</th>
                <th className="p-4 print:p-2 border-r print:border-black">Type</th>
                <th className="p-4 print:p-2 border-r print:border-black">Item / Desc</th>
                <th className="p-4 print:p-2 border-r print:border-black">Student</th>
                <th className="p-4 print:p-2 border-r print:border-black">Method</th>
                <th className="p-4 print:p-2 border-r print:border-black text-right">Fee</th>
                <th className="p-4 print:p-2 border-r print:border-black text-right">Due</th>
                <th className="p-4 print:p-2 text-right">Amount (Paid/Exp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 print:divide-black">
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 print:text-black">No transactions found for this period.</td>
                </tr>
              )}
              {data.map((item, idx) => (
                <tr key={`${item.id}-${idx}`} className="hover:bg-gray-50 print:hover:bg-white">
                  <td className="p-4 print:p-2 text-sm text-gray-900 print:text-black border-r print:border-black whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 print:p-2 text-sm border-r print:border-black">
                    <span className={`px-2 py-1 rounded text-xs font-medium print:bg-transparent print:p-0 ${
                      item.type === 'Expense' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 print:p-2 text-sm text-gray-600 print:text-black border-r print:border-black">
                    {item.item_name}
                  </td>
                  <td className="p-4 print:p-2 border-r print:border-black">
                    <p className="text-sm font-medium text-gray-900 print:text-black">{item.student_name}</p>
                    <p className="text-xs text-gray-500 print:text-black">{item.phone}</p>
                  </td>
                  <td className="p-4 print:p-2 text-sm text-gray-600 print:text-black border-r print:border-black">
                    {item.payment_method}
                  </td>
                  <td className="p-4 print:p-2 text-sm text-gray-600 print:text-black border-r print:border-black text-right">
                    {item.total_fee > 0 ? `৳${item.total_fee.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-4 print:p-2 text-sm text-red-600 font-medium print:text-black border-r print:border-black text-right">
                    {item.due_amount > 0 ? `৳${item.due_amount.toLocaleString()}` : '-'}
                  </td>
                  <td className={`p-4 print:p-2 text-sm font-bold text-right ${
                    item.type === 'Expense' ? 'text-red-600' : 'text-green-600'
                  } print:text-black`}>
                    {item.type === 'Expense' ? '-' : '+'}৳{item.paid_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot>
              <tr className="bg-gray-50 print:bg-white font-bold text-gray-900 print:text-black border-t-2 border-gray-300 print:border-black">
                <td colSpan={7} className="p-4 print:p-2 text-right border-r print:border-black">Total Sales for Period:</td>
                <td className="p-4 print:p-2 text-right text-green-600 print:text-black">+৳{totalSales.toLocaleString()}</td>
              </tr>
              <tr className="bg-gray-50 print:bg-white font-bold text-gray-900 print:text-black border-t border-gray-300 print:border-black">
                <td colSpan={7} className="p-4 print:p-2 text-right border-r print:border-black">Total Expenses for Period:</td>
                <td className="p-4 print:p-2 text-right text-red-600 print:text-black">-৳{totalExpenses.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
