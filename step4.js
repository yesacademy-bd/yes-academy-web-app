const fs = require('fs');

const clientPath = 'src/app/dashboard/enrollments/EnrollmentClient.tsx';
let clientCode = fs.readFileSync(clientPath, 'utf8');

if (!clientCode.includes('import StudentDatabaseFilter')) {
  clientCode = clientCode.replace(
    'import GlobalLoader from \'@/components/GlobalLoader\'',
    'import GlobalLoader from \'@/components/GlobalLoader\'\nimport StudentDatabaseFilter from \'@/components/enrollments/StudentDatabaseFilter\''
  );
}

if (!clientCode.includes('<StudentDatabaseFilter batches={batches} />')) {
  clientCode = clientCode.replace(
    '{/* Recent Enrollments Table */}',
    '<StudentDatabaseFilter batches={batches} />\n\n      {/* Recent Enrollments Table */}'
  );
}

fs.writeFileSync(clientPath, clientCode);
