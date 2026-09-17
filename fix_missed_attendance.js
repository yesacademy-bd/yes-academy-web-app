const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// Update the role condition
code = code.replace(
  "{['HR', 'BDM'].includes(role) && (",
  "{['HR', 'BDM', 'Admin'].includes(role) && ("
);

// Update the link href for Missed Attendance
// The original link is href={`/dashboard/faculty/batches/${b.id}`}
code = code.replace(
  /href=\{`\/dashboard\/faculty\/batches\/\$\{b\.id\}`\}/,
  "href={`/dashboard/${role === 'Admin' ? 'admin' : 'faculty'}/batches/${b.id}`}"
);

fs.writeFileSync('src/app/dashboard/page.tsx', code);
