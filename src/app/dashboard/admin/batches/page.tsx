import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BatchList from '@/components/batches/BatchList'

export default async function BatchManagerPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Ensure Admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const role = profile?.role || 'Admin'

  if (!['Admin', 'HR'].includes(role)) {
    return <div className="text-red-500 font-medium">Access Denied.</div>
  }

  // Fetch batches with their courses and teachers
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      id,
      batch_name,
      status,
      start_date,
      expected_end_date,
      courses ( name, family ),
      profiles!batches_teacher_id_fkey ( display_name )
    `)
    .order('start_date', { ascending: false })

  return (
    <BatchList batches={batches || []} userRole={role} />
  )
}
