const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const fs = require('fs');

async function runTests() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'calcium-channel-489906-m2',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });

  // Clear database before starting
  await testEnv.clearFirestore();

  const aliceId = 'alice-123';
  const bobId = 'bob-456';
  const charlieId = 'charlie-789';

  // 1. Setup Alice's context (authenticated)
  const aliceContext = testEnv.authenticatedContext(aliceId);
  const aliceDb = aliceContext.firestore();
  const bobDb = testEnv.authenticatedContext(bobId).firestore();
  const charlieDb = testEnv.authenticatedContext(charlieId).firestore();
  const systemDb = testEnv.authenticatedContext('system-admin', { system: true }).firestore();
  const adminId = 'admin-user-id';
  const adminDb = testEnv.authenticatedContext(adminId, { admin: true }).firestore();

  const editorId = 'editor-user-id';
  const editorDb = testEnv.authenticatedContext(editorId, { editor: true }).firestore();

  console.log('🧪 Testing: User should be able to create their own identity...');
  await assertSucceeds(
    aliceDb.collection('identities').doc(aliceId).set({
      fullName: "Alice Doe",
      status: "Pending",
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: 1
    })
  );
  console.log('✅ Success: Alice created her own identity.');

  console.log('🧪 Testing: Alice should NOT be able to create Bob\'s identity...');
  await assertFails(
    aliceDb.collection('identities').doc(bobId).set({
      fullName: "Bob Smith"
    })
  );
  console.log('✅ Success: Alice was blocked from creating Bob\'s identity.');

  console.log('🧪 Testing: Authenticated users can read other identities...');
  await assertSucceeds(
    aliceDb.collection('identities').doc(bobId).get()
  );
  console.log('✅ Success: Alice can read Bob\'s document (if it existed).');

  console.log('🧪 Testing: System user should be able to create any identity...');
  await assertSucceeds(
    systemDb.collection('identities').doc(charlieId).set({
      fullName: "Charlie Brown",
      status: "Active",
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: 100 // Verifying system bypass
    })
  );
  console.log('✅ Success: System created Charlie\'s identity.');

  console.log('🧪 Testing: Admin user should be able to create any identity with custom version...');
  const adminCreatedUserId = 'admin-created-user';
  await assertSucceeds(
    adminDb.collection('identities').doc(adminCreatedUserId).set({
      fullName: "Admin Created User",
      status: "Active",
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: 999 // Should bypass isInitialVersion()
    })
  );
  console.log('✅ Success: Admin created identity with custom version.');

  console.log('🧪 Testing: Admin user should be able to update identity with non-incremented version...');
  // First, create a document for the admin to update (using admin context)
  const adminUpdateTargetId = 'admin-update-target';
  await assertSucceeds(
    adminDb.collection('identities').doc(adminUpdateTargetId).set({
      fullName: "Admin Update Target",
      status: "Pending",
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: 5 // Initial version
    })
  );
  await assertSucceeds(
    adminDb.collection('identities').doc(adminUpdateTargetId).update({
      fullName: "Updated by Admin",
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: 5 // Should bypass isVersionIncremented()
    })
  );
  console.log('✅ Success: Admin updated identity with non-incremented version.');

  console.log('🧪 Testing: Editor user should be able to create any identity with custom version...');
  const editorCreatedUserId = 'editor-created-user';
  await assertSucceeds(
    editorDb.collection('identities').doc(editorCreatedUserId).set({
      fullName: "Editor Created User",
      status: "Active",
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: 555 // Should bypass isInitialVersion()
    })
  );
  console.log('✅ Success: Editor created identity with custom version.');

  console.log('🧪 Testing: Standard user should NOT be able to delete another identity...');
  await assertFails(aliceDb.collection('identities').doc(charlieId).delete());
  console.log('✅ Success: Standard user blocked from deleting other identity.');

  console.log('🧪 Testing: System user should be able to delete any identity...');
  await assertSucceeds(systemDb.collection('identities').doc(charlieId).delete());
  console.log('✅ Success: System deleted Charlie\'s identity.');

  console.log('🧪 Testing: Standard user should NOT be able to create identity with custom version...');
  const daveId = 'dave-101';
  const daveDb = testEnv.authenticatedContext(daveId).firestore();
  await assertFails(
    daveDb.collection('identities').doc(daveId).set({
      fullName: "Dave Doe",
      status: "Pending",
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: 100
    })
  );
  console.log('✅ Success: Standard user blocked from using custom version.');

  // --- Invitees Collection Tests ---
  const inviteId = 'invite-alice-to-bob';
  const invitePath = `invitees/${inviteId}`;
  const inviteData = {
    inviterUid: aliceId,
    targetUid: bobId,
    status: 'Pending',
    name: 'Bob Handshake Test',
    level: 'Member',
    inviteePays: false,
    inviteePaysHalf: false,
    lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
    version: 1
  };

  console.log('\n🧪 Testing: Alice (Inviter) creates an invite for Bob...');
  await assertSucceeds(aliceDb.doc(invitePath).set(inviteData));
  console.log('✅ Success: Invite created.');

  console.log('🧪 Testing: Bob (Target) can read the invite...');
  await assertSucceeds(bobDb.doc(invitePath).get());
  console.log('✅ Success: Bob can read his invite.');

  console.log('🧪 Testing: System user should be able to create an invite for any user...');
  await assertSucceeds(
    systemDb.collection('invitees').doc('system-gen-1').set({
      inviterUid: 'system',
      targetUid: aliceId,
      status: 'Pending',
      name: 'System Handshake',
      level: 'Member',
      inviteePays: false,
      inviteePaysHalf: false,
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: 50 // Verifying system bypass
    })
  );
  console.log('✅ Success: System created a managed invite.');

  console.log('🧪 Testing: Standard user should NOT be able to create invite with custom version...');
  await assertFails(
    aliceDb.collection('invitees').doc('alice-to-charlie-fail').set({
      ...inviteData,
      targetUid: charlieId,
      version: 50
    })
  );
  console.log('✅ Success: Standard user blocked from using custom version for invites.');

  console.log('🧪 Testing: Charlie (Third Party) CANNOT read the invite...');
  await assertFails(charlieDb.doc(invitePath).get());
  console.log('✅ Success: Charlie was blocked.');

  // --- Handshake Logic ---
  console.log('🧪 Testing: Bob (Target) accepts the invite (Handshake)...');
  await assertSucceeds(
    bobDb.doc(invitePath).update({
      status: 'Active',
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: testEnv.firestore.FieldValue.increment(1)
    })
  );
  console.log('✅ Success: Bob successfully accepted.');

  console.log('🧪 Testing: Bob (Target) toggles inviteePaysHalf...');
  await assertSucceeds(
    bobDb.doc(invitePath).update({
      inviteePaysHalf: true,
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: testEnv.firestore.FieldValue.increment(1)
    })
  );
  console.log('✅ Success: Bob updated the split-pay logic.');

  console.log('🧪 Testing: Type Safety - inviteePays must be boolean...');
  await assertFails(
    bobDb.doc(invitePath).update({
      inviteePays: "yes", // Should fail because it's a string, not a bool
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: testEnv.firestore.FieldValue.increment(1)
    })
  );
  console.log('✅ Success: Blocked non-boolean type for inviteePays.');

  console.log('🧪 Testing: Mutual Exclusivity - inviteePays and inviteePaysHalf cannot both be true...');
  await assertFails(
    bobDb.doc(invitePath).update({
      inviteePays: true,
      inviteePaysHalf: true,
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: testEnv.firestore.FieldValue.increment(1)
    })
  );
  console.log('✅ Success: Blocked simultaneous true values for payment flags.');

  console.log('🧪 Testing: Alice (Inviter) CANNOT change the status...');
  await assertFails(
    aliceDb.doc(invitePath).update({
      status: 'Denied',
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: testEnv.firestore.FieldValue.increment(1)
    })
  );
  console.log('✅ Success: Alice was blocked from updating status.');

  console.log('🧪 Testing: Optimistic Concurrency - Stale update should fail...');
  // Alice and Bob both read Version 1. Alice updates to Version 2.
  // Bob then tries to update Version 1 to Version 2, which should fail.
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(invitePath).update({ version: 1 });
  });

  // Alice succeeds
  await assertSucceeds(aliceDb.doc(invitePath).update({ version: 2, lastModified: testEnv.firestore.FieldValue.serverTimestamp() }));
  
  // Bob fails because the server doc is now version 2, and his update (version 2) is not (2 + 1)
  await assertFails(
    bobDb.doc(invitePath).update({
      version: 2,
      lastModified: testEnv.firestore.FieldValue.serverTimestamp()
    })
  );
  console.log('✅ Success: Stale update rejected by version check.');

  console.log('🧪 Testing: Update should fail if version is NOT incremented...');
  await assertFails(
    bobDb.doc(invitePath).update({
      inviteePays: true,
      lastModified: testEnv.firestore.FieldValue.serverTimestamp()
      // Missing version increment
    })
  );
  console.log('✅ Success: Update blocked without version increment.');

  console.log('🧪 Testing: Update should fail if version increment is invalid...');
  await assertFails(
    bobDb.doc(invitePath).update({
      version: 10, // Non-incremental update (should be 2 or 3 based on test flow)
      lastModified: testEnv.firestore.FieldValue.serverTimestamp()
    })
  );
  console.log('✅ Success: Update blocked with invalid version increment.');

  // --- Profile Update Logic in Invitees ---
  // The rules allow a user to update 'name' if docId == uid
  console.log('🧪 Testing: Bob updates his name on his own invite record...');
  const bobProfilePath = `invitees/${bobId}`;
  // Setup a dummy record where docId is the UID
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(bobProfilePath).set({ name: 'Bob Old', inviterUid: aliceId, version: 1 });
  });

  await assertSucceeds(
    bobDb.doc(bobProfilePath).update({
      name: 'Bob New',
      lastModified: testEnv.firestore.FieldValue.serverTimestamp(),
      version: testEnv.firestore.FieldValue.increment(1)
    })
  );
  console.log('✅ Success: Bob updated his own name.');

  // --- Delete Logic ---
  console.log('🧪 Testing: Alice (Inviter) deletes the invite...');
  await assertSucceeds(aliceDb.doc(invitePath).delete());
  console.log('✅ Success: Alice deleted the invite.');

  console.log('🧪 Testing: Charlie CANNOT delete the invite...');
  // Re-create it first
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(invitePath).set(inviteData);
  });
  await assertFails(charlieDb.doc(invitePath).delete());
  console.log('✅ Success: Charlie blocked from deleting.');

  console.log('🧪 Testing: System user should be able to delete any invite...');
  // Re-create it first for the system to delete
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(invitePath).set(inviteData);
  });
  await assertSucceeds(systemDb.doc(invitePath).delete());
  console.log('✅ Success: System deleted the invite.');

  console.log('🧪 Testing: Alice can create an access request...');
  const aliceReqRef = await aliceDb.collection('access_requests').add({
    uid: aliceId,
    requestedRole: 'editor',
    status: 'Pending',
    timestamp: testEnv.firestore.FieldValue.serverTimestamp()
  });
  console.log('✅ Success: Access request created.');

  console.log('🧪 Testing: Alice can read her own access request...');
  await assertSucceeds(aliceDb.collection('access_requests').doc(aliceReqRef.id).get());
  console.log('✅ Success: Alice read her own request.');

  console.log('🧪 Testing: Alice should NOT be able to delete her own PENDING access request...');
  await assertFails(aliceDb.collection('access_requests').doc(aliceReqRef.id).delete());
  console.log('✅ Success: Deletion of pending request blocked.');

  console.log('🧪 Testing: Alice can delete her own DENIED access request...');
  // Manually transition the request to Denied using security-rules-disabled context
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection('access_requests').doc(aliceReqRef.id).update({ status: 'Denied' });
  });
  await assertSucceeds(aliceDb.collection('access_requests').doc(aliceReqRef.id).delete());
  console.log('✅ Success: Alice deleted her denied request.');

  console.log('🧪 Testing: Alice should NOT be able to delete her own APPROVED access request...');
  const approvedReqRef = await testEnv.withSecurityRulesDisabled(async (context) => {
    const ref = await context.firestore().collection('access_requests').add({ uid: aliceId, status: 'Approved' });
    return ref;
  });
  await assertFails(aliceDb.collection('access_requests').doc(approvedReqRef.id).delete());
  console.log('✅ Success: Deletion of approved request blocked.');

  console.log('🧪 Testing: Alice should NOT be able to read email logs...');
  await assertFails(aliceDb.collection('email_logs').get());
  console.log('✅ Success: Standard user blocked from reading logs.');

  console.log('🧪 Testing: Admin should be able to read email logs...');
  await assertSucceeds(adminDb.collection('email_logs').get());
  console.log('✅ Success: Admin audit verified.');

  // Cleanup
  await testEnv.cleanup();
  console.log('\n✨ All tests completed.');
}

runTests().catch(err => {
  console.error('❌ Tests failed:', err);
  process.exit(1);
});