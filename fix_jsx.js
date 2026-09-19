const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8');

code = code.replace('</div> <!-- End of grid -->', '</div> {/* End of grid */}');

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', code);
console.log('Fixed JSX comment');
