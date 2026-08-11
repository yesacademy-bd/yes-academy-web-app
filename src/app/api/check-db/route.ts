import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: sessions, error } = await supabase.from('class_sessions').select('*').not('override_unlock_until', 'is', null)
  return NextResponse.json({ sessions, error })
}
