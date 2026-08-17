import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LeadClient from './LeadClient'

export default async function LeadsPage() {
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

  const [
    { data: leads },
    { data: courses }
  ] = await Promise.all([
    supabase.from('lead_calls').select('*').order('created_at', { ascending: false }),
    supabase.from('courses').select('*')
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lead Call Entry</h1>
        <p className="text-gray-500 mt-1">Record incoming calls and inquiries.</p>
      </div>

      <LeadClient initialLeads={leads || []} courses={courses || []} />
    </div>
  )
}
