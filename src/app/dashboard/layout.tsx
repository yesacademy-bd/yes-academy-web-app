import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Calendar, Settings, Archive, BookOpen, LogOut, Key } from 'lucide-react'
import { logout } from '@/app/login/actions'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'Faculty'

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Component with Active Highlighting */}
      <Sidebar 
        role={role} 
        displayName={profile?.display_name || ''} 
        email={user.email || ''} 
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
