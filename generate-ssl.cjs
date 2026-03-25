const devcert = require('devcert');
const fs = require('fs');
const path = require('path');

(async () => {
  const ssl = await devcert.certificateFor('localhost');
  fs.writeFileSync(path.join(__dirname, 'ssl', 'localhost.key'), ssl.key);
  fs.writeFileSync(path.join(__dirname, 'ssl', 'localhost.crt'), ssl.cert);
  console.log('SSL certificate and key generated in ./ssl');
})();
