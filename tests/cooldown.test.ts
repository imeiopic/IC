import { expect, it, describe, beforeAll, beforeEach, afterAll } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';

describe('Cooldown Security Rules', () => {
  let testEnv: RulesTestEnvironment;
  const userId = 'user_123';
  const targetPath = `daily_actions/${userId}`;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-cooldown-test',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('should FAIL if the cooldown has not passed (e.g., only 5 hours ago)', async () => {
    // 1. Seed the database with a recent action (5 hours ago)
    const fiveHoursAgo = new Date();
    fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, targetPath), {
        lastAction: Timestamp.fromDate(fiveHoursAgo),
      });
    });

    // 2. Attempt to write again "now"
    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertFails(
      setDoc(doc(userDb, targetPath), {
        lastAction: serverTimestamp(),
      })
    );
  });

  it('should SUCCEED if the cooldown has passed (e.g., 25 hours ago)', async () => {
    // 1. Seed the database with an old action (25 hours ago)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 25);

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, targetPath), {
        lastAction: Timestamp.fromDate(yesterday),
      });
    });

    // 2. Attempt to write again "now"
    const userDb = testEnv.authenticatedContext(userId).firestore();
    await assertSucceeds(
      setDoc(doc(userDb, targetPath), {
        lastAction: serverTimestamp(),
      })
    );
  });
});
