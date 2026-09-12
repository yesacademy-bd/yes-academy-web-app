const fs = require('fs');

const path = 'src/app/dashboard/page.tsx';
let code = fs.readFileSync(path, 'utf8');

if (code.includes("if (profile?.role === 'Admin') redirect('/dashboard/admin/batches')")) {
  code = code.replace(
    "if (profile?.role === 'Admin') redirect('/dashboard/admin/batches')",
    "// if (profile?.role === 'Admin') redirect('/dashboard/admin/batches')"
  );
  fs.writeFileSync(path, code);
}
