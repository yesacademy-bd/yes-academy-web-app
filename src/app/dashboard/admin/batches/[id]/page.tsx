import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BatchForm from '@/components/batches/BatchForm'
import EnrollmentManager from '@/components/batches/EnrollmentManager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check Admin or HR role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR'].includes(profile?.role || '')) return <div className="text-red-500 font-medium">Access Denied. Admin or HR only</div>

  // Fetch reference data and existing batch
  const [coursesRes, teachersRes, roomsRes, settingsRes, batchRes, enrollmentsRes] = await Promise.all([
    supabase.from('courses').select('*').order('family'),
    supabase.from('profiles').select('id, display_name').eq('role', 'Faculty').order('display_name'),
    supabase.from('rooms').select('*').order('name'),
    supabase.from('settings').select('*').eq('id', 1).single(),
    supabase.from('batches').select('*').eq('id', id).single(),
    supabase.from('enrollments').select('students(*)').eq('batch_id', id)
  ])

  const students = enrollmentsRes?.data?.map((e: any) => e.students).filter(Boolean) || []

  if (batchRes.error || !batchRes.data) {
    return (
      <div className="text-red-500 p-8">
        <h2 className="font-bold text-xl">Batch not found or error occurred</h2>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(batchRes.error || 'No batch data returned', null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/batches" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Batch</h1>
      </div>
      
      <BatchForm 
        initialData={batchRes.data}
        courses={coursesRes.data || []}
        teachers={teachersRes.data || []}
        rooms={roomsRes.data || []}
        settings={settingsRes.data}
        userRole={profile?.role}
      />

      <EnrollmentManager batchId={id} students={students} />
    </div>
  )
}
