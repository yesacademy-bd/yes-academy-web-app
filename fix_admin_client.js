const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/actions.ts', 'utf8');

// Add import
if (!code.includes("import { createAdminClient }")) {
  code = code.replace(
    "import { createClient } from '@/utils/supabase/server'",
    "import { createClient } from '@/utils/supabase/server'\nimport { createAdminClient } from '@/utils/supabase/admin'"
  );
}

// In createMockService
code = code.replace(
  "const { error } = await supabase\n    .from('mock_services')",
  "const adminClient = createAdminClient()\n  const { error } = await adminClient\n    .from('mock_services')"
);
code = code.replace(
  "const { count, error: countErr } = await supabase\n      .from('mock_services')",
  "const adminClientCount1 = createAdminClient()\n    const { count, error: countErr } = await adminClientCount1\n      .from('mock_services')"
);
code = code.replace(
  "const { count: sessionCount } = await supabase\n    .from('mock_services')",
  "const adminClientCount2 = createAdminClient()\n  const { count: sessionCount } = await adminClientCount2\n    .from('mock_services')"
);

// In deleteMockService
code = code.replace(
  "const { error } = await supabase\n    .from('mock_services')\n    .delete()",
  "const adminClient = createAdminClient()\n  const { error } = await adminClient\n    .from('mock_services')\n    .delete()"
);

fs.writeFileSync('src/app/dashboard/mocks/actions.ts', code);
console.log('actions.ts updated to use admin client');
