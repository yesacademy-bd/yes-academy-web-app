import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import UnlockForm from './UnlockForm'

export default async function UnlockCenterPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['HR', 'BDM'].includes(profile?.role || '')) {
    return <div className="p-8 text-red-500 font-bold">Access Denied. HR only.</div>
  }

  // Fetch active and upcoming batches for unlocking
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      id, batch_name, status, total_classes, additional_classes,
      class_sessions ( id, class_number, override_unlock_until )
    `)
    .in('status', ['Active', 'Upcoming'])
    .order('batch_name')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Unlock Center</h1>
        <p className="text-gray-500 mt-1">Temporarily override time locks for attendance classes.</p>
      </div>

      <UnlockForm batches={batches || []} />
    </div>
  )
}
