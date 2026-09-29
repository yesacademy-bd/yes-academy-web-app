const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/admin/batches/enroll-actions.ts', 'utf8')
content = content.replace("revalidatePath(/dashboard/admin/batches/)", "revalidatePath(`/dashboard/admin/batches/${batchId}`)")
fs.writeFileSync('src/app/dashboard/admin/batches/enroll-actions.ts', content)
