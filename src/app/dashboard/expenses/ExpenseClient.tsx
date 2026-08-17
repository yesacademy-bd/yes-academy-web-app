'use client'

import { useState } from 'react'
import { CreditCard, Calendar } from 'lucide-react'
import { createExpense } from './actions'

export default function ExpenseClient({ initialExpenses }: { initialExpenses: any[] }) {
  const [expenses] = useState(initialExpenses)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await createExpense(formData)
    
    if (res.success) {
      window.location.reload()
    } else {
      setError(res.message || 'Failed to add expense')
      setIsSubmitting(false)
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-600" /> New Expense
          </h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input type="number" name="amount" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities (Electricity/Water/Internet)</option>
                <option value="Marketing">Marketing / Ads</option>
                <option value="Supplies">Office Supplies</option>
                <option value="Payroll">Payroll / Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select name="payment_method" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="Cash">Cash</option>
                <option value="bKash">bKash</option>
                <option value="Bank">Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Add Expense'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" /> Expense History
            </h3>
            <div className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
              Total: ৳{totalExpenses.toLocaleString()}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No expenses recorded.</td>
                  </tr>
                )}
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-900">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">{e.category}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{e.payment_method || 'Cash'}</td>
                    <td className="p-4 text-sm text-gray-600 truncate max-w-[200px]">{e.description || '-'}</td>
                    <td className="p-4 text-sm font-medium text-red-600 text-right">৳{e.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
