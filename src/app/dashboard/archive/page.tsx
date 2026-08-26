import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ArchiveList from './ArchiveList'

export default async function PermanentDBPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['HR', 'BDM'].includes(profile?.role || '')) {
    return <div className="text-red-500 font-bold p-8">Access Denied. HR only.</div>
  }

  // Fetch only completed batches
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      id, batch_name, status, start_date, expected_end_date,
      courses ( name, family ),
      profiles!batches_teacher_id_fkey ( display_name )
    `)
    .eq('status', 'Completed')
    .order('expected_end_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Permanent Database</h1>
        <p className="text-sm text-gray-500 mt-1">Archive of all successfully completed batches across all courses.</p>
      </div>

      <ArchiveList batches={batches || []} />
    </div>
  )
}
