'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Ban, CheckCircle, ShieldAlert, Key, Eye, EyeOff } from 'lucide-react'
import { createStaffUser, deleteStaffUser, toggleUserSuspension } from '@/app/actions/users'

export default function UserManagementClient({ initialUsers, currentUserId, currentUserRole }: { initialUsers: any[], currentUserId: string, currentUserRole?: string }) {
  const [users, setUsers] = useState(initialUsers)
  const [isPending, startTransition] = useTransition()
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'Faculty' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    fd.append('email', formData.email)
    fd.append('password', formData.password)
    fd.append('name', formData.name)
    fd.append('role', formData.role)
    
    const res = await createStaffUser(null, fd)
    if (res.success) {
      alert('User created successfully. Refresh to see changes.')
      setShowAddModal(false)
      setShowPassword(false)
      setFormData({ email: '', password: '', name: '', role: 'Faculty' })
    } else {
      alert(res.message)
    }
    setLoading(false)
  }

  const handleDelete = (id: string) => {
    if (id === currentUserId) return alert("You cannot delete yourself.")
    if (!confirm('Are you sure you want to completely delete this user? If they have historical data, the database will block the deletion and you should SUSPEND them instead.')) return
    
    startTransition(async () => {
      const res = await deleteStaffUser(id)
      if (res.success) {
        setUsers(users.filter(u => u.id !== id))
      } else {
        alert(res.message)
      }
    })
  }

  const handleToggleSuspend = (id: string, currentlySuspended: boolean) => {
    if (id === currentUserId) return alert("You cannot suspend yourself.")
    if (!confirm(`Are you sure you want to ${currentlySuspended ? 'reactivate' : 'suspend'} this user?`)) return
    
    startTransition(async () => {
      const res = await toggleUserSuspension(id, !currentlySuspended)
      if (res.success) {
        setUsers(users.map(u => u.id === id ? { ...u, is_banned: !currentlySuspended } : u))
      } else {
        alert(res.message)
      }
    })
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-900">Staff Accounts</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{u.display_name}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                      ['HR', 'BDM'].includes(u.role) ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.is_banned ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <ShieldAlert className="w-3 h-3" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleSuspend(u.id, u.is_banned)}
                        disabled={isPending || u.id === currentUserId}
                        className={`p-2 rounded-lg transition-colors ${u.is_banned ? 'text-green-600 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'} disabled:opacity-50`}
                        title={u.is_banned ? "Reactivate User" : "Suspend User (Safe Delete)"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        disabled={isPending || u.id === currentUserId}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Permanently Delete (Will fail if user has history)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-lg text-white" style={{ WebkitTextFillColor: 'white' }}>Create New User</h3>
              <button onClick={() => { setShowAddModal(false); setShowPassword(false); }} className="text-slate-400 hover:text-white transition-colors">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Faculty">Faculty</option>
                  <option value="Admin">Admin</option>
                  {currentUserRole !== 'BDM' && <option value="HR">HR</option>}
                  <option value="BDM">BDM</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => { setShowAddModal(false); setShowPassword(false); }} className="flex-1 px-4 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
