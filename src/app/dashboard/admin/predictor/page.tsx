import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PredictorDashboard from './PredictorDashboard'
import { getEligibleTeachers, getPredictions } from '@/app/actions/predictor'

export const dynamic = 'force-dynamic'

export default async function BatchPredictorPage({
  searchParams
}: {
  searchParams: { month?: string, year?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['Admin', 'BDM'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const today = new Date()
  const month = parseInt(searchParams.month || String(today.getMonth() + 1))
  const year = parseInt(searchParams.year || String(today.getFullYear()))

  const predictions = await getPredictions(month, year)
  const teachers = await getEligibleTeachers()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Batch Predictor</h1>
        <p className="text-gray-500">Plan and predict upcoming batches based on your active batch pipeline.</p>
      </div>
      
      <PredictorDashboard 
        initialPredictions={predictions} 
        eligibleTeachers={teachers} 
        currentMonth={month}
        currentYear={year}
      />
    </div>
  )
}
