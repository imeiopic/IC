const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const semver = require('semver');
const depcheck = require('depcheck');
const admin = require('firebase-admin');
const options = require('./depcheck.config.ts').default;

/**
 * SSL Substrate Integrity Check
 * Automatically triggers certificate generation if missing from the local substrate.
 */
const sslDir = path.join(__dirname, 'ssl');
const certPath = path.join(sslDir, 'localhost.crt');
const keyPath = path.join(sslDir, 'localhost.key');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('🔒 SSL certificates missing. Synchronizing security substrate...');
  try {
    if (!fs.existsSync(sslDir)) {
      fs.mkdirSync(sslDir);
    }
    execSync('node generate-ssl.cjs', { stdio: 'inherit' });
  } catch (error) {
    console.log('ℹ️  SSL generation deferred: Security substrate (devcert) might be missing.');
  }
}

/**
 * Remote Substrate Symmetry Check
 * Verifies that the local protocol-id matches the one initialized in Firestore.
 */
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'calcium-channel-489906-m2'
});
const db = admin.firestore();

function getLocalProtocolId() {
  try {
    const files = fs.readdirSync(__dirname);
    const protocolFile = files.find(f => f.endsWith('.protocol'));
    if (!protocolFile) return 'unknown';

    const content = fs.readFileSync(path.join(__dirname, protocolFile), 'utf8');
    const match = content.match(/protocol-id:\s*(0x[0-9a-fA-F]+|[0-9]+)/i);
    return match ? match[1] : 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

async function verifyFirestoreSymmetry() {
  console.log('🔍 Checking Protocol ID symmetry with Firestore...');
  const localId = getLocalProtocolId();
  
  try {
    const doc = await db.collection('identities').doc('noland-newton').get();
    if (!doc.exists) {
      console.warn('⚠️  Remote identity not found. Skipping symmetry check.');
      return true;
    }
    const remoteId = doc.data().protocolId;
    if (localId !== remoteId) {
      console.error(`❌ Symmetry Mismatch: Local ID (${localId}) does not match Firestore ID (${remoteId}).`);
      console.error('   Please run "node initialize-entity.js" to synchronize the substrate.');
      return false;
    }
    console.log('✅ Remote substrate symmetry verified.');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed during symmetry check:', error.message);
    return false;
  }
}

/**
 * Protocol Audit: Missing Dependency Scanner
 * This script filters out 'unused' warnings to focus strictly on 
 * functional logic requirements that are not listed in package.json.
 */
async function runDependencyAudit() {
  const symmetryValid = await verifyFirestoreSymmetry();

  depcheck(process.cwd(), options, (unused) => {
  const missingProd = [];
  const missingDev = [];
  const mismatched = [];

  const unusedProd = unused.dependencies;
  const unusedDev = process.env.CI ? [] : unused.devDependencies;

  const installedDeps = { ...options.pkg.dependencies, ...options.pkg.devDependencies };

  Object.entries(unused.missing).forEach(([pkg, files]) => {
    // Filter out files that should be ignored by the protocol
    const activeFiles = files.filter(f => !options.isIgnoredFile?.(f));
    if (activeFiles.length === 0) return;

    // Extract name and version (handling scoped packages like @org/pkg@1.0.0)
    let name = pkg;
    let reqVer = null;
    if (pkg.includes('@', 1)) {
      const parts = pkg.split('@');
      reqVer = parts.pop();
      name = parts.join('@');
    }

    const isDev = activeFiles.every(options.isTestFile);
    const existingVer = installedDeps[name];

    if (reqVer && existingVer) {
      const installedVersion = semver.minVersion(existingVer);
      const reqMajor = (semver.minVersion(reqVer) || semver.coerce(reqVer))?.major;
      const installedMajor = installedVersion?.major;

      // Logic Sovereignty: We only evaluate major version mismatches. 
      // Intra-major variations are assumed compatible within the protocol.
      if (reqMajor !== undefined && installedMajor !== undefined && reqMajor !== installedMajor) {
        // Ignore major mismatches if the installed version is newer (Forward Compatibility)
        if (semver.gtr(installedVersion, reqVer)) {
          return;
        }

        if (options.experimentalPackages?.includes(name)) {
          console.log(`ℹ️  Protocol Notice: Ignoring major mismatch for experimental package "${name}".`);
          return;
        }

        const isUpgrade = semver.ltr(installedVersion, reqVer);
        mismatched.push({ name, reqVer, existingVer, isDev, type: isUpgrade ? 'MAJOR_UPGRADE' : 'MAJOR_DOWNGRADE' });
        return;
      }
    } else if (isDev) {
      missingDev.push(pkg);
    } else {
      missingProd.push(pkg);
    }
  });

  console.log('\n--- Iopic Protocol: Missing Dependency Audit ---');

  const hasIssues = 
    !symmetryValid || missingProd.length > 0 || 
    missingDev.length > 0 || 
    mismatched.length > 0 || 
    unusedProd.length > 0 || 
    unusedDev.length > 0;

  if (!hasIssues) {
    console.log('✅ No missing dependencies detected. Substrate integrity confirmed.');
    process.exit(0);
  }

  if (process.env.CI) {
    if (!symmetryValid) console.error('❌ Protocol Symmetry Check failed.');
    if (missingProd.length > 0) console.error(`❌ Found ${missingProd.length} missing production dependencies.`);
    if (mismatched.length > 0) {
      console.error(`⚠️  Detected ${mismatched.length} version mismatches between logic and substrate.`);
      mismatched.forEach(m => {
        console.log(`   - ${m.name}: [${m.type}] Requested ${m.reqVer}, currently satisfies ${m.existingVer}`);
      });
    }
    if (unusedProd.length > 0) {
      console.error(`🧹 Found ${unusedProd.length} unused production dependencies.`);
      unusedProd.forEach(pkg => console.log(`   - Unused: ${pkg}`));
    }
    console.error('CI environment detected. Production dependency issues found. Protocol symmetry check failed.\n');
    process.exit(1);
  }

  if (missingProd.length > 0) {
    console.error(`❌ Found ${missingProd.length} missing production dependencies.`);
    runInstall(missingProd, false);
  }

  if (missingDev.length > 0) {
    console.error(`❌ Found ${missingDev.length} missing development dependencies.`);
    runInstall(missingDev, true);
  }

  if (mismatched.length > 0) {
    console.error(`⚠️  Detected ${mismatched.length} version mismatches between logic and substrate.`);
    mismatched.forEach(m => {
      console.log(`   - ${m.name}: [${m.type}] Requested ${m.reqVer}, currently satisfies ${m.existingVer}`);
    });
    const toInstall = mismatched.map(m => `${m.name}@${m.reqVer}`);
    runInstall(toInstall, false); // Updates to specific version
  }

  if (unusedProd.length > 0 || unusedDev.length > 0) {
    const allUnused = [...unusedProd, ...unusedDev];
    console.error(`🧹 Found ${allUnused.length} unused dependencies.`);
    allUnused.forEach(pkg => console.log(`   - Unused: ${pkg}`));

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Do you want to purge these unused entities from the protocol? (y/N): ', (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'y') {
        runUninstall(allUnused);
      } else {
        console.log('Skipping purge. Symmetry maintained manually.\n');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

/**
 * Executes the npm installation for the identified missing substrate.
 */
function runInstall(packages, isDev) {
  const flag = isDev ? '--save-dev' : '--save';
  console.log(`🛠️  Installing ${packages.length} packages as ${isDev ? 'devDependencies' : 'dependencies'}...`);
  
  try {
    const installCmd = `npm install ${flag} ${packages.join(' ')}`;
    execSync(installCmd, { stdio: 'inherit' });
    console.log(`✅ ${isDev ? 'Development' : 'Production'} substrate synchronized.\n`);
  } catch (error) {
    console.error(`\n❌ Synchronization failed for: ${packages.join(', ')}`);
    process.exit(1);
  }
}

/**
 * Executes the npm uninstallation for the identified unused substrate.
 */
function runUninstall(packages) {
  if (packages.length === 0) return;
  
  console.log(`🛠️  Purging ${packages.length} unused entities from the protocol...`);
  
  try {
    const uninstallCmd = `npm uninstall ${packages.join(' ')}`;
    execSync(uninstallCmd, { stdio: 'inherit' });
    console.log(`✅ Substrate purged. Symmetry restored.\n`);
  } catch (error) {
    console.error(`\n❌ Purge failed for: ${packages.join(', ')}`);
    process.exit(1);
  }
}