const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function test() {
  const { data: batch } = await supabase.from('batches').select('*').limit(1).single()
  console.log('Batch:', batch.id)
  
  const payload = {
    batch_id: batch.id,
    class_number: 99,
    session_date: '2026-08-12',
    override_unlock_until: new Date().toISOString()
  }
  
  console.log('Upserting...')
  const { data, error } = await supabase.from('class_sessions').upsert(payload, { onConflict: 'batch_id, class_number' })
  console.log('Error:', error)
  console.log('Data:', data)
}

test()
