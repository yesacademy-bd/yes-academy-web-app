import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import HolidaysClient from './HolidaysClient'

export default async function HolidaysPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['HR', 'Admin', 'BDM'].includes(profile?.role || '')) {
    return <div className="p-8 text-red-500">Access Denied. HR or Admin only.</div>
  }

  // Fetch initial holidays
  const { data: holidays } = await supabase
    .from('holidays')
    .select('*')
    .order('holiday_date', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Holiday Manager</h1>
          <p className="text-gray-500 mt-1">Declare global holidays to automatically pause attendance locking and shift future class dates.</p>
        </div>
      </div>
      
      <HolidaysClient initialHolidays={holidays || []} />
    </div>
  )
}
