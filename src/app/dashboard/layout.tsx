import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Calendar, Settings, Archive, BookOpen, LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'

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

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['HR', 'Admin', 'Faculty'] },
    { name: 'Classes & Attendance', href: '/dashboard/faculty/batches', icon: BookOpen, roles: ['Faculty'] },
    { name: 'Batch Manager', href: '/dashboard/admin/batches', icon: Users, roles: ['Admin'] },
    { name: 'Timetable', href: '/dashboard/timetable', icon: Calendar, roles: ['HR', 'Admin', 'Faculty'] },
    { name: 'Permanent DB', href: '/dashboard/archive', icon: Archive, roles: ['HR'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['Admin'] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(role))

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">YES Academy</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            >
              <item.icon className="w-5 h-5 text-gray-400" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {profile?.display_name?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.display_name}</p>
              <p className="text-xs text-gray-500 truncate">{role}</p>
            </div>
          </div>
          <form action={logout}>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50">
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
