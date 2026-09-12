const fs = require('fs');
let c = fs.readFileSync('src/components/batches/EnrollmentManager.tsx', 'utf8');

c = c.replace(
  '                      </select>\r\n                    </td>',
  '                      </select>\r\n                    </td>}'
);

c = c.replace(
  '                      </select>\n                    </td>',
  '                      </select>\n                    </td>}'
);

fs.writeFileSync('src/components/batches/EnrollmentManager.tsx', c);
