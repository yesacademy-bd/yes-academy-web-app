import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TimetableGrid from '@/components/timetable/TimetableGrid'
import LiveOngoingBatches from '@/components/timetable/LiveOngoingBatches'

export default async function TimetablePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isFaculty = profile?.role === 'Faculty'
  const isHR = ['HR', 'BDM'].includes(profile?.role || '')

  // Fetch Rooms
  const { data: rooms } = await supabase.from('rooms').select('*').order('name')
  
  // Fetch Batches
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      id, batch_name, status, schedule_days, start_time, end_time, room_id, teacher_id, monitor_teacher_id,
      courses(family, name), profiles!batches_teacher_id_fkey(display_name), rooms(name)
    `)
    .in('status', ['Active', 'Upcoming'])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Academic Timetable</h1>
      </div>

      {isHR && <LiveOngoingBatches batches={batches || []} />}
      
      <TimetableGrid 
        batches={batches || []} 
        rooms={rooms || []} 
        isFaculty={isFaculty}
        userId={user.id}
      />
    </div>
  )
}
