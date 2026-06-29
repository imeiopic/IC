const devcert = require('devcert');
const fs = require('fs');
const path = require('path');

async function generate() {
  const sslDir = path.join(__dirname, 'ssl');
  const keyPath = path.join(sslDir, 'localhost.key');
  const certPath = path.join(sslDir, 'localhost.crt');
  const caPath = path.join(sslDir, 'ca.crt');

  // Check if certificates already exist to avoid redundant prompts
  if (fs.existsSync(keyPath) && fs.existsSync(certPath) && fs.existsSync(caPath)) {
    return;
  }

  const domains = ['localhost', 'api.localhost', 'web.localhost'];
  console.log(`🚀 SSL certificates missing. Generating for ${domains.join(', ')} with devcert...`);

  try {
    // Generate the certificate for localhost
    const ssl = await devcert.certificateFor(domains, { getCaBuffer: true });

    if (!fs.existsSync(sslDir)) {
      fs.mkdirSync(sslDir, { recursive: true });
    }

    fs.writeFileSync(keyPath, ssl.key);
    fs.writeFileSync(certPath, ssl.cert);
    fs.writeFileSync(caPath, ssl.ca);

    console.log('✅ SSL certificates successfully generated in ./ssl/');
  } catch (err) {
    console.error('❌ Failed to generate SSL certificates:', err);
    process.exit(1);
  }
}

generate();