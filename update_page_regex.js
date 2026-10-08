const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/faculty/batches/page.tsx', 'utf8')

content = content.replace(/schedule_days,/g, 'schedule_days,\n        total_classes,\n        additional_classes,')

fs.writeFileSync('src/app/dashboard/faculty/batches/page.tsx', content)
console.log("Done regex updating page.tsx")
