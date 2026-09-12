const fs = require('fs');
let code = fs.readFileSync('src/components/batches/EnrollmentManager.tsx', 'utf8');
const match = code.match(/<\/select>\s*<\/div>\s*<div className="overflow-x-auto">/);
console.log(match ? "Matched" : "No match");
