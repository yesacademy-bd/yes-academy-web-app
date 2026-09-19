const fs = require('fs');

const path = 'src/app/actions/ai.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/model: 'gemini-pro-latest'/g, "model: 'gemini-2.5-flash'");
code = code.replace(/model: 'gemini-flash-latest'/g, "model: 'gemini-2.5-flash'");

fs.writeFileSync(path, code);
