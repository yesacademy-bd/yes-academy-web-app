const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/leave-requests/[id]/page.tsx', 'utf8');

if (!code.includes('import PrintButton')) {
  code = code.replace(
    "import DecisionForm from './DecisionForm'",
    "import DecisionForm from './DecisionForm'\nimport PrintButton from './PrintButton'"
  );
  
  const linkRegex = /<Link href=\{`\/dashboard\/leave-requests\/\$\{req\.id\}\/print`\} target="_blank"[\s\S]*?<\/Link>/;
  code = code.replace(linkRegex, '<PrintButton id={req.id} />');
  
  fs.writeFileSync('src/app/dashboard/leave-requests/[id]/page.tsx', code);
}
