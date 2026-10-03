const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8')

// Fix grid in printable report content
content = content.replace(/className="grid grid-cols-2 md:grid-cols-3 gap-4/g, 'className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4')

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', content)
console.log("Done")
