const fs = require('fs');
const path = require('path');

// 1. Pagination fix in EnrollmentClient.tsx
let clientPath = 'src/app/dashboard/enrollments/EnrollmentClient.tsx';
let clientCode = fs.readFileSync(clientPath, 'utf8');

if (!clientCode.includes('import { useState, useEffect }')) {
  clientCode = clientCode.replace('import { useState }', 'import { useState, useEffect }');
}

if (!clientCode.includes('useEffect(() => { setIsPaginating(false) }, [currentPage])')) {
  clientCode = clientCode.replace(
    'const handlePagination = (page: number) => {',
    'useEffect(() => { setIsPaginating(false) }, [currentPage])\n\n  const handlePagination = (page: number) => {'
  );
}
fs.writeFileSync(clientPath, clientCode);

