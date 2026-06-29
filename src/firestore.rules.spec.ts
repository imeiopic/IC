import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';

describe('Firestore Security Rules: User Role Protection', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'iopic-protocol-test',
      firestore: {
        // Assumes firestore.rules is in the project root
        rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it('should prevent a user from changing their own role', async () => {
    const userId = 'entity_01';
    const userContext = testEnv.authenticatedContext(userId);
    const db = userContext.firestore();
    const userRef = doc(db, 'users', userId);

    // 1. Setup: Create a valid user document with 'buyer' role using admin privileges
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', userId), {
        email: 'user@iopic.world',
        role: 'buyer',
        status: 'INITIALIZED',
        createdAt: serverTimestamp(),
      });
    });

    // 2. Action: User tries to promote themselves to 'admin'
    // 3. Assertion: This should fail because of the rule: request.resource.data.role == resource.data.role
    await assertFails(
      updateDoc(userRef, {
        role: 'admin',
      })
    );
  });

  it('should allow an admin to change a users role', async () => {
    const userId = 'entity_01';
    // Authenticate as a user who has the 'admin' custom claim
    const adminContext = testEnv.authenticatedContext('admin_01', { admin: true });
    const db = adminContext.firestore();
    const userRef = doc(db, 'users', userId);

    // Setup initial document
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users', userId), {
        email: 'user@iopic.world',
        role: 'buyer',
        status: 'INITIALIZED',
        createdAt: serverTimestamp(),
      });
    });

    // Admins bypass the owner-only role check
    await assertSucceeds(
      updateDoc(userRef, {
        role: 'seller',
      })
    );
  });
});
