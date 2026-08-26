'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, Settings, Archive, BookOpen, Key, LogOut, UserPlus, Phone, UserCheck, FileText, ClipboardList, Wallet, CreditCard, Menu } from 'lucide-react'
import { logout } from '@/app/login/actions'

type SidebarProps = {
  role: string
  displayName: string
  email: string
}

export default function Sidebar({ role, displayName, email }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true')
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['HR'] },
    { name: 'Batch Manager', href: '/dashboard/admin/batches', icon: Users, roles: ['Admin', 'HR'] },
    { name: 'Student Enrollments', href: '/dashboard/enrollments', icon: UserPlus, roles: ['Admin', 'HR'] },
    { name: 'Due Details', href: '/dashboard/dues', icon: Wallet, roles: ['HR'] },
    { name: 'Lead Call Entry', href: '/dashboard/leads', icon: Phone, roles: ['HR'] },
    { name: 'Walk-ins', href: '/dashboard/walkins', icon: UserCheck, roles: ['HR'] },
    { name: 'Mock Services', href: '/dashboard/mocks', icon: FileText, roles: ['HR'] },
    { name: 'Exam Registrations', href: '/dashboard/registrations', icon: ClipboardList, roles: ['HR'] },
    { name: 'Classes & Attendance', href: '/dashboard/faculty/batches', icon: BookOpen, roles: ['Faculty', 'HR'] },
    { name: 'CRM (Finance)', href: '/dashboard/crm', icon: Wallet, roles: ['HR'] },
    { name: 'Expenses', href: '/dashboard/expenses', icon: CreditCard, roles: ['HR'] },
    { name: 'Unlock Tool', href: '/dashboard/hr/unlock', icon: Key, roles: ['HR'] },
    { name: 'Timetable', href: '/dashboard/timetable', icon: Calendar, roles: ['HR'] },
    { name: 'Holiday Manager', href: '/dashboard/hr/holidays', icon: Calendar, roles: ['HR'] },
    { name: 'Permanent DB', href: '/dashboard/archive', icon: Archive, roles: ['HR'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['HR'] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(role))

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 print:hidden relative z-20`}>
      <div className={`h-16 flex items-center border-b border-gray-200 ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-blue-600 truncate">YES Academy</h1>}
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      <nav className={`flex-1 space-y-1 overflow-y-auto ${isCollapsed ? 'px-3 py-4' : 'p-4'}`}>
        {filteredNav.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCollapsed ? 'justify-center px-0' : 'px-3'
              } ${
                isActive 
                  ? `bg-blue-100 text-blue-700 shadow-sm ${!isCollapsed && 'border-l-4 border-blue-600'}` 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={`border-t border-gray-200 ${isCollapsed ? 'p-3' : 'p-4'}`}>
        <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : 'px-3'}`} title={isCollapsed ? `${displayName} (${role})` : undefined}>
          <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {displayName.charAt(0) || email.charAt(0) || 'U'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{role}</p>
            </div>
          )}
        </div>
        <form action={logout}>
          <button 
            title={isCollapsed ? "Sign out" : undefined}
            className={`flex w-full items-center gap-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors ${
              isCollapsed ? 'justify-center px-0' : 'px-3'
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </form>
      </div>
    </aside>
  )
}
