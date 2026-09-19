const fs = require('fs');

const path = 'src/app/actions/ai.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/model: 'gemini-2.5-flash'/g, "model: 'gemini-3.6-flash'");

fs.writeFileSync(path, code);
