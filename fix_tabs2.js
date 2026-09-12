const fs = require('fs');

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

if (!bmCode.includes('Switched ({students.filter(s =>')) {
  bmCode = bmCode.replace(
    /<\/select>\s*<\/div>\s*<div className="overflow-x-auto">/,
    '</select>\n          </div>\n' + tabsHTML
  );
  
  // also change the title h3 from `Enrolled Students ({students.length})` to just `Students` or `Batch Roster`
  bmCode = bmCode.replace(
    /<h3 className="font-semibold text-gray-900">Enrolled Students \(\{students\.length\}\)<\/h3>/,
    '<h3 className="font-semibold text-gray-900">Batch Roster</h3>'
  );
  
  fs.writeFileSync(batchManagerPath, bmCode);
}
