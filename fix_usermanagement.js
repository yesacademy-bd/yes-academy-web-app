const fs = require('fs');
const p = 'src/components/hr/UserManagementClient.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  "const [showPassword, setShowPassword] = useState(false)",
  "const [showPassword, setShowPassword] = useState(false)\n  const [view, setView] = useState<'active' | 'suspended'>('active')"
);

const beforeTable = `<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-900">Staff Accounts</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>`;

const afterTable = `<div className="mb-6 flex gap-4">
        <button onClick={() => setView('active')} className={\`px-4 py-2 rounded-lg font-medium transition-colors \${view === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}\`}>Active Users</button>
        <button onClick={() => setView('suspended')} className={\`px-4 py-2 rounded-lg font-medium transition-colors \${view === 'suspended' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}\`}>Suspended Users</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-900">{view === 'active' ? 'Active Staff' : 'Suspended Staff'}</h2>
          {view === 'active' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          )}
        </div>`;

c = c.replace(beforeTable, afterTable);
c = c.replace(/users\.map\(u =>/g, "users.filter(u => view === 'active' ? !u.is_banned : u.is_banned).map(u =>");
c = c.replace(/users\.length === 0/g, "users.filter(u => view === 'active' ? !u.is_banned : u.is_banned).length === 0");

fs.writeFileSync(p, c);
