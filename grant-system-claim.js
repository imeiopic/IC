const admin = require('firebase-admin');
const { program } = require('commander');

/**
 * Iopic Protocol: Custom Claim Utility
 * Grants custom claims to a user and synchronizes the access_requests substrate.
 */

program
  .name('grant-system-claim')
  .description('Grant custom claims to a user and synchronize access requests')
  .version('1.0.0')
  .requiredOption('-p, --project-id <id>', 'Target Firebase Project ID substrate')
  .option('-e, --use-emulator', 'Connect to local Firestore/Auth Emulator substrate')
  .option('-r, --reason <text>', 'Reason for denial (used when claimValue is false)')
  .argument('<email>', 'User email address')
  .argument('<claimName>', 'Name of the claim to grant (e.g., admin, editor)')
  .argument('[claimValue]', 'Value of the claim (defaults to true)', 'true')
  .action(grantCustomClaim);

async function grantCustomClaim(email, claimName, claimValueRaw, options) {
  if (options.useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    console.log('🛠️  Connecting to local Emulator substrate...');
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: options.projectId
  });

  let claimValue = true;
  if (claimValueRaw !== undefined) {
    if (claimValueRaw === 'true') claimValue = true;
    else if (claimValueRaw === 'false') claimValue = false;
    else if (!isNaN(claimValueRaw)) claimValue = Number(claimValueRaw);
    else claimValue = claimValueRaw;
  }

  try {
    const auth = admin.auth();
    const user = await auth.getUserByEmail(email);
    console.log(`🔍 Found user: ${user.uid} (${email})`);

    const existingClaims = user.customClaims || {};
    const newClaims = {
      ...existingClaims,
      [claimName]: claimValue
    };

    await auth.setCustomUserClaims(user.uid, newClaims);
    
    const db = admin.firestore();

    // Update the identity substrate in Firestore to reflect the new claims.
    // This ensures that the identities collection remains synchronized with Auth metadata.
    console.log(`📑 Synchronizing identity substrate for ${user.uid}...`);
    await db.collection('identities').doc(user.uid).set({
      email: user.email,
      fullName: user.displayName || 'Anonymous Node',
      customClaims: newClaims,
      lastModified: admin.firestore.FieldValue.serverTimestamp(),
      // Maintenance of version symmetry for protocol consistency
      version: admin.firestore.FieldValue.increment(1)
    }, { merge: true });

    if (claimValue === true) {
      const requestsRef = db.collection('access_requests');
      const snapshot = await requestsRef
        .where('uid', '==', user.uid)
        .where('requestedRole', '==', claimName)
        .where('status', '==', 'Pending')
        .get();

      if (!snapshot.empty) {
        console.log(`📑 Synchronizing ${snapshot.size} pending access request(s) to "Approved"...`);
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, { 
            status: 'Approved', 
            processedAt: admin.firestore.FieldValue.serverTimestamp() 
          });
        });
        await batch.commit();
      }
    } else if (claimValue === false) {
      const requestsRef = db.collection('access_requests');
      const snapshot = await requestsRef
        .where('uid', '==', user.uid)
        .where('requestedRole', '==', claimName)
        .where('status', '==', 'Pending')
        .get();

      if (!snapshot.empty) {
        console.log(`📑 Synchronizing ${snapshot.size} pending access request(s) to "Denied"...`);
        const batch = db.batch();
        const reason = options.reason || 'Insufficient protocol symmetry.';
        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, { 
            status: 'Denied',
            denialReason: reason,
            processedAt: admin.firestore.FieldValue.serverTimestamp() 
          });
        });
        await batch.commit();
      }
    }

    console.log(`✅ Success: Claim { "${claimName}": ${JSON.stringify(claimValue)} } updated for ${email}`);
    
    const updatedUser = await auth.getUser(user.uid);
    console.log('Current Custom Claims:', JSON.stringify(updatedUser.customClaims, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to grant claim:', error.message);
    process.exit(1);
  }
}

program.parse();