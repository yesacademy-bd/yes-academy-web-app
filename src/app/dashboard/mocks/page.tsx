import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MockClient from './MockClient'

export default async function MocksPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) {
    redirect('/dashboard')
  }

  const { data: mocks } = await supabase
    .from('mock_services')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mock Services</h1>
        <p className="text-gray-500 mt-1">Manage mock test enrollments and payments.</p>
      </div>

      <MockClient initialMocks={mocks || []} />
    </div>
  )
}
