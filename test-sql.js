import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { 
    sql_query: 'ALTER TABLE batches ADD COLUMN IF NOT EXISTS override_unlock_until TIMESTAMPTZ;' 
  })
  console.log('Error:', error)
  console.log('Data:', data)
}
run()
