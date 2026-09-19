const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/actions.ts', 'utf8');

code = code.replace(/select\('role, full_name'\)/g, "select('role, display_name')");
code = code.replace(/profile\?\.full_name/g, "profile?.display_name");

fs.writeFileSync('src/app/dashboard/mocks/actions.ts', code);
console.log('actions.ts display_name updated');
