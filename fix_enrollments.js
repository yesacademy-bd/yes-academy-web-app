const fs = require('fs');
const p3 = 'src/app/dashboard/enrollments/page.tsx';
let c3 = fs.readFileSync(p3, 'utf8');
c3 = c3.replace(/\.eq\('is_suspended', false\)/g, '');
c3 = c3.replace(/\.eq\('role', 'Faculty'\)/g, `.eq('role', 'Faculty').eq('is_suspended', false)`);
fs.writeFileSync(p3, c3);
