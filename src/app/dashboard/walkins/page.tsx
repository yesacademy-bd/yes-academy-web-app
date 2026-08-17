import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import WalkinClient from './WalkinClient'

export default async function WalkinsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['Admin', 'HR'].includes(profile?.role || '')) {
    redirect('/dashboard')
  }

  const { data: walkins } = await supabase
    .from('walk_ins')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: courses } = await supabase.from('courses').select('*')

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Walk-ins</h1>
        <p className="text-gray-500 mt-1">Record physical walk-in inquiries.</p>
      </div>

      <WalkinClient initialWalkins={walkins || []} courses={courses || []} />
    </div>
  )
}
