const https = require('https');
https.get('https://tinyurl.com/2t667xrf', (res) => {
  console.log('Location:', res.headers.location);
});
