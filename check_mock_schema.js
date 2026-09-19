const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const sb = createClient(url, key);

sb.rpc('run_sql', { sql_query: `
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'mock_services';
`}).then(r => console.log(r));
