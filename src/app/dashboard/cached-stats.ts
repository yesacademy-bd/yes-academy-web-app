import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

export const getCachedDashboardStats = unstable_cache(
  async (todayStr: string) => {
    // Create an anonymous client (does not rely on cookies)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Fetch all batches
    const { data: batches } = await supabase.from('batches').select(`
      id, batch_name, status, schedule_days, start_time, end_time, start_date, expected_end_date,
      total_classes, additional_classes,
      courses(family, name), rooms(name), profiles!batches_teacher_id_fkey(display_name)
    `)
    const allBatches = batches || []

    const activeBatchIds = allBatches.filter(b => b.status === 'Active').map(b => b.id)

    // 2. Fetch all active sessions for counting
    const sessionCounts: Record<string, number> = {}
    if (activeBatchIds.length > 0) {
      const { data: allActiveSessions } = await supabase
        .from('class_sessions')
        .select('batch_id, class_number')
        .in('batch_id', activeBatchIds)
      
      ;(allActiveSessions || []).forEach(s => {
        if (s.class_number > 0) {
          sessionCounts[s.batch_id] = (sessionCounts[s.batch_id] || 0) + 1
        }
      })
    }

    // 3. Fetch sessions marked today
    const { data: sessionsTodayRes } = await supabase
      .from('class_sessions')
      .select('id, batch_id')
      .eq('session_date', todayStr)
      
    const batchesWithSessions = (sessionsTodayRes || []).map(s => s.batch_id)

    return {
      allBatches,
      sessionCounts,
      batchesWithSessions
    }
  },
  ['dashboard-stats'],
  { revalidate: 60 } // Cache for 60 seconds
)
