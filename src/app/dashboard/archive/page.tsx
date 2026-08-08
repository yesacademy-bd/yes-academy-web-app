import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, Archive, BookOpen } from 'lucide-react'

export default async function PermanentDatabasePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR'].includes(profile?.role || '')) {
    return <div className="text-red-500 font-medium p-8">Access Denied. Admin or HR only.</div>
  }

  // Fetch Completed batches
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      id, batch_name, start_date, expected_end_date, total_classes, additional_classes,
      courses(family, name), profiles!batches_teacher_id_fkey(display_name)
    `)
    .eq('status', 'Completed')
    .order('expected_end_date', { ascending: false })

  // For a real implementation, you might want to fetch stats dynamically from a view,
  // but here we just list the completed batches which they can click into for details.

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permanent Database Archive</h1>
          <p className="text-sm text-gray-500 mt-1">Read-only historical archive of completed batches.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search historical batches..." 
              className="w-full bg-white text-gray-900 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Families</option>
              <option value="PTE">PTE</option>
              <option value="IELTS">IELTS</option>
              <option value="Grammar">Grammar</option>
            </select>
            <button className="inline-flex items-center gap-2 text-gray-600 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Batch Name</th>
                <th className="p-4">Course Family</th>
                <th className="p-4">Teacher</th>
                <th className="p-4">Term Dates</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {batches?.map((batch: any) => (
                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-gray-400" />
                      {batch.batch_name}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {batch.courses?.family}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{batch.courses?.name}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{batch.profiles?.display_name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <div>{new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.expected_end_date).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/dashboard/archive/${batch.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Records
                    </Link>
                  </td>
                </tr>
              ))}
              {(!batches || batches.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    No completed batches in the archive yet.
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
