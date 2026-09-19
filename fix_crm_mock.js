const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

code = code.replace(/total_fee: m\.amount \|\| 0,/g, 'total_fee: m.course_fee || m.amount || 0,');
code = code.replace(/item_name: m\.mock_type,/g, 'item_name: m.service_type || m.mock_type,');

fs.writeFileSync('src/app/dashboard/crm/page.tsx', code);
console.log('CRMPage updated');
