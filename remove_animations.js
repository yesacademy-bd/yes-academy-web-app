const fs = require('fs')
let content = fs.readFileSync('src/app/login/page.tsx', 'utf8')

// Remove style block
content = content.replace(/<style>\{`[\s\S]*?`\}<\/style>/, '')

// Remove animation classes and inline styles
content = content.replace(/animate-custom-slide-up/g, '')
content = content.replace(/animate-custom-fade-in/g, '')
content = content.replace(/animate-float/g, '')
content = content.replace(/animate-pulse/g, '')
content = content.replace(/animate-\[spin_20s_linear_infinite\]/g, '')

// Remove inline styles that have animationDelay
content = content.replace(/style=\{\{\s*animationDelay[^}]+\}\}/g, '')

fs.writeFileSync('src/app/login/page.tsx', content)
console.log("Removed all animations")
