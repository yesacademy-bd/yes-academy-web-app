const fs = require('fs');

const path = 'src/app/actions/ai.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("model: 'gemini-flash-latest'", "model: 'gemini-pro-latest'");

fs.writeFileSync(path, code);
