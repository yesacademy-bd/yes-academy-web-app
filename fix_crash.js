const fs = require('fs')

let content = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8')

// 1. Remove "?" in Fee and Due strings
content = content.replace(/Fee:\s*\?\{/g, 'Fee: {')
content = content.replace(/Due:\s*\?\{/g, 'Due: {')
content = content.replace(/Paid:\s*\?\{/g, 'Paid: {')

// 2. Fix createPortal for editModal
// Find the exact occurrence of `)}` right before `Switch Date Modal`
const marker = '      {/* Switch Date Modal */}'
const idx = content.indexOf(marker)
if (idx !== -1) {
    const stringBefore = content.substring(0, idx)
    // Find the last `)}` before the marker
    const lastBraceIdx = stringBefore.lastIndexOf(')}')
    if (lastBraceIdx !== -1) {
        // Only modify if it doesn't already have `document.body`
        if (!stringBefore.includes(', document.body\n      )}')) {
            const part1 = stringBefore.substring(0, lastBraceIdx)
            const newEnding = ",\n        document.body\n      " + stringBefore.substring(lastBraceIdx)
            content = part1 + newEnding + content.substring(idx)
        }
    }
}

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', content)
