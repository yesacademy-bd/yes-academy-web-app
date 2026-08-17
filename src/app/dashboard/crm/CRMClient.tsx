'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Printer, CalendarDays, Filter, X } from 'lucide-react'
import CRMSummaryCharts from '@/components/batches/CRMSummaryCharts'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts'

export default function CRMClient({ 
  initialData, 
  initialLeads, 
  initialWalkins 
}: { 
  initialData: any[],
  initialLeads: any[],
  initialWalkins: any[]
}) {
  const currentDate = new Date()
  
  // Toggles
  const [activeTab, setActiveTab] = useState<'Sales' | 'Expenses'>('Sales')
  
  // Filters
  const [dateFilterMode, setDateFilterMode] = useState<'Month' | '7Days' | '15Days'>('Month')
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [filterMethod, setFilterMethod] = useState('All')
  const [selectedRef, setSelectedRef] = useState<string | null>(null)
  
  // Modals
  const [showDueModal, setShowDueModal] = useState(false)
  const [showDailyModal, setShowDailyModal] = useState(false)

  // Top 3 References
  const topReferences = useMemo(() => {
    const counts: Record<string, number> = {}
    initialData.forEach(item => {
      if (item.type === 'Enrollment' && item.reference && item.reference !== 'None') {
        counts[item.reference] = (counts[item.reference] || 0) + 1
      }
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0])
  }, [initialData])

  // Filter Data
  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      const d = new Date(item.date)
      let matchDate = false
      
      if (dateFilterMode === 'Month') {
        matchDate = d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
      } else if (dateFilterMode === '7Days') {
        const diffTime = Math.abs(currentDate.getTime() - d.getTime())
        matchDate = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 7
      } else if (dateFilterMode === '15Days') {
        const diffTime = Math.abs(currentDate.getTime() - d.getTime())
        matchDate = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 15
      }

      const matchTab = activeTab === 'Expenses' ? item.type === 'Expense' : item.type !== 'Expense'
      const matchMethod = filterMethod === 'All' || item.payment_method === filterMethod
      const matchRef = !selectedRef || item.reference === selectedRef

      return matchDate && matchTab && matchMethod && matchRef
    })
  }, [initialData, selectedYear, selectedMonth, dateFilterMode, activeTab, filterMethod, selectedRef, currentDate])

  const totalAmount = useMemo(() => filteredData.reduce((sum, e) => sum + e.paid_amount, 0), [filteredData])
  const totalDue = useMemo(() => filteredData.reduce((sum, e) => sum + (e.due_amount || 0), 0), [filteredData])
  const dueStudents = useMemo(() => filteredData.filter(e => e.due_amount > 0), [filteredData])

  // Lead vs Walk-in Data
  const leadWalkinData = useMemo(() => {
    const counts: Record<string, { Leads: number, Walkins: number }> = {}
    
    const addToCounts = (arr: any[], type: 'Leads' | 'Walkins') => {
      arr.forEach(item => {
        const d = new Date(item.created_at)
        let include = false
        
        if (dateFilterMode === 'Month') {
          include = d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
        } else if (dateFilterMode === '7Days') {
          const diff = Math.ceil(Math.abs(currentDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
          include = diff <= 7
        } else if (dateFilterMode === '15Days') {
          const diff = Math.ceil(Math.abs(currentDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
          include = diff <= 15
        }

        if (include) {
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          if (!counts[dateStr]) counts[dateStr] = { Leads: 0, Walkins: 0 }
          counts[dateStr][type] += 1
        }
      })
    }

    addToCounts(initialLeads, 'Leads')
    addToCounts(initialWalkins, 'Walkins')
    
    return Object.entries(counts).map(([name, data]) => ({ name, ...data }))
  }, [initialLeads, initialWalkins, dateFilterMode, selectedYear, selectedMonth, currentDate])

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <div className="space-y-6">
      
      {/* Top Level Tabs */}
      <div className="flex gap-4 border-b border-gray-200 print:hidden">
        <button 
          onClick={() => { setActiveTab('Sales'); setFilterMethod('All'); setSelectedRef(null); }}
          className={`pb-4 px-2 font-medium text-lg border-b-2 transition-colors ${activeTab === 'Sales' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Total Sales
        </button>
        <button 
          onClick={() => { setActiveTab('Expenses'); setFilterMethod('All'); setSelectedRef(null); }}
          className={`pb-4 px-2 font-medium text-lg border-b-2 transition-colors ${activeTab === 'Expenses' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Total Expenses
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between print:hidden">
        <div className="flex flex-wrap gap-4 items-center">
          
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setDateFilterMode('Month')} className={`px-3 py-1 text-sm font-medium rounded-md ${dateFilterMode === 'Month' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Month</button>
            <button onClick={() => setDateFilterMode('7Days')} className={`px-3 py-1 text-sm font-medium rounded-md ${dateFilterMode === '7Days' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>7 Days</button>
            <button onClick={() => setDateFilterMode('15Days')} className={`px-3 py-1 text-sm font-medium rounded-md ${dateFilterMode === '15Days' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>15 Days</button>
          </div>

          {dateFilterMode === 'Month' && (
            <>
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}

          <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="All">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="bKash">bKash</option>
            <option value="Bank">Bank</option>
          </select>

          {activeTab === 'Sales' && topReferences.length > 0 && (
            <div className="flex items-center gap-2 border-l pl-4">
              <span className="text-sm text-gray-500 flex items-center gap-1"><Filter className="w-4 h-4"/> Top Refs:</span>
              {topReferences.map(ref => (
                <button 
                  key={ref} 
                  onClick={() => setSelectedRef(selectedRef === ref ? null : ref)}
                  className={`text-xs px-2 py-1 rounded-full border ${selectedRef === ref ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  {ref}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setShowDailyModal(true)} className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors">
            <CalendarDays className="w-4 h-4" /> Day-wise Data
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:border-black">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center print:hidden ${activeTab === 'Sales' ? 'bg-green-100' : 'bg-red-100'}`}>
              {activeTab === 'Sales' ? <TrendingUp className="w-6 h-6 text-green-600" /> : <TrendingDown className="w-6 h-6 text-red-600" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 print:text-black">
                {activeTab === 'Sales' ? 'Total Sales Amount' : 'Total Expense Amount'}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 print:text-black">৳{totalAmount.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {activeTab === 'Sales' ? (
          <div 
            onClick={() => setShowDueModal(true)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-red-300 cursor-pointer transition-colors print:border-black flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center print:hidden">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 print:text-black">Total Due (Click for Details)</p>
              <h3 className="text-2xl font-bold text-red-600 print:text-black">৳{totalDue.toLocaleString()}</h3>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Lead Call vs Walk-in</h3>
            {leadWalkinData.length > 0 ? (
              <div className="h-[60px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={leadWalkinData}>
                    <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                    <Line type="monotone" dataKey="Leads" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Walkins" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No inquiry data for this period.</p>
            )}
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Leads</span>
              <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Walk-ins</span>
            </div>
          </div>
        )}
      </div>

      {/* Charts (Hidden on print) */}
      <div className="print:hidden space-y-6">
        <CRMSummaryCharts 
          filteredData={filteredData}
          selectedYear={selectedYear} 
          selectedMonth={selectedMonth}
          dateFilterMode={dateFilterMode}
          activeTab={activeTab}
        />
      </div>

      {/* Unified Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 border-b border-gray-200 bg-gray-50 print:bg-white print:border-black">
          <h3 className="font-semibold text-gray-900 print:text-black">
            {activeTab} Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold print:bg-white print:text-black print:border-black">
                <th className="p-4 print:p-2 border-r print:border-black">Date</th>
                <th className="p-4 print:p-2 border-r print:border-black">Type / Category</th>
                <th className="p-4 print:p-2 border-r print:border-black">Description / Item</th>
                {activeTab === 'Sales' && <th className="p-4 print:p-2 border-r print:border-black">Student</th>}
                <th className="p-4 print:p-2 border-r print:border-black">Method</th>
                {activeTab === 'Sales' && <th className="p-4 print:p-2 border-r print:border-black text-right">Fee</th>}
                {activeTab === 'Sales' && <th className="p-4 print:p-2 border-r print:border-black text-right">Due</th>}
                <th className="p-4 print:p-2 text-right">Paid Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 print:divide-black">
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 print:text-black">No transactions found for this period.</td>
                </tr>
              )}
              {filteredData.map((item, idx) => (
                <tr key={`${item.id}-${idx}`} className="hover:bg-gray-50 print:hover:bg-white">
                  <td className="p-4 print:p-2 text-sm text-gray-900 print:text-black border-r print:border-black whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 print:p-2 text-sm border-r print:border-black text-gray-600 print:text-black">
                    {item.type}
                  </td>
                  <td className="p-4 print:p-2 text-sm text-gray-600 print:text-black border-r print:border-black">
                    {item.item_name}
                  </td>
                  {activeTab === 'Sales' && (
                    <td className="p-4 print:p-2 border-r print:border-black">
                      <p className="text-sm font-medium text-gray-900 print:text-black">{item.student_name}</p>
                      <p className="text-xs text-gray-500 print:text-black">{item.phone}</p>
                    </td>
                  )}
                  <td className="p-4 print:p-2 text-sm text-gray-600 print:text-black border-r print:border-black">
                    {item.payment_method}
                  </td>
                  {activeTab === 'Sales' && (
                    <td className="p-4 print:p-2 text-sm text-gray-600 print:text-black border-r print:border-black text-right">
                      {item.total_fee > 0 ? `৳${item.total_fee.toLocaleString()}` : '-'}
                    </td>
                  )}
                  {activeTab === 'Sales' && (
                    <td className="p-4 print:p-2 text-sm text-red-600 font-medium print:text-black border-r print:border-black text-right">
                      {item.due_amount > 0 ? `৳${item.due_amount.toLocaleString()}` : '-'}
                    </td>
                  )}
                  <td className={`p-4 print:p-2 text-sm font-bold text-right ${activeTab === 'Sales' ? 'text-green-600' : 'text-red-600'} print:text-black`}>
                    ৳{item.paid_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Due Details */}
      {showDueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Students with Pending Dues</h3>
              <button onClick={() => setShowDueModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-3">Student</th>
                    <th className="p-3">Item</th>
                    <th className="p-3 text-right">Due Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dueStudents.map((s, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <p className="text-sm font-medium text-gray-900">{s.student_name}</p>
                        <p className="text-xs text-gray-500">{s.phone}</p>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{s.item_name}</td>
                      <td className="p-3 text-sm font-bold text-red-600 text-right">৳{s.due_amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Daily Report */}
      {showDailyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Day-wise Summary</h3>
              <button onClick={() => setShowDailyModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 overflow-y-auto">
              {/* Calculate daily stats */}
              {(() => {
                const dailyStats: Record<string, { earnings: number, dues: number, count: number }> = {}
                filteredData.forEach(item => {
                  const dateStr = new Date(item.date).toLocaleDateString()
                  if (!dailyStats[dateStr]) dailyStats[dateStr] = { earnings: 0, dues: 0, count: 0 }
                  dailyStats[dateStr].earnings += item.paid_amount
                  dailyStats[dateStr].dues += item.due_amount || 0
                  dailyStats[dateStr].count += 1
                })
                const sortedDays = Object.entries(dailyStats).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())

                return (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <th className="p-3">Date</th>
                        <th className="p-3">Transactions</th>
                        <th className="p-3 text-right text-green-600">Earnings</th>
                        {activeTab === 'Sales' && <th className="p-3 text-right text-red-600">Dues Added</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedDays.map(([date, stats], idx) => (
                        <tr key={idx}>
                          <td className="p-3 text-sm font-medium text-gray-900">{date}</td>
                          <td className="p-3 text-sm text-gray-600">{stats.count}</td>
                          <td className="p-3 text-sm font-bold text-green-600 text-right">৳{stats.earnings.toLocaleString()}</td>
                          {activeTab === 'Sales' && <td className="p-3 text-sm font-bold text-red-600 text-right">৳{stats.dues.toLocaleString()}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
