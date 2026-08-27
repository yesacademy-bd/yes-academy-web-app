import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BDMReportClient from '@/components/reports/BDMReportClient'

export default async function TeachersReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) {
    return <div className="p-8 text-red-500 font-medium">Access Denied.</div>
  }

  // Fetch all teachers for the filter
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('role', 'Faculty')
    .order('display_name')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teachers Reports</h1>
      <BDMReportClient teachers={teachers || []} />
    </div>
  )
}
