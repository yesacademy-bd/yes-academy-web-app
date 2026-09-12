const fs = require('fs');
let users = fs.readFileSync('src/components/hr/UserManagementClient.tsx', 'utf8');

users = users.replace(/className=\{inline-flex px-2 py-1 rounded-full text-xs font-medium \}/g, 'className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${u.role === "Admin" ? "bg-purple-100 text-purple-700" : ["HR", "BDM"].includes(u.role) ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}');

fs.writeFileSync('src/components/hr/UserManagementClient.tsx', users);
