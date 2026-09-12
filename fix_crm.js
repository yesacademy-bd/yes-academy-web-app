const fs = require('fs');

const path = 'src/app/dashboard/crm/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add 'status' to the select
if (!code.includes('id, status, enrolled_at')) {
  code = code.replace(
    'id, enrolled_at, course_fee,',
    'id, status, enrolled_at, course_fee,'
  );
}

// 2. Filter out Switched and set due_amount to 0 for Cancelled
if (!code.includes('filter((e: any) => e.status !== \'Switched\')')) {
  code = code.replace(
    'const enrollments = enrollmentsData?.map((e: any) => ({',
    'const enrollments = enrollmentsData?.filter((e: any) => e.status !== \'Switched\').map((e: any) => ({'
  );
}

if (!code.includes('due_amount: e.status === \'Cancelled\' ? 0 : (e.due_amount || 0),')) {
  code = code.replace(
    'due_amount: e.due_amount || 0,',
    'due_amount: e.status === \'Cancelled\' ? 0 : (e.due_amount || 0),'
  );
}

fs.writeFileSync(path, code);
