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

  if (!['Admin', 'HR', 'BDM'].includes(role)) {
    return <div className="text-red-500 font-medium">Access Denied.</div>
  }

  // Fetch batches with their courses and teachers
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      id,
      batch_name,
      course_id,
      status,
      start_date,
      expected_end_date,
      courses ( name, family ),
      profiles!batches_teacher_id_fkey ( display_name )
    `)
    // We will do alphanumeric sorting in the client component

  const { data: courses } = await supabase
    .from('courses')
    .select('id, name')
    .order('name')

  return (
    <BatchList batches={batches || []} courses={courses || []} userRole={role} />
  )
}
