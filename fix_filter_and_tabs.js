const fs = require('fs');

const path = 'src/components/batches/EnrollmentManager.tsx';
let code = fs.readFileSync(path, 'utf8');

// Fix the tabs UI styling
const oldTabsHTML = `
            <div className="mb-4 flex gap-4 border-b border-slate-200 px-4 pt-4 bg-white">
              <button onClick={() => setView('Active')} className={\`pb-2 px-1 font-medium \${view === 'Active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}\`}>Enrolled Students ({students.filter(s => s.enrollment_data?.status === 'Active' || !s.enrollment_data?.status).length})</button>
              <button onClick={() => setView('Cancelled')} className={\`pb-2 px-1 font-medium \${view === 'Cancelled' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-700'}\`}>Cancelled ({students.filter(s => s.enrollment_data?.status === 'Cancelled').length})</button>
              <button onClick={() => setView('Switched')} className={\`pb-2 px-1 font-medium \${view === 'Switched' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'}\`}>Switched ({students.filter(s => s.enrollment_data?.status === 'Switched').length})</button>
            </div>
`;

const newTabsHTML = `
            <div className="mb-4 flex gap-3 px-4 pt-4 bg-white">
              <button onClick={() => setView('Active')} className={\`px-4 py-2 rounded-lg font-bold transition-colors \${view === 'Active' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'}\`}>Enrolled Students ({students.filter(s => s.enrollment_data?.status === 'Active' || !s.enrollment_data?.status).length})</button>
              <button onClick={() => setView('Cancelled')} className={\`px-4 py-2 rounded-lg font-bold transition-colors \${view === 'Cancelled' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'}\`}>Cancelled ({students.filter(s => s.enrollment_data?.status === 'Cancelled').length})</button>
              <button onClick={() => setView('Switched')} className={\`px-4 py-2 rounded-lg font-bold transition-colors \${view === 'Switched' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'}\`}>Switched ({students.filter(s => s.enrollment_data?.status === 'Switched').length})</button>
            </div>
`;

// wait, the whitespace in the original code might be slightly different. Let's just do a regex replace for the whole div
code = code.replace(/<div className="mb-4 flex gap-4 border-b border-slate-200 px-4 pt-4 bg-white">[\s\S]*?<\/div>/, newTabsHTML.trim());

// Fix the mapping filter to use the view state
const filterStartStr = `                {students.filter(s => {
                  if (portalFilter === 'All') return true;`;

const newFilterStartStr = `                {students.filter(s => {
                  const status = s.enrollment_data?.status || 'Active';
                  if (status !== view) return false;
                  if (portalFilter === 'All') return true;`;

code = code.replace(filterStartStr, newFilterStartStr);

fs.writeFileSync(path, code);
