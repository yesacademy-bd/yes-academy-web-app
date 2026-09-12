const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/admin/batches/enroll-actions.ts', 'utf8');

if (!code.includes("import { createAdminClient }")) {
  code = code.replace(
    "import { createClient } from '@/utils/supabase/server'",
    "import { createClient } from '@/utils/supabase/server'\nimport { createAdminClient } from '@/utils/supabase/admin'"
  );
  fs.writeFileSync('src/app/dashboard/admin/batches/enroll-actions.ts', code);
}
