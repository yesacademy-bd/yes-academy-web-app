import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PteReportClient from './PteReportClient'
import { fetchPteMockBookings } from './actions'

export default async function PteReportPage() {
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

  const { data: bookings, trainerName } = await fetchPteMockBookings()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">PTE ACADEMIC FEEDBACK FORM</h1>
        <p className="text-gray-500 mt-1">YES ACADEMY — STUDENT PROGRESS & MODULE EVALUATION</p>
      </div>

      <PteReportClient initialBookings={bookings || []} trainerName={trainerName || profile?.display_name || user.email} />
    </div>
  )
}
