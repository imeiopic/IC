const devcert = require('devcert');
const fs = require('fs');
const path = require('path');

(async () => {
  const ssl = await devcert.certificateFor('localhost');
  const sslDir = path.join(__dirname, 'ssl');

  if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
  }

  fs.writeFileSync(path.join(sslDir, 'localhost.key'), ssl.key);
  fs.writeFileSync(path.join(sslDir, 'localhost.crt'), ssl.cert);
  console.log('SSL certificate and key generated in ./ssl');
})();
