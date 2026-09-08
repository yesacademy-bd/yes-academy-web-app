import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LeaveRequestClientForm from './LeaveRequestClientForm'
import { ArrowLeft } from 'lucide-react'

export default async function NewLeaveRequestPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/leave-requests" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Leave Request</h1>
          <p className="text-gray-500 text-sm mt-1">Submit an official leave request for approval.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1e3a8a] px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-white">How to submit a leave request</h2>
        </div>
        <div className="p-6 bg-gray-50/50">
          <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
            <li>Fill out the leave request form with accurate details.</li>
            <li>Submit the form to your Direct Manager/Head of Business for approval.</li>
            <li>Once approved, Management will verify and process the request.</li>
            <li>Scan the approved copy and send over mail to supervisor by keeping CEO Sir in CC.</li>
          </ol>
        </div>
      </div>

      <LeaveRequestClientForm profile={profile} />
    </div>
  )
}
