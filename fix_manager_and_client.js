const fs = require('fs');

// Fix Batch Manager Tabs
const batchManagerPath = 'src/components/batches/EnrollmentManager.tsx';
let bmCode = fs.readFileSync(batchManagerPath, 'utf8');

const tabsHTML = `
          </div>
          <div className="mb-4 flex gap-4 border-b border-slate-200 px-4">
            <button onClick={() => setView('Active')} className={\`pb-2 px-1 font-medium \${view === 'Active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}\`}>Enrolled Students ({students.filter(s => s.enrollment_data?.status === 'Active' || !s.enrollment_data?.status).length})</button>
            <button onClick={() => setView('Cancelled')} className={\`pb-2 px-1 font-medium \${view === 'Cancelled' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-700'}\`}>Cancelled ({students.filter(s => s.enrollment_data?.status === 'Cancelled').length})</button>
            <button onClick={() => setView('Switched')} className={\`pb-2 px-1 font-medium \${view === 'Switched' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'}\`}>Switched ({students.filter(s => s.enrollment_data?.status === 'Switched').length})</button>
          </div>
          <div className="overflow-x-auto">
`;

bmCode = bmCode.replace(
  '          </div>\n          <div className="overflow-x-auto">',
  tabsHTML
);
if (!bmCode.includes('Enrolled Students (')) {
  bmCode = bmCode.replace(
    '          </div>\r\n          <div className="overflow-x-auto">',
    tabsHTML
  );
}
fs.writeFileSync(batchManagerPath, bmCode);

// Pass courses to StudentDatabaseFilter
const clientPath = 'src/app/dashboard/enrollments/EnrollmentClient.tsx';
let clientCode = fs.readFileSync(clientPath, 'utf8');
clientCode = clientCode.replace(
  '<StudentDatabaseFilter batches={batches} />',
  '<StudentDatabaseFilter batches={batches} courses={courses} />'
);
fs.writeFileSync(clientPath, clientCode);

