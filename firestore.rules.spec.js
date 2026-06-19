const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');

describe('Iopic Security Substrate: Firestore Rules', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'calcium-channel-489906-m2',
      firestore: {
        rules: fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8'),
        host: '127.0.0.1',
        port: 8080
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('USL Intent Learning Substrate', () => {
    const docPath = 'system_stats/intent_learning';

    it('should deny access to unauthenticated nodes (Omega Noise)', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(unauthDb.doc(docPath).get());
    });

    it('should allow authenticated nodes to read and update intents', async () => {
      const memberDb = testEnv.authenticatedContext('user_123').firestore();

      // Setup initial state as admin first
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(docPath).set({ EQUITY: 1 });
      });

      await assertSucceeds(memberDb.doc(docPath).get());
      await assertSucceeds(memberDb.doc(docPath).update({ EQUITY: 5 }));
    });

    it('should deny non-admin nodes from purging the substrate', async () => {
      const memberDb = testEnv.authenticatedContext('user_123').firestore();
      await assertFails(memberDb.doc(docPath).delete());
      await assertFails(memberDb.doc(docPath).set({}));
    });

    it('should allow Root Stewards (admins) to purge the substrate', async () => {
      const adminDb = testEnv.authenticatedContext('admin_node', { admin: true }).firestore();

      // Admin can create/initialize
      await assertSucceeds(adminDb.doc(docPath).set({ INITIALIZED: true }));

      // Admin can delete/purge
      await assertSucceeds(adminDb.doc(docPath).delete());
    });
  });

  describe('Access Requests Substrate', () => {
    const reqId = 'test_req_123';
    const docPath = `access_requests/${reqId}`;

    it('should deny deletion by owner if status is Pending', async () => {
      const memberDb = testEnv.authenticatedContext('user_123').firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(docPath).set({ uid: 'user_123', status: 'Pending' });
      });
      await assertFails(memberDb.doc(docPath).delete());
    });

    it('should deny deletion by owner if status is Approved', async () => {
      const memberDb = testEnv.authenticatedContext('user_123').firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(docPath).set({ uid: 'user_123', status: 'Approved' });
      });
      await assertFails(memberDb.doc(docPath).delete());
    });

    it('should allow deletion by owner if status is Denied', async () => {
      const memberDb = testEnv.authenticatedContext('user_123').firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(docPath).set({ uid: 'user_123', status: 'Denied' });
      });
      await assertSucceeds(memberDb.doc(docPath).delete());
    });

    it('should deny deletion by non-owners even if status is Denied', async () => {
      const bobDb = testEnv.authenticatedContext('bob_456').firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(docPath).set({ uid: 'user_123', status: 'Denied' });
      });
      await assertFails(bobDb.doc(docPath).delete());
    });

    it('should allow Root Stewards (admins) to delete any request regardless of status', async () => {
      const adminDb = testEnv.authenticatedContext('admin_node', { admin: true }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(docPath).set({ uid: 'user_123', status: 'Pending' });
      });
      await assertSucceeds(adminDb.doc(docPath).delete());
    });

    it('should deny status update by request owner (standard node)', async () => {
      const memberDb = testEnv.authenticatedContext('user_123').firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(docPath).set({ uid: 'user_123', status: 'Pending' });
      });
      await assertFails(memberDb.doc(docPath).update({ status: 'Approved' }));
    });

    it('should allow status update by Root Steward (admin claim)', async () => {
      const adminDb = testEnv.authenticatedContext('admin_node', { admin: true }).firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(docPath).set({ uid: 'user_123', status: 'Pending' });
      });
      await assertSucceeds(
        adminDb.doc(docPath).update({
          status: 'Approved',
          processedAt: testEnv.firestore.FieldValue.serverTimestamp()
        })
      );
    });
  });

  describe('Email Logs Substrate', () => {
    const logId = 'test_log_123';
    const docPath = `email_logs/${logId}`;
    const logData = {
      status: 'Success',
      byteSize: 1024,
      timestamp: new Date(),
      recipient: 'test@example.com'
    };

    it('should deny write by unauthenticated nodes (Omega Noise)', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(unauthDb.doc(docPath).set(logData));
    });

    it('should deny write by authenticated non-system nodes', async () => {
      const memberDb = testEnv.authenticatedContext('user_123').firestore();
      const adminDb = testEnv.authenticatedContext('admin_node', { admin: true }).firestore();

      await assertFails(memberDb.doc(docPath).set(logData));
      await assertFails(adminDb.doc(docPath).set(logData)); // Admins can read/delete, but not write
    });

    it('should allow write by the system account', async () => {
      const systemDb = testEnv.authenticatedContext('system', { system: true }).firestore();
      await assertSucceeds(systemDb.doc(docPath).set(logData));
    });

    it('should allow system account to update existing logs', async () => {
      const systemDb = testEnv.authenticatedContext('system', { system: true }).firestore();
      await assertSucceeds(systemDb.doc(docPath).update({ status: 'Failure' }));
    });
  });

  describe('Daily Statistics Substrate', () => {
    const dateId = '2024-01-01';
    const docPath = `daily_stats/${dateId}`;
    const statsData = { count: 1, totalByteSize: 100, lastUpdated: new Date() };

    it('should allow system account to write stats', async () => {
      const systemDb = testEnv.authenticatedContext('system', { system: true }).firestore();
      await assertSucceeds(systemDb.doc(docPath).set(statsData));
    });

    it('should deny read by unauthenticated nodes', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(unauthDb.doc(docPath).get());
    });

    it('should allow read by authenticated non-admin nodes', async () => {
      const memberDb = testEnv.authenticatedContext('user_123').firestore();
      await assertSucceeds(memberDb.doc(docPath).get());
    });

    it('should deny write by administrative nodes (preventing manual override)', async () => {
      const adminDb = testEnv.authenticatedContext('admin_node', { admin: true }).firestore();
      await assertFails(adminDb.doc(docPath).set(statsData));
    });
  });

  describe('Security Audits Substrate', () => {
    const auditId = 'test_audit_123';
    const docPath = `security_audits/${auditId}`;
    const auditData = {
      event: 'UNAUTHORIZED_OVERRIDE_ATTEMPT',
      reason: 'SECURITY_BREACH_TOKEN_NULLIFIED',
      clientIp: '192.168.1.1',
      timestamp: new Date()
    };

    it('should allow write by the system account', async () => {
      const systemDb = testEnv.authenticatedContext('system', { system: true }).firestore();
      await assertSucceeds(systemDb.doc(docPath).set(auditData));
    });

    it('should deny write by standard authenticated nodes', async () => {
      const memberDb = testEnv.authenticatedContext('user_123').firestore();
      await assertFails(memberDb.doc(docPath).set(auditData));
    });

    it('should deny read access even to the system account (Append-only / Admin-only)', async () => {
      const systemDb = testEnv.authenticatedContext('system', { system: true }).firestore();
      const adminDb = testEnv.authenticatedContext('admin_node', { admin: true }).firestore();
      await assertFails(systemDb.doc(docPath).get());
      await assertFails(adminDb.doc(docPath).get());
    });
  });
});
