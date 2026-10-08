const fs = require('fs')

let content = fs.readFileSync('src/app/login/LoginForm.tsx', 'utf8')

// The hand-drawn button style
const buttonStyle = `        style={{
          borderRadius: '2px 255px 3px 225px / 255px 5px 225px 3px',
          border: 'solid 2px transparent'
        }}`

content = content.replace(/style=\{\{[\s\S]*?\}\}/, buttonStyle)

fs.writeFileSync('src/app/login/LoginForm.tsx', content)
console.log("Updated button in LoginForm.tsx")
