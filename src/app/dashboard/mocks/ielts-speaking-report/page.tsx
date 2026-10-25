import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import IeltsSpeakingReportClient from './IeltsSpeakingReportClient'
import { fetchIeltsMockCandidates, fetchIeltsSpeakingReports } from './actions'

export const dynamic = 'force-dynamic'

export default async function IeltsSpeakingReportPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!['Admin', 'HR', 'BDM', 'Faculty'].includes(profile?.role || '')) {
    redirect('/dashboard')
  }

  const [candidatesResult, reportsResult] = await Promise.all([
    fetchIeltsMockCandidates(),
    fetchIeltsSpeakingReports()
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <IeltsSpeakingReportClient
        initialBookings={candidatesResult.data || []}
        initialStudents={candidatesResult.students || []}
        initialReports={reportsResult.data || []}
        trainerName={candidatesResult.trainerName || profile?.display_name || user.email || 'YES Academy Faculty'}
      />
    </div>
  )
}
