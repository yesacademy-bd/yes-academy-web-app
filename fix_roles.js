const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/actions.ts', 'utf8');

// Change the JS error messages to be more specific just in case.
code = code.replace(
  /if \(\!\['Admin', 'HR', 'BDM'\]\.includes\(profile\?\.role \|\| ''\)\) return \{ success: false, message: 'Admin or HR only' \}/g,
  "if (!['Admin', 'HR', 'BDM'].includes(profile?.role || '')) return { success: false, message: 'Admin, HR, or BDM only (Your role: ' + profile?.role + ')' }"
);

fs.writeFileSync('src/app/dashboard/mocks/actions.ts', code);
console.log('actions updated');
