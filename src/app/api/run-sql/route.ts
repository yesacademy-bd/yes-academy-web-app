import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  // Find dummy sessions
  const { data: dummySessions } = await supabase.from('class_sessions').select('id').eq('class_number', -1);
  const dummySessionIds = dummySessions?.map(s => s.id) || [];
  
  if (dummySessionIds.length > 0) {
    const { error } = await supabase.from('attendance_records').delete().in('class_session_id', dummySessionIds);
    return NextResponse.json({ message: 'Cleaned up', count: dummySessionIds.length, error });
  }
  return NextResponse.json({ message: 'No dummy sessions found' });
}
