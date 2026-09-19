const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8');

const formStartRegex = /<form onSubmit=\{handleAdd\} className="space-y-4">/;
const newFormStart = `<form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
code = code.replace(formStartRegex, newFormStart);

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', code);
console.log('Fixed missing form grid wrapper');
