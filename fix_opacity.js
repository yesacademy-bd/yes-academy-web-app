const fs = require('fs')
let content = fs.readFileSync('src/app/login/page.tsx', 'utf8')

// Remove opacity: 0 from inline styles to prevent React re-render bugs
content = content.replace(/style=\{\{\s*opacity:\s*0,\s*animationDelay:\s*'100ms'\s*\}\}/g, "style={{ animationDelay: '100ms', animationFillMode: 'both' }}")
content = content.replace(/style=\{\{\s*opacity:\s*0,\s*animationDelay:\s*'200ms'\s*\}\}/g, "style={{ animationDelay: '200ms', animationFillMode: 'both' }}")
content = content.replace(/style=\{\{\s*opacity:\s*0,\s*animationDelay:\s*'300ms'\s*\}\}/g, "style={{ animationDelay: '300ms', animationFillMode: 'both' }}")

// Make the text explicitly bright red and bolder
content = content.replace(/text-\[\#E10600\] leading-\[0\.85\]/, "font-bold text-[#E10600] leading-[0.85] text-red-600")

// And also enforce color via inline style just to be completely immune to tailwind bugs
content = content.replace(/<h1 className=\{(.*?)\}>/g, "<h1 className={$1} style={{ color: '#E10600' }}>")


fs.writeFileSync('src/app/login/page.tsx', content)
console.log("Updated page.tsx")
