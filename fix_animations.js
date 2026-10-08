const fs = require('fs')
let content = fs.readFileSync('src/app/login/page.tsx', 'utf8')

content = content.replace(/animation: customFadeIn 1s ease-out forwards;/g, "animation: customFadeIn 1s ease-out both;")
content = content.replace(/animation: customSlideUp 0.8s cubic-bezier\(0.16, 1, 0.3, 1\) forwards;/g, "animation: customSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;")

content = content.replace(/relative z-10 animate-custom-slide-up/g, "relative z-20 animate-custom-slide-up")
content = content.replace(/relative z-10\`/g, "relative z-20`")

fs.writeFileSync('src/app/login/page.tsx', content)
console.log("Updated page.tsx animations and z-index")
