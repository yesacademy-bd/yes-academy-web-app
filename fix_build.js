const fs = require('fs');

// Fix UserManagementClient.tsx
let users = fs.readFileSync('src/components/hr/UserManagementClient.tsx', 'utf8');
users = users.replace(/className=\{inline-flex px-2 py-1 rounded-full text-xs font-medium \$\{/g, 'className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${');
users = users.replace(/\n\s*\}\}">/g, '\n                    }`}>');
fs.writeFileSync('src/components/hr/UserManagementClient.tsx', users);

// Fix BOM in [id]/page.tsx
const p1 = 'src/app/dashboard/admin/batches/[id]/page.tsx';
let b1 = fs.readFileSync(p1);
if (b1[0] === 0xEF && b1[1] === 0xBB && b1[2] === 0xBF) {
  b1 = b1.subarray(3);
  fs.writeFileSync(p1, b1);
}

const p2 = 'src/app/dashboard/admin/batches/new/page.tsx';
let b2 = fs.readFileSync(p2);
if (b2[0] === 0xEF && b2[1] === 0xBB && b2[2] === 0xBF) {
  b2 = b2.subarray(3);
  fs.writeFileSync(p2, b2);
}

const p3 = 'src/app/dashboard/enrollments/page.tsx';
let b3 = fs.readFileSync(p3);
if (b3[0] === 0xEF && b3[1] === 0xBB && b3[2] === 0xBF) {
  b3 = b3.subarray(3);
  fs.writeFileSync(p3, b3);
}

const p4 = 'src/app/dashboard/hr/reports/page.tsx';
let b4 = fs.readFileSync(p4);
if (b4[0] === 0xEF && b4[1] === 0xBB && b4[2] === 0xBF) {
  b4 = b4.subarray(3);
  fs.writeFileSync(p4, b4);
}

const p5 = 'src/app/dashboard/leave-requests/page.tsx';
let b5 = fs.readFileSync(p5);
if (b5[0] === 0xEF && b5[1] === 0xBB && b5[2] === 0xBF) {
  b5 = b5.subarray(3);
  fs.writeFileSync(p5, b5);
}

