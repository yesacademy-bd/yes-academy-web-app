import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FacultyBatchList from '@/components/batches/FacultyBatchList'

export default async function FacultyBatchesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isHR = ['HR', 'BDM'].includes(profile?.role || '')

  let query = supabase
    .from('batches')
    .select(`
      id,
      batch_name,
      status,
      start_time,
      end_time,
      schedule_days,
        total_classes,
        additional_classes,
      courses ( name, family ),
      rooms ( name ),
      profiles!batches_teacher_id_fkey ( display_name ),
      class_sessions ( class_number )
    `)
    .order('start_date', { ascending: false })

  if (!isHR) {
    query = query.or(`teacher_id.eq.${user.id},monitor_teacher_id.eq.${user.id}`)
  }

  const { data: batches } = await query

  return <FacultyBatchList batches={batches || []} isHR={isHR} />
}

