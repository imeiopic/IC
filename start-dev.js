import crypto from "crypto";
import devcert from "devcert";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDevEnvironment() {
  const bypassSsl =
    process.argv.includes("--no-ssl") || process.env.NO_SSL === "true";

  if (bypassSsl) {
    console.log(
      "Bypassing SSL generation. Initializing substrate in HTTP mode...",
    );
    process.env.VITE_SSL_STRATEGY = "none";
    execSync("npm run dev:all-concurrent-http", { stdio: "inherit" });
    return;
  }

  const certsDir = path.join(__dirname, ".devcerts");
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir);
  }

  // Use forward slashes to prevent shell escape issues on Windows
  const keyPath = path.join(certsDir, "key.pem").replace(/\\/g, "/");
  const certPath = path.join(certsDir, "cert.pem").replace(/\\/g, "/");

  let shouldGenerate = true;

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const certBuffer = fs.readFileSync(certPath);
    const x509 = new crypto.X509Certificate(certBuffer);

    // Check if the certificate is still valid (with a 7-day buffer)
    const expiryDate = new Date(x509.validTo);
    const now = new Date();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (expiryDate.getTime() - now.getTime() > sevenDaysInMs) {
      console.log(
        `Using existing SSL certificates (Valid until: ${x509.validTo})`,
      );
      shouldGenerate = false;
    }
  }

  try {
    if (shouldGenerate) {
      console.log(
        "Generating/Refreshing SSL certificates for local development...",
      );
      const { key, cert } = await devcert.certificateFor([
        "localhost",
        "web.localhost",
      ]);
      fs.writeFileSync(keyPath, key);
      fs.writeFileSync(certPath, cert);
      console.log("SSL certificates saved to .devcerts/");
    }

    // Set environment variables for both frontend (Vite) and backend (Fireback)
    process.env.VITE_SSL_KEY_PATH = keyPath;
    process.env.VITE_SSL_CERT_PATH = certPath;
    process.env.VITE_SSL_STRATEGY = "custom"; // Indicate custom paths are used for Vite
    process.env.FIREBACK_SSL_KEY_PATH = keyPath;
    process.env.FIREBACK_SSL_CERT_PATH = certPath;

    const ca = await devcert.certificateFor(["localhost", "web.localhost"], {
      getCaPath: true,
    });
    process.env.NODE_EXTRA_CA_CERTS = ca.caPath;

    // Now execute the concurrently command, which will pick up these env vars
    console.log(
      "Starting frontend and backend with generated SSL certificates...",
    );
    execSync("npm run dev:all-concurrent", { stdio: "inherit" });
  } catch (error) {
    console.error(
      "Failed to generate SSL certificates or start dev environment:",
      error,
    );
    process.exit(1);
  }
}

setupDevEnvironment();
