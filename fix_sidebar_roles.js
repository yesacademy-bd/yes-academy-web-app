const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
code = code.replace(
  /roles: \['Admin', 'HR', 'BDM'\]/g,
  "roles: ['Admin', 'HR', 'BDM', 'Faculty']"
);
fs.writeFileSync('src/components/layout/Sidebar.tsx', code);
console.log('Sidebar patched');
