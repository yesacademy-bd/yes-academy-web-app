const fs = require('fs');

const p1 = 'src/app/dashboard/admin/batches/[id]/page.tsx';
let c1 = fs.readFileSync(p1, 'utf8');
c1 = c1.replace(/\.eq\('role', 'Faculty'\)/g, `.eq('role', 'Faculty').eq('is_suspended', false)`);
fs.writeFileSync(p1, c1);

const p2 = 'src/app/dashboard/admin/batches/new/page.tsx';
let c2 = fs.readFileSync(p2, 'utf8');
c2 = c2.replace(/\.eq\('role', 'Faculty'\)/g, `.eq('role', 'Faculty').eq('is_suspended', false)`);
fs.writeFileSync(p2, c2);
