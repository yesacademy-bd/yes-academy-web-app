import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BatchForm from '@/components/batches/BatchForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewBatchPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check Admin role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) return <div className="text-red-500">Admin or HR only</div>

  // Fetch reference data for dropdowns
  const [coursesRes, teachersRes, roomsRes, settingsRes] = await Promise.all([
    supabase.from('courses').select('*').order('family'),
    supabase.from('profiles').select('id, display_name').eq('role', 'Faculty').order('display_name'),
    supabase.from('rooms').select('*').order('name'),
    supabase.from('settings').select('*').eq('id', 1).single()
  ])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/batches" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Batch</h1>
      </div>
      
      <BatchForm 
        courses={coursesRes.data || []}
        teachers={teachersRes.data || []}
        rooms={roomsRes.data || []}
        settings={settingsRes.data}
      />
    </div>
  )
}
