import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ExpenseClient from './ExpenseClient'

export default async function ExpensesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) {
    redirect('/dashboard')
  }

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <p className="text-gray-500 mt-1">Manage office expenses and overheads.</p>
      </div>

      <ExpenseClient initialExpenses={expenses || []} />
    </div>
  )
}
