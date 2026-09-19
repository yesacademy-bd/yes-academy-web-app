const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

code = code.replace(
  /{ name: 'Mock Services', href: '\/dashboard\/mocks', icon: FileText, roles: \['HR'\] },/g,
  "{ name: 'Mock Services', href: '/dashboard/mocks', icon: FileText, roles: ['Admin', 'HR', 'BDM'] },"
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', code);
console.log('Sidebar updated');
