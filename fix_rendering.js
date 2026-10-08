const fs = require('fs')
let content = fs.readFileSync('src/app/login/page.tsx', 'utf8')

// Remove mix-blend-multiply from the headline yellow bar
content = content.replace(/bg-\[\#FFD700\] bottom-4 lg:bottom-6 left-0 transform rotate-1 rounded-sm opacity-90 mix-blend-multiply/g, "bg-[#FFD700] bottom-4 lg:bottom-6 left-0 transform rotate-1 rounded-sm opacity-80")

// Remove mix-blend-multiply from the scrapbook polaroid yellow tape
content = content.replace(/bg-\[\#FFD700\] opacity-90 shadow-sm mix-blend-multiply/g, "bg-[#FFD700] opacity-90 shadow-sm")

// Remove mix-blend-multiply from the main login card yellow tape
content = content.replace(/bg-\[\#FFD700\] shadow-sm mix-blend-multiply/g, "bg-[#FFD700] shadow-sm")

// Remove drop-shadow-sm from the h1
content = content.replace(/tracking-tight drop-shadow-sm transform/g, "tracking-tight transform")

// Remove any remaining mix-blend-multiply anywhere in the file
content = content.replace(/mix-blend-multiply/g, "")

fs.writeFileSync('src/app/login/page.tsx', content)
console.log("Removed all mix-blend-multiply and drop-shadows")
