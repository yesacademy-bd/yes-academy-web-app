const fs = require('fs');

const p = 'src/app/dashboard/admin/batches/[id]/page.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  'portal_assigned: e.portal_assigned,',
  'portal_assigned: e.portal_assigned,\n      status: e.status || \'Active\',\n      remarks: e.remarks,'
);

fs.writeFileSync(p, c);
