import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import UserManagementClient from '@/components/hr/UserManagementClient'

export default async function UserManagementPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['HR', 'Admin', 'BDM'].includes(profile?.role || '')) {
    return <div className="p-10 text-red-500 font-bold">Access Denied</div>
  }

  let usersList: any[] = []
  let envError = null

  try {
    const adminClient = createAdminClient()
    
    // Fetch auth users to get ban status
    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers()
    if (authError) throw authError

    // Fetch profiles
    const { data: profiles, error: profileError } = await adminClient.from('profiles').select('*').order('created_at', { ascending: false })
    if (profileError) throw profileError

    // Merge
    usersList = (profiles || []).map(p => {
      const au = authData.users.find(u => u.id === p.id)
      return {
        ...p,
        is_banned: au?.banned_until ? new Date(au.banned_until) > new Date() : false
      }
    })

    // If BDM, filter out HR users
    if (profile?.role === 'BDM') {
      usersList = usersList.filter(u => u.role !== 'HR')
    }
  } catch (err: any) {
    if (err.message?.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      envError = err.message
    } else {
      console.error(err)
      envError = 'An error occurred fetching users.'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">Create, manage, and remove Admin and Faculty accounts.</p>
      </div>

      {envError ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          <h3 className="font-bold mb-2">Configuration Required</h3>
          <p>{envError}</p>
          <p className="mt-2 text-sm opacity-90">To enable User Management, please go to your Vercel Dashboard, navigate to Environment Variables, and add your <code>SUPABASE_SERVICE_ROLE_KEY</code>.</p>
        </div>
      ) : (
        <UserManagementClient initialUsers={usersList} currentUserId={user.id} currentUserRole={profile?.role} />
      )}
    </div>
  )
}
