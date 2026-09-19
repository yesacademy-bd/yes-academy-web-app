const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/actions.ts', 'utf8');

code = code.replace(
  "const payment_method = formData.get('payment_method') as string",
  "const payment_method = (formData.get('payment_method') as string) || (formData.get('mock_status') === 'Free' ? 'None' : 'Cash')"
);

fs.writeFileSync('src/app/dashboard/mocks/actions.ts', code);
console.log('actions.ts updated');
