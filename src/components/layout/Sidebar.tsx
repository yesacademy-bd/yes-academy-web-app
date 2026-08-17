'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, Settings, Archive, BookOpen, Key, LogOut, UserPlus, Phone, UserCheck, FileText, ClipboardList, Wallet, CreditCard } from 'lucide-react'
import { logout } from '@/app/login/actions'

type SidebarProps = {
  role: string
  displayName: string
  email: string
}

export default function Sidebar({ role, displayName, email }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['HR'] },
    { name: 'Batch Manager', href: '/dashboard/admin/batches', icon: Users, roles: ['Admin', 'HR'] },
    { name: 'Student Enrollments', href: '/dashboard/enrollments', icon: UserPlus, roles: ['Admin', 'HR'] },
    { name: 'Due Details', href: '/dashboard/dues', icon: Wallet, roles: ['Admin', 'HR'] },
    { name: 'Lead Call Entry', href: '/dashboard/leads', icon: Phone, roles: ['Admin', 'HR'] },
    { name: 'Walk-ins', href: '/dashboard/walkins', icon: UserCheck, roles: ['Admin', 'HR'] },
    { name: 'Mock Services', href: '/dashboard/mocks', icon: FileText, roles: ['Admin', 'HR'] },
    { name: 'Exam Registrations', href: '/dashboard/registrations', icon: ClipboardList, roles: ['Admin', 'HR'] },
    { name: 'Classes & Attendance', href: '/dashboard/faculty/batches', icon: BookOpen, roles: ['Faculty', 'HR'] },
    { name: 'CRM (Finance)', href: '/dashboard/crm', icon: Wallet, roles: ['Admin', 'HR'] },
    { name: 'Expenses', href: '/dashboard/expenses', icon: CreditCard, roles: ['Admin', 'HR'] },
    { name: 'Unlock Tool', href: '/dashboard/hr/unlock', icon: Key, roles: ['HR'] },
    { name: 'Timetable', href: '/dashboard/timetable', icon: Calendar, roles: ['HR'] },
    { name: 'Holiday Manager', href: '/dashboard/hr/holidays', icon: Calendar, roles: ['HR'] },
    { name: 'Permanent DB', href: '/dashboard/archive', icon: Archive, roles: ['HR'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['HR'] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(role))

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col print:hidden">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">YES Academy</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          // Check if active (exact match for dashboard, or startsWith for others)
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-100 text-blue-700 shadow-sm border-l-4 border-blue-600' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {displayName.charAt(0) || email.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{role}</p>
          </div>
        </div>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
