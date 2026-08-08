import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'

export default async function BatchManagerPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Ensure Admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'Admin') {
    return <div className="text-red-500 font-medium">Access Denied. Admin only.</div>
  }

  // Fetch batches with their courses and teachers
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      id,
      batch_name,
      status,
      start_date,
      expected_end_date,
      courses ( name, family ),
      profiles!batches_teacher_id_fkey ( display_name )
    `)
    .order('start_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Batch Manager</h1>
        <Link href="/dashboard/admin/batches/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Create New Batch
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search batches..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 text-gray-600 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Batch Name</th>
                <th className="p-4">Course</th>
                <th className="p-4">Teacher</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {batches?.map((batch: any) => (
                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{batch.batch_name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      {batch.courses?.family}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{batch.courses?.name}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{batch.profiles?.display_name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <div>{new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.expected_end_date).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                      ${batch.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        batch.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 
                        batch.status === 'Completed' ? 'bg-gray-100 text-gray-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/dashboard/faculty/batches/${batch.id}`} className="text-gray-600 hover:text-gray-900 text-sm font-medium mr-4">
                      Attendance
                    </Link>
                    <Link href={`/dashboard/admin/batches/${batch.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {(!batches || batches.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
