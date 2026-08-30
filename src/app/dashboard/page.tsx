import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Clock, Users, BookOpen } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, display_name').eq('id', user.id).single()
  
  if (profile?.role === 'Admin') redirect('/dashboard/admin/batches')
  if (profile?.role === 'Faculty') redirect('/dashboard/faculty/batches')

  const isFaculty = false // Because Faculty is redirected, this page is now HR-only
  const role = profile?.role || 'HR'

  function format12Hour(timeStr: string) {
    if (!timeStr) return '';
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minuteStr} ${ampm}`;
  }

  // Fetch batches based on role
  let query = supabase.from('batches').select(`
    id, batch_name, status, schedule_days, start_time, end_time, start_date, expected_end_date,
    total_classes, additional_classes,
    courses(family, name), rooms(name), profiles!batches_teacher_id_fkey(display_name)
  `)
  
  if (isFaculty) {
    query = query.or(`teacher_id.eq.${user.id},monitor_teacher_id.eq.${user.id}`)
  }

  const { data: batches } = await query
  const allBatches = batches || []

  // Stats calculation
  const activeBatches = allBatches.filter(b => b.status === 'Active')
  const upcomingBatches = allBatches.filter(b => b.status === 'Upcoming')
  const completedBatches = allBatches.filter(b => b.status === 'Completed')

  // Calculate "Today's Batches" based on current day of week
  const tzDateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
  const now = new Date(tzDateStr)
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = daysOfWeek[now.getDay()]
  
  const todaysBatches = activeBatches.filter(b => b.schedule_days.includes(todayName))

  // Calculate "Live Now" batches based on current Dhaka time
  const currentHours = now.getHours()
  const currentMinutes = now.getMinutes()
  const currentTime = currentHours * 60 + currentMinutes

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  const liveNowBatches = todaysBatches.filter(b => {
    const startMinutes = timeToMinutes(b.start_time)
    const endMinutes = timeToMinutes(b.end_time)
    return currentTime >= startMinutes && currentTime <= endMinutes
  })

  // Determine missed attendance for today's batches
  // For a real app, you'd fetch the class_sessions for today and check attendance_records.
  // We'll mock the check by seeing if a session exists for today.
  const todayStr = now.toISOString().split('T')[0]
  const batchIds = todaysBatches.map(b => b.id)
  
  let missedAttendanceBatches: any[] = []
  const sessionCounts: Record<string, number> = {}
  let batchEndAlerts: any[] = []

  const activeBatchIds = activeBatches.map(b => b.id)
  
  if (activeBatchIds.length > 0) {
    const { data: allActiveSessions } = await supabase.from('class_sessions').select('batch_id').in('batch_id', activeBatchIds)
    ;(allActiveSessions || []).forEach(s => {
      sessionCounts[s.batch_id] = (sessionCounts[s.batch_id] || 0) + 1
    })

    batchEndAlerts = activeBatches.filter(b => {
      const completed = sessionCounts[b.id] || 0
      const remaining = b.total_classes + b.additional_classes - completed
      return remaining > 0 && remaining <= 6
    })
  }

  if (batchIds.length > 0) {
    const [sessionsTodayRes, allSessionsRes] = await Promise.all([
      supabase.from('class_sessions').select('batch_id, id').in('batch_id', batchIds).eq('session_date', todayStr),
      supabase.from('class_sessions').select('batch_id').in('batch_id', batchIds)
    ])
      
    const batchesWithSessions = new Set((sessionsTodayRes.data || []).map(s => s.batch_id))
    // If a batch is scheduled today, but the time has passed and no session exists, it's missed.
    missedAttendanceBatches = todaysBatches.filter(b => {
      const endMinutes = timeToMinutes(b.end_time)
      // Check if time passed and no session marked
      return currentTime > endMinutes && !batchesWithSessions.has(b.id)
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.display_name?.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1">Here is what's happening at YES Academy today.</p>
        </div>
      </div>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="w-5 h-5" /></div>
            <p className="text-sm font-medium text-gray-500">Active Batches</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeBatches.length}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Clock className="w-5 h-5" /></div>
            <p className="text-sm font-medium text-gray-500">Classes Today</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{todaysBatches.length}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Users className="w-5 h-5" /></div>
            <p className="text-sm font-medium text-gray-500">Upcoming</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcomingBatches.length}</p>
        </div>
        <div className="p-6 bg-red-50 rounded-xl shadow-sm border border-red-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
            <p className="text-sm font-medium text-red-700">Missed Attendance</p>
          </div>
          <p className="text-3xl font-bold text-red-700">{missedAttendanceBatches.length}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Alerts & Live Now Panel */}
        <div className="lg:col-span-2 space-y-6">

          {batchEndAlerts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-orange-100 flex justify-between items-center bg-orange-100/50">
                <h2 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Batch End Alerts (Next 2 Weeks)
                </h2>
                <span className="bg-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">{batchEndAlerts.length}</span>
              </div>
              <div className="divide-y divide-orange-100">
                {batchEndAlerts.map(b => {
                  const completed = sessionCounts[b.id] || 0
                  const remaining = b.total_classes + b.additional_classes - completed
                  return (
                    <div key={b.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-orange-100/30 transition-colors">
                      <div>
                        <h3 className="font-bold text-orange-900">{b.batch_name}</h3>
                        <p className="text-sm text-orange-800 mt-1">
                          Teacher: <span className="font-medium">{(b.profiles as any)?.display_name}</span> • 
                          Schedule: <span className="font-medium">{b.schedule_days.join(', ')} ({format12Hour(b.start_time)})</span>
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 text-right">
                        <span className="inline-block bg-orange-600 text-white font-medium text-xs px-3 py-1 rounded-full">
                          {remaining} classes left
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                Happening Right Now
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {liveNowBatches.map(b => (
                <div key={b.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-900">{b.batch_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{(b.courses as any)?.family} • {(b.profiles as any)?.display_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{(b.rooms as any)?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{format12Hour(b.start_time)} - {format12Hour(b.end_time)}</p>
                  </div>
                </div>
              ))}
              {liveNowBatches.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No classes currently in session.
                </div>
              )}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule ({todayName})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {todaysBatches.sort((a, b) => a.start_time.localeCompare(b.start_time)).map(b => (
                <div key={b.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-center shrink-0">
                      <p className="text-sm font-bold text-gray-900">{format12Hour(b.start_time)}</p>
                      <p className="text-xs text-gray-500">{format12Hour(b.end_time)}</p>
                    </div>
                    <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
                    <div>
                      <h3 className="font-bold text-gray-900">{b.batch_name}</h3>
                      <p className="text-sm text-gray-500">{(b.rooms as any)?.name} • Teacher: {(b.profiles as any)?.display_name}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/${isFaculty ? 'faculty' : 'admin'}/batches/${b.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg text-center"
                  >
                    View Batch
                  </Link>
                </div>
              ))}
              {todaysBatches.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No classes scheduled for today.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="space-y-6">
          {['HR', 'BDM'].includes(role) && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-red-900">Missed Attendance</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {missedAttendanceBatches.map(b => {
                  const missedClassNo = (sessionCounts[b.id] || 0) + 1;
                  return (
                  <div key={b.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-gray-900">{b.batch_name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Class {missedClassNo} • Teacher: {(b.profiles as any)?.display_name || 'Unassigned'} • Ended at {format12Hour(b.end_time)}
                      </p>
                    </div>
                    <Link 
                      href={`/dashboard/faculty/batches/${b.id}`}
                      className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded whitespace-nowrap ml-2"
                    >
                      Mark Now
                    </Link>
                  </div>
                  )
                })}
                {missedAttendanceBatches.length === 0 && (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    All caught up! No missed attendance for today.
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-lg font-bold mb-2">Need Help?</h3>
               <p className="text-blue-100 text-sm mb-4">Contact the admin if you need to reschedule a class or report an issue.</p>
               <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors w-full">
                 View Timetable
               </button>
             </div>
             {/* Decorative circles */}
             <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </div>

      </div>
    </div>
  )
}
