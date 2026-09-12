const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/admin/batches/enroll-actions.ts', 'utf8');

code = code.replace(
  'due_amount: oldData.due_amount,',
  '// due_amount is a generated column and cannot be explicitly inserted'
);

fs.writeFileSync('src/app/dashboard/admin/batches/enroll-actions.ts', code);
