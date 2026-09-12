const fs = require('fs');
const p = 'src/components/batches/EnrollmentManager.tsx';
let c = fs.readFileSync(p, 'utf8');

if (!c.includes('const [view, setView] = useState')) {
  c = c.replace(
    'const [optimisticPortal, setOptimisticPortal] = useState<Record<string, boolean>>({})',
    'const [optimisticPortal, setOptimisticPortal] = useState<Record<string, boolean>>({})\n  const [view, setView] = useState<\'Active\' | \'Cancelled\' | \'Switched\'>(\'Active\')'
  );
}

// Ensure portal filtering only applies to Active students OR filter students before mapping
c = c.replace(
  'const filteredStudents = students.filter(s => {',
  `const filteredStudents = students.filter(s => s.enrollment_data?.status === view || (!s.enrollment_data?.status && view === 'Active')).filter(s => {`
);

// Add tabs UI above the table
const tabsHTML = `
      <div className="mb-4 flex gap-4 border-b border-slate-200">
        <button onClick={() => setView('Active')} className={\`pb-2 px-1 font-medium \${view === 'Active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}\`}>Enrolled Students ({students.filter(s => s.enrollment_data?.status === 'Active' || !s.enrollment_data?.status).length})</button>
        <button onClick={() => setView('Cancelled')} className={\`pb-2 px-1 font-medium \${view === 'Cancelled' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-700'}\`}>Cancelled ({students.filter(s => s.enrollment_data?.status === 'Cancelled').length})</button>
        <button onClick={() => setView('Switched')} className={\`pb-2 px-1 font-medium \${view === 'Switched' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'}\`}>Switched ({students.filter(s => s.enrollment_data?.status === 'Switched').length})</button>
      </div>
`;

if (!c.includes('Enrolled Students (')) {
  c = c.replace(
    '<div className="overflow-x-auto">',
    tabsHTML + '\n      <div className="overflow-x-auto">'
  );
}

// Add Remarks column for non-active users
c = c.replace(
  '<th className="p-4">Reference</th>',
  '<th className="p-4">Reference</th>\n                {view !== \'Active\' && <th className="p-4">Remarks</th>}'
);
c = c.replace(
  '<th className="p-4 text-center">Portal Assigned</th>',
  '{view === \'Active\' && <th className="p-4 text-center">Portal Assigned</th>}'
);

// Update table rows
c = c.replace(
  '<td className="p-4 text-sm text-gray-600">{enrollment?.reference || \'-\'}</td>',
  '<td className="p-4 text-sm text-gray-600">{enrollment?.reference || \'-\'}</td>\n                      {view !== \'Active\' && <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={enrollment?.remarks}>{enrollment?.remarks || \'-\'}</td>}'
);

c = c.replace(
  '<td className="p-4 text-center">',
  '{view === \'Active\' && <td className="p-4 text-center">'
);

c = c.replace(
  '</select>\n                      </td>',
  '</select>\n                      </td>}'
);

fs.writeFileSync(p, c);
