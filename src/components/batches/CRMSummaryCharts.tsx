'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6']

export default function CRMSummaryCharts({ 
  initialData, 
  selectedYear 
}: { 
  initialData: any[], 
  selectedYear: number 
}) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // 1. Monthly Financials (Sales vs Expenses)
  const monthlyData = useMemo(() => {
    // Initialize array with 12 months
    const data = months.map(m => ({ name: m, Sales: 0, Expenses: 0 }))
    
    initialData.forEach(item => {
      const d = new Date(item.date)
      if (d.getFullYear() === selectedYear) {
        const monthIndex = d.getMonth()
        if (item.type === 'Expense') {
          data[monthIndex].Expenses += (item.paid_amount || 0)
        } else {
          data[monthIndex].Sales += (item.paid_amount || 0)
        }
      }
    })
    return data
  }, [initialData, selectedYear])

  // 2. Sales by Category
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    initialData.forEach(item => {
      const d = new Date(item.date)
      if (d.getFullYear() === selectedYear && item.type !== 'Expense') {
        counts[item.type] = (counts[item.type] || 0) + item.paid_amount
      }
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [initialData, selectedYear])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden mb-8">
      {/* Sales vs Expenses Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-6">Financial Overview ({selectedYear})</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `৳${value}`} />
              <RechartsTooltip formatter={(value) => `৳${value}`} cursor={{fill: '#f3f4f6'}} />
              <Legend />
              <Bar dataKey="Sales" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-6">Revenue Breakdown ({selectedYear})</h3>
        <div className="h-[300px] flex items-center justify-center">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `৳${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No revenue data available for this year.</p>
          )}
        </div>
      </div>
    </div>
  )
}
