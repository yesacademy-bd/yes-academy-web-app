const fs = require('fs');

// Fix Batch Manager Tabs
const batchManagerPath = 'src/components/batches/EnrollmentManager.tsx';
let bmCode = fs.readFileSync(batchManagerPath, 'utf8');

const tabsHTML = `
          <div className="mb-4 flex gap-4 border-b border-slate-200 px-4 pt-4 bg-white">
            <button onClick={() => setView('Active')} className={\`pb-2 px-1 font-medium \${view === 'Active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}\`}>Enrolled Students ({students.filter(s => s.enrollment_data?.status === 'Active' || !s.enrollment_data?.status).length})</button>
            <button onClick={() => setView('Cancelled')} className={\`pb-2 px-1 font-medium \${view === 'Cancelled' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-700'}\`}>Cancelled ({students.filter(s => s.enrollment_data?.status === 'Cancelled').length})</button>
            <button onClick={() => setView('Switched')} className={\`pb-2 px-1 font-medium \${view === 'Switched' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'}\`}>Switched ({students.filter(s => s.enrollment_data?.status === 'Switched').length})</button>
          </div>
          <div className="overflow-x-auto">
`;

if (!bmCode.includes('Enrolled Students (')) {
  bmCode = bmCode.replace(
    /<\/select>\s*<\/div>\s*<div className="overflow-x-auto">/,
    '</select>\n          </div>' + tabsHTML
  );
  fs.writeFileSync(batchManagerPath, bmCode);
}
