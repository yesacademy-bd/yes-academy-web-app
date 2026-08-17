'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6']

export default function CRMSummaryCharts({ 
  filteredData, 
  selectedYear,
  selectedMonth,
  dateFilterMode,
  activeTab
}: { 
  filteredData: any[], 
  selectedYear: number,
  selectedMonth: number,
  dateFilterMode: string,
  activeTab: string
}) {
  
  // Bar Chart Data (Day-wise if Month is selected)
  const barData = useMemo(() => {
    if (dateFilterMode === 'Month') {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
      const data = Array.from({ length: daysInMonth }, (_, i) => ({ 
        name: `${i + 1}`, 
        Amount: 0 
      }))
      
      filteredData.forEach(item => {
        const d = new Date(item.date)
        if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
          const dayIndex = d.getDate() - 1
          data[dayIndex].Amount += item.paid_amount
        }
      })
      return data
    } else {
      // For 7Days or 15Days, group by date string
      const counts: Record<string, number> = {}
      filteredData.forEach(item => {
        const dStr = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        counts[dStr] = (counts[dStr] || 0) + item.paid_amount
      })
      // Sort by date chronologically
      return Object.entries(counts)
        .map(([name, Amount]) => ({ name, Amount, dateObj: new Date(name + ' ' + selectedYear) }))
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    }
  }, [filteredData, dateFilterMode, selectedYear, selectedMonth])

  // Pie Chart Data
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredData.forEach(item => {
      // Group by item_name (Course name, Exam type, etc) or Category
      const label = activeTab === 'Expenses' ? item.item_name.split(':')[0] : (item.item_name || 'Other')
      counts[label] = (counts[label] || 0) + item.paid_amount
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [filteredData, activeTab])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
      
      {/* Bar Chart (Dark Theme for White Text) */}
      <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-700">
        <h3 className="font-semibold text-white mb-6">
          {activeTab} Breakdown ({dateFilterMode === 'Month' ? 'Daily' : dateFilterMode})
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              {/* White text on axes */}
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#ffffff', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#ffffff', fontSize: 12}} tickFormatter={(val) => `৳${val}`} />
              <RechartsTooltip formatter={(value) => `৳${value}`} cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', color: '#fff'}} />
              <Legend wrapperStyle={{ color: '#fff' }}/>
              <Bar dataKey="Amount" fill={activeTab === 'Expenses' ? '#ef4444' : '#10b981'} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart (Dark Theme for White Text) */}
      <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-700">
        <h3 className="font-semibold text-white mb-6">{activeTab} Distribution</h3>
        <div className="h-[300px] flex items-center justify-center">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `৳${value}`} contentStyle={{backgroundColor: '#0f172a', border: 'none', color: '#fff'}} />
                <Legend wrapperStyle={{ color: '#fff' }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400">No data available for this period.</p>
          )}
        </div>
      </div>
    </div>
  )
}
