const fs = require('fs');

const f1 = 'src/app/dashboard/faculty/batches/[id]/page.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(
  ".eq('batch_id', id)",
  ".eq('batch_id', id)\n    .eq('status', 'Active')"
);
fs.writeFileSync(f1, c1);

const f2 = 'src/app/dashboard/faculty/reports/page.tsx';
if (fs.existsSync(f2)) {
  let c2 = fs.readFileSync(f2, 'utf8');
  if (c2.includes(".from('enrollments')")) {
    c2 = c2.replace(
      ".from('enrollments')\n      .select",
      ".from('enrollments')\n      .select('*, students(name)').eq('status', 'Active')" // Simplified matching logic if applicable
    );
    // Actually, maybe I shouldn't touch reports if I don't know the exact syntax
  }
}

