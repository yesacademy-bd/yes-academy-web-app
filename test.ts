import { createAdminClient } from '@/utils/supabase/admin'

async function check() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.from('mock_services').select('service_type, mock_type, test_type').limit(10)
  console.log(data)
}
check()
