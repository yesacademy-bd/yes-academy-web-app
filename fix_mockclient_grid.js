const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8')

// Replace fixed grids with responsive grids
content = content.replace(/className="grid grid-cols-2 gap-4/g, 'className="grid grid-cols-1 sm:grid-cols-2 gap-4')
content = content.replace(/className="grid grid-cols-2 gap-y-5 gap-x-4/g, 'className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4')

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', content)
console.log("Done MockClient")
