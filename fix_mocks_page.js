const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/page.tsx', 'utf8');
code = code.replace(
  /\!\[\'Admin\', \'HR\', \'BDM\'\]\.includes/g,
  "!['Admin', 'HR', 'BDM', 'Faculty'].includes"
);
fs.writeFileSync('src/app/dashboard/mocks/page.tsx', code);
console.log('page.tsx patched');
