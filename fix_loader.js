const fs = require('fs');

const path = 'src/components/GlobalLoader.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'src="https://tinyurl.com/2z9nfau3"',
  'src="https://tinyurl.com/2t667xrf"'
);

fs.writeFileSync(path, code);
