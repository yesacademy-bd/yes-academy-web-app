import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('courses').insert([{ family: 'PTE', name: 'Online PTE', default_total_classes: 24, default_additional_classes: 8 }]).select();
  return NextResponse.json({ data, error });
}
