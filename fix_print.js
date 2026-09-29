const fs = require('fs')

let content = fs.readFileSync('src/app/dashboard/leave-requests/[id]/print/page.tsx', 'utf8')

// 1. Remove the "How to submit" section
const howToSubmitRegex = /\s*\{\/\* How to submit \*\/\}\s*<div className="border border-\[#1e2a5c\] mb-3">[\s\S]*?<\/ol>\s*<\/div>\s*<\/div>/;
content = content.replace(howToSubmitRegex, '')

// 2. Add strict CSS overrides to fix theme leaking
const styleRegex = /html, body, main, main > div \{[\s\S]*?overflow: visible \!important;\s*\}/
const styleReplacement = `html, body, main, main > div { 
          height: auto !important; 
          overflow: visible !important; 
          background: white !important;
          background-image: none !important;
        }
        #print-container, #print-container * {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow: none !important;
        }
        #print-container {
          background: white !important;
        }
        #pdf-content h1, #pdf-content h2, #pdf-content h3 {
          background: none !important;
          -webkit-background-clip: initial !important;
          background-clip: initial !important;
          -webkit-text-fill-color: initial !important;
          color: #1e2a5c !important;
        }
        #pdf-content .text-\\[\\#1e2a5c\\] {
          color: #1e2a5c !important;
        }
        #pdf-content .bg-\\[\\#1e2a5c\\] {
          background-color: #1e2a5c !important;
          color: white !important;
        }
        #pdf-content .bg-\\[\\#d4f0fa\\] {
          background-color: #d4f0fa !important;
          color: #1e2a5c !important;
        }
        #pdf-content .text-\\[\\#be1e2d\\] {
          color: #be1e2d !important;
        }
        #pdf-content {
          color: black !important;
        }`
        
content = content.replace(styleRegex, styleReplacement)

fs.writeFileSync('src/app/dashboard/leave-requests/[id]/print/page.tsx', content)
