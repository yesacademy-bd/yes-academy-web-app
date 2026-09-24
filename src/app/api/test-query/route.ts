import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')
  
  const { data: data1, error: error1 } = await supabase.from('mock_services').select('id').or('service_type.eq.PTE Mock,mock_type.eq.PTE Mock')
  const { data: data2, error: error2 } = await supabase.from('mock_services').select('id').or('service_type.eq."PTE Mock",mock_type.eq."PTE Mock"')
  
  return NextResponse.json({ error1, error2, count1: data1?.length, count2: data2?.length })
}
