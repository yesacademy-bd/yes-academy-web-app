const fs = require('fs');

const path = 'src/app/dashboard/enrollments/page.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes(".eq('status', 'Active')")) {
  code = code.replace(
    /supabase\.from\('enrollments'\)\.select\([\s\S]*?\)\.order\('enrolled_at', \{ ascending: false \}\)/,
    "supabase.from('enrollments').select(`\n        id, enrolled_at,\n        students ( name, phone ),\n        batches ( batch_name )\n      `).eq('status', 'Active').order('enrolled_at', { ascending: false })"
  );
  fs.writeFileSync(path, code);
}
