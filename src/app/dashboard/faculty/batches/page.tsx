import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Users, Clock } from 'lucide-react'

export default async function FacultyBatchesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  let query = supabase
    .from('batches')
    .select(`
      id,
      batch_name,
      status,
      start_time,
      end_time,
      schedule_days,
      courses ( name, family ),
      rooms ( name )
    `)
    .in('status', ['Active', 'Upcoming'])
    .order('start_date', { ascending: false })

  if (profile?.role === 'Faculty') {
    query = query.or(`teacher_id.eq.${user.id},monitor_teacher_id.eq.${user.id}`)
  }

  const { data: batches } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Batches</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches?.map((batch: any) => (
          <Link href={`/dashboard/faculty/batches/${batch.id}`} key={batch.id}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{batch.batch_name}</h3>
                  <p className="text-sm text-gray-500">{batch.courses?.name}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                  ${batch.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {batch.status}
                </span>
              </div>
              
              <div className="mt-auto space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {batch.schedule_days.join(', ')} <br/> {batch.start_time.substring(0,5)} - {batch.end_time.substring(0,5)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  Room: {batch.rooms?.name}
                </div>
              </div>
            </div>
          </Link>
        ))}
        
        {(!batches || batches.length === 0) && (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-gray-200 border-dashed">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No active batches</h3>
            <p className="text-sm text-gray-500 mt-1">You are not assigned to any running batches.</p>
          </div>
        )}
      </div>
    </div>
  )
}
