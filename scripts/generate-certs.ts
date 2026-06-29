import devcert from 'devcert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generate() {
  const domain = 'localhost';
  // Resolve to project root
  const rootDir = path.resolve(__dirname, '..');
  const sslDir = path.join(rootDir, '.ssl');

  if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
  }

  const keyPath = path.join(sslDir, 'key.pem');
  const certPath = path.join(sslDir, 'cert.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return;
  }

  console.log('🛡️  IOPIC_SSL: Sighting local environment. Generating trusted certificates...');
  try {
    const ssl = await devcert.certificateFor(domain);
    fs.writeFileSync(keyPath, ssl.key);
    fs.writeFileSync(certPath, ssl.cert);
    console.log('✅ IOPIC_SSL: Certificates installed and saved to .ssl/');
  } catch (error) {
    console.error('❌ IOPIC_SSL: Access Denied. Ensure you are running this terminal as Administrator for the initial certificate grounding.', error);
    process.exit(1);
  }
}

generate();