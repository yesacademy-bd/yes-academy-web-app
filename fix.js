const fs = require('fs');
let content = fs.readFileSync('src/components/hr/UserManagementClient.tsx', 'utf8');
content = content.replace(/<div className="mb-6 flex gap-4">[\s\S]*?<\/div>/, `<div className="mb-6 flex gap-4">
        <button onClick={() => setView('active')} className={\`px-4 py-2 rounded-lg font-medium transition-colors \${view === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}\`}>Active Users</button>
        <button onClick={() => setView('suspended')} className={\`px-4 py-2 rounded-lg font-medium transition-colors \${view === 'suspended' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}\`}>Suspended Users</button>
      </div>`);
fs.writeFileSync('src/components/hr/UserManagementClient.tsx', content);
