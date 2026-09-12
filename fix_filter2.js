const fs = require('fs');
let code = fs.readFileSync('src/components/batches/EnrollmentManager.tsx', 'utf8');

code = code.replace(
  /\{students\.filter\(s => \{\s*if \(portalFilter === 'All'\) return true;/m,
  "{students.filter(s => {\n                  const status = s.enrollment_data?.status || 'Active';\n                  if (status !== view) return false;\n                  if (portalFilter === 'All') return true;"
);

fs.writeFileSync('src/components/batches/EnrollmentManager.tsx', code);
