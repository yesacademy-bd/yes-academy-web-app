const fs = require('fs');

const path = 'src/components/reports/BDMReportClient.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /<div className="flex gap-2">[\s\S]*?<Sparkles[\s\S]*?<\/button>\s*<\/div>/;
console.log(code.match(regex)?.[0]);
