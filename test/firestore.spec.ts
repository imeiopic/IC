import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  setDoc,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let testEnv: RulesTestEnvironment;

describe('Iopic World: Access Protocol Tests', () => {
  beforeAll(async () => {
    // Initialize the environment using the rules file we created
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-iopic-world',
      firestore: {
        rules: readFileSync(path.resolve(__dirname, 'firestore.rules'), 'utf8'),
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

  it('should deny unauthorized access (unauthenticated)', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const inviteeRef = doc(unauthedDb, 'invitees/entity_001');

    // Assert that an unauthenticated member cannot read data
    await assertFails(getDoc(inviteeRef));
  });

  it('should allow authorized members to create records', async () => {
    const authedDb = testEnv.authenticatedContext('ime_iopic_uid').firestore();
    const inviteeRef = doc(authedDb, 'invitees/entity_002');

    // Assert that an authenticated member can add a document
    await assertSucceeds(
      setDoc(inviteeRef, {
        name: 'Vector Genesis',
        level: 'Member',
        status: 'Pending',
        inviteePays: false,
        targetUid: 'target_001',
        inviterUid: 'ime_iopic_uid',
      })
    );
  });

  it('should deny deletion if the member is not authenticated', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(deleteDoc(doc(unauthedDb, 'invitees/entity_001')));
  });

  describe('Invitee Validation Rules', () => {
    const authId = 'ime_iopic_uid';

    it('should fail if required fields are missing', async () => {
      const db = testEnv.authenticatedContext(authId).firestore();
      const ref = doc(db, 'invitees/fail_missing_fields');

      // Missing inviteePays
      await assertFails(
        setDoc(ref, {
          name: 'Missing Fields',
          level: 'Member',
          status: 'Pending',
          targetUid: 'any',
        })
      );
    });

    it('should fail if level or status is not in the whitelist', async () => {
      const db = testEnv.authenticatedContext(authId).firestore();
      const ref = doc(db, 'invitees/fail_enums');

      await assertFails(
        setDoc(ref, {
          name: 'Bad Enum',
          level: 'Administrator', // Invalid level
          status: 'Pending',
          inviteePays: false,
        })
      );
    });

    it('should fail if name is empty', async () => {
      const db = testEnv.authenticatedContext(authId).firestore();
      const ref = doc(db, 'invitees/fail_empty_name');

      await assertFails(
        setDoc(ref, {
          name: '',
          level: 'Member',
          status: 'Pending',
          inviteePays: false,
        })
      );
    });

    it('should fail if inviteePays is true but status is not Pending', async () => {
      const db = testEnv.authenticatedContext(authId).firestore();
      const ref = doc(db, 'invitees/fail_flipped_logic');

      // If inviteePays is true, initial status MUST be Pending
      await assertFails(
        setDoc(ref, {
          name: 'Flipped Error',
          level: 'Member',
          status: 'Active',
          inviteePays: true,
        })
      );
    });

    it('should deny updates that attempt to change inviteePays', async () => {
      const db = testEnv.authenticatedContext(authId).firestore();
      const ref = doc(db, 'invitees/immutable_test');

      // Initial creation
      await setDoc(ref, {
        name: 'Immutable test',
        level: 'Member',
        status: 'Pending',
        inviteePays: false,
      });

      // Attempting to flip the relationship on update should fail
      await assertFails(
        updateDoc(ref, {
          inviteePays: true,
        })
      );

      // Changing status should still succeed
      await assertSucceeds(
        updateDoc(ref, {
          status: 'Active',
        })
      );
    });

    it('should allow invitee to Accept, Deny, or ONU', async () => {
      const targetUid = 'invited_member';
      const inviterUid = 'vector_member';
      const inviteeDb = testEnv.authenticatedContext(targetUid).firestore();
      const docRef = doc(inviteeDb, 'invitees/handshake_test');

      // Setup: Vector creates a flipped proposal
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'invitees/handshake_test'), {
          name: 'Handshake Test',
          level: 'Member',
          status: 'Pending',
          inviteePays: true,
          targetUid: targetUid,
          inviterUid: inviterUid,
        });
      });

      // Action: Invitee chooses 'ONU' (Accepts connection but maintains standard 01 relationship)
      await assertSucceeds(
        updateDoc(docRef, {
          status: 'Active',
          inviteePays: false,
        })
      );
    });

    it('should allow Vectors to set inviteePays to true', async () => {
      const vectorUid = 'vector_member_id';
      const db = testEnv.authenticatedContext(vectorUid).firestore();

      // Setup: Establish the requester as a Vector in the protocol
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `invitees/${vectorUid}`), {
          name: 'Authorized Vector',
          level: 'Vector',
          status: 'Active',
          inviteePays: false,
        });
      });

      // Action: Create a flipped invite
      await assertSucceeds(
        setDoc(doc(db, 'invitees/flipped_success'), {
          name: 'Guest Member',
          level: 'Guest',
          status: 'Pending',
          inviteePays: true,
        })
      );
    });

    it('should deny non-Vectors from setting inviteePays to true', async () => {
      const db = testEnv.authenticatedContext('regular_member').firestore();
      await assertFails(
        setDoc(doc(db, 'invitees/flipped_fail'), {
          name: 'Guest Member',
          level: 'Guest',
          status: 'Pending',
          inviteePays: true,
        })
      );
    });
  });

  describe('Instances Collection', () => {
    it('should allow authenticated members to sync instance data', async () => {
      const authedDb = testEnv.authenticatedContext('ime_iopic_uid').firestore();
      const instanceRef = doc(authedDb, 'instances/person_001');

      await assertSucceeds(
        setDoc(instanceRef, {
          name: 'Person 01',
          status: 'ACTIVE_IN_VRE',
          vre_id: 'vre-0001',
          creatorId: 'ime_iopic_uid',
          participants: ['ime_iopic_uid'],
        })
      );
    });

    it('should deny creation if creatorId does not match member UID', async () => {
      const authedDb = testEnv.authenticatedContext('ime_iopic_uid').firestore();
      const instanceRef = doc(authedDb, 'instances/person_002');

      await assertFails(
        setDoc(instanceRef, {
          name: 'Imposter',
          creatorId: 'someone_else',
          participants: ['someone_else'],
        })
      );
    });

    it('should deny unauthenticated members from reading instance data', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const instanceRef = doc(unauthedDb, 'instances/person_001');

      await assertFails(getDoc(instanceRef));
    });

    it('should allow a participant to read the instance data', async () => {
      const ownerId = 'owner_uid';
      const guestId = 'guest_uid';
      const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
      const guestDb = testEnv.authenticatedContext(guestId).firestore();
      const instanceRef = doc(ownerDb, 'instances/read_test_allowed');

      // Setup: Owner creates the instance with the guest in the participants list
      await setDoc(instanceRef, {
        creatorId: ownerId,
        status: 'ACTIVE_IN_VRE',
        participants: [ownerId, guestId],
      });

      // Action: Guest attempts to read
      const guestInstanceRef = doc(guestDb, 'instances/read_test_allowed');
      await assertSucceeds(getDoc(guestInstanceRef));
    });

    it('should deny a non-participant from reading the instance data', async () => {
      const ownerId = 'owner_uid';
      const strangerId = 'stranger_uid';

      // Setup: Create the instance bypassing rules to ensure it exists
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'instances/read_test_denied'), {
          creatorId: ownerId,
          status: 'ACTIVE_IN_VRE',
          participants: [ownerId], // Stranger is NOT in the list
        });
      });

      // Action: Stranger attempts to read
      const strangerDb = testEnv.authenticatedContext(strangerId).firestore();
      const strangerInstanceRef = doc(strangerDb, 'instances/read_test_denied');
      await assertFails(getDoc(strangerInstanceRef));
    });

    it('should deny modification if the member is not the creator', async () => {
      const creatorDb = testEnv.authenticatedContext('creator_uid').firestore();
      const otherDb = testEnv.authenticatedContext('other_uid').firestore();
      const instanceRef = doc(creatorDb, 'instances/shared_instance');

      // Creator creates the document
      await setDoc(instanceRef, { creatorId: 'creator_uid', status: 'INIT' });

      // Another authenticated member tries to update it
      const otherInstanceRef = doc(otherDb, 'instances/shared_instance');
      await assertFails(updateDoc(otherInstanceRef, { status: 'MODIFIED' }));
    });

    it('should deny updating the creatorId field', async () => {
      const creatorDb = testEnv.authenticatedContext('creator_uid').firestore();
      const instanceRef = doc(creatorDb, 'instances/immutable_creator');

      // Create document
      await setDoc(instanceRef, { creatorId: 'creator_uid', status: 'INIT' });

      // Attempt to change creatorId
      await assertFails(updateDoc(instanceRef, { creatorId: 'new_creator_uid' }));
    });

    it('should deny creation if owner is not in participants list', async () => {
      const authedDb = testEnv.authenticatedContext('owner_uid').firestore();
      const instanceRef = doc(authedDb, 'instances/no_owner_in_list');

      await assertFails(
        setDoc(instanceRef, {
          creatorId: 'owner_uid',
          status: 'PENDING',
          participants: ['someone_else'],
        })
      );
    });

    it('should deny owner from removing themselves from participants', async () => {
      const ownerDb = testEnv.authenticatedContext('owner_uid').firestore();
      const instanceRef = doc(ownerDb, 'instances/owner_removal');

      await setDoc(instanceRef, {
        creatorId: 'owner_uid',
        status: 'ACTIVE_IN_VRE',
        participants: ['owner_uid'],
      });

      await assertFails(
        updateDoc(instanceRef, {
          participants: [],
        })
      );
    });

    describe('Status Field Validation', () => {
      it('should deny creation if status is not a string', async () => {
        const authedDb = testEnv.authenticatedContext('creator_uid').firestore();
        const instanceRef = doc(authedDb, 'instances/invalid_type');

        await assertFails(
          setDoc(instanceRef, {
            creatorId: 'creator_uid',
            status: 123, // Should be a string
          })
        );
      });

      it('should deny creation if status value is not allowed', async () => {
        const authedDb = testEnv.authenticatedContext('creator_uid').firestore();
        const instanceRef = doc(authedDb, 'instances/invalid_value');

        await assertFails(
          setDoc(instanceRef, {
            creatorId: 'creator_uid',
            status: 'DELETED_BY_ADMIN', // Not in the whitelist
          })
        );
      });

      it('should allow a guest to leave using arrayRemove', async () => {
        const ownerId = 'owner_uid';
        const guestId = 'guest_uid';
        const secretCode = 'secret_123';

        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await setDoc(doc(adminDb, 'instances/private_room'), {
            creatorId: ownerId,
            status: 'ACTIVE_IN_VRE',
            participants: [ownerId],
          });
          await setDoc(doc(adminDb, 'instances/private_room/secrets/private'), {
            accessCode: secretCode,
          });
        });

        const guestDb = testEnv.authenticatedContext(guestId).firestore();
        const roomRef = doc(guestDb, 'instances/private_room');

        await updateDoc(roomRef, {
          providedAccessCode: secretCode,
          participants: [ownerId, guestId],
        });

        await assertSucceeds(
          updateDoc(roomRef, {
            participants: [ownerId],
          })
        );
      });

      it('should deny a stranger from joining with an incorrect access code', async () => {
        const ownerId = 'owner_uid';
        const strangerId = 'stranger_uid';

        // Setup
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const adminDb = context.firestore();
          await setDoc(doc(adminDb, 'instances/wrong_code_room'), {
            creatorId: ownerId,
            status: 'ACTIVE_IN_VRE',
            participants: [ownerId],
          });
          await setDoc(doc(adminDb, 'instances/wrong_code_room/secrets/private'), {
            accessCode: 'real_secret',
          });
        });

        const strangerDb = testEnv.authenticatedContext(strangerId).firestore();
        const roomRef = doc(strangerDb, 'instances/wrong_code_room');

        // Action: Attempt to join with wrong code
        await assertFails(
          updateDoc(roomRef, {
            providedAccessCode: 'wrong_secret',
            participants: arrayUnion(strangerId),
          })
        );
      });
    });
  });

  describe('User Profile Constraints', () => {
    const userId = 'member_abc';

    beforeEach(async () => {
      // Setup the user document with security rules disabled
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `invitees/${userId}`), {
          name: 'Original Name',
          level: 'Member',
          status: 'Active',
          inviterUid: 'system',
        });
      });
    });

    it('should allow a user to update their own name', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      const profileRef = doc(db, `invitees/${userId}`);

      await assertSucceeds(updateDoc(profileRef, { name: 'New Identity' }));
    });

    it('should deny a user from updating their own level', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      const profileRef = doc(db, `invitees/${userId}`);

      // This should fail because 'level' is not in the allowed 'affectedKeys'
      await assertFails(updateDoc(profileRef, { level: 'Vector' }));
    });

    it("should deny a user from updating someone else's name", async () => {
      const db = testEnv.authenticatedContext('different_user').firestore();
      const profileRef = doc(db, `invitees/${userId}`);

      await assertFails(updateDoc(profileRef, { name: 'Hacker' }));
    });
  });

  describe('Time-based Constraints', () => {
    const userId = 'time_test_user';

    it('should allow creation when lastModified is exactly request.time', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      const profileRef = doc(db, `identities/${userId}`);

      // We satisfy the isTimestampNow() rule by using the serverTimestamp() sentinel
      await assertSucceeds(
        setDoc(profileRef, {
          status: 'Pending',
          isPremium: false,
          version: 1,
          lastModified: serverTimestamp(),
        })
      );
    });

    it('should deny creation when lastModified is an explicit client time', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      const profileRef = doc(db, `identities/fail_${userId}`);

      // Sending a standard Date object or timestamp will fail because
      // network latency guarantees it will not exactly equal request.time
      await assertFails(
        setDoc(profileRef, {
          status: 'Pending',
          isPremium: false,
          version: 1,
          lastModified: new Date(),
        })
      );
    });
  });

  describe('Rate Limiting (24-hour constraint example)', () => {
    const userId = 'rate_limit_user';

    it('should deny write if last action was less than 24 hours ago', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      const docRef = doc(db, `daily_actions/${userId}`);

      // Seed the database with an action that happened 12 hours ago
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `daily_actions/${userId}`), {
          lastAction: twelveHoursAgo,
        });
      });

      // Attempt to write again, which should be blocked by the 24-hour rule
      await assertFails(
        updateDoc(docRef, {
          lastAction: serverTimestamp(),
        })
      );
    });

    it('should allow write if last action was more than 24 hours ago', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      const docRef = doc(db, `daily_actions/${userId}`);

      // Seed the database with an action that happened 25 hours ago
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `daily_actions/${userId}`), {
          lastAction: twentyFiveHoursAgo,
        });
      });

      // Attempt to write again, which should successfully pass the 24-hour rule
      await assertSucceeds(
        updateDoc(docRef, {
          lastAction: serverTimestamp(),
        })
      );
    });
  });

  describe('Rate Limiting (1-hour cooldown for secure_data_access)', () => {
    const userId = 'secure_test_user';

    it('should deny write if last access was less than 1 hour ago', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      const docRef = doc(db, `secure_data_access/${userId}`);

      // Seed with an action that happened 30 minutes ago
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `secure_data_access/${userId}`), {
          lastAction: thirtyMinutesAgo,
        });
      });

      // Attempt to write again within the 1-hour window
      await assertFails(
        updateDoc(docRef, {
          lastAction: serverTimestamp(),
        })
      );
    });

    it('should allow write if last access was more than 1 hour ago', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      const docRef = doc(db, `secure_data_access/${userId}`);

      // Seed with an action that happened 65 minutes ago
      const sixtyFiveMinutesAgo = new Date(Date.now() - 65 * 60 * 1000);

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `secure_data_access/${userId}`), {
          lastAction: sixtyFiveMinutesAgo,
        });
      });

      // Attempt to write again after the cooldown
      await assertSucceeds(
        updateDoc(docRef, {
          lastAction: serverTimestamp(),
        })
      );
    });
  });

  describe('Metadata Population Stats', () => {
    const statsPath = 'metadata/global_stats';

    it('should deny standard users from writing to global_stats', async () => {
      const db = testEnv.authenticatedContext('standard_user').firestore();
      await assertFails(
        setDoc(doc(db, statsPath), {
          nodeCount: 100,
          lastUpdated: serverTimestamp(),
        })
      );
    });

    it('should allow standard users to read global_stats', async () => {
      const db = testEnv.authenticatedContext('standard_user').firestore();
      await assertSucceeds(getDoc(doc(db, statsPath)));
    });

    it('should allow system users to write valid data to global_stats', async () => {
      const db = testEnv.authenticatedContext('system_user', { system: true }).firestore();
      await assertSucceeds(
        setDoc(doc(db, statsPath), {
          nodeCount: 500,
          lastUpdated: serverTimestamp(),
        })
      );
    });

    it('should allow admin users to write valid data to global_stats', async () => {
      const db = testEnv.authenticatedContext('admin_user', { admin: true }).firestore();
      await assertSucceeds(
        setDoc(doc(db, statsPath), {
          nodeCount: 750,
          lastUpdated: serverTimestamp(),
        })
      );
    });

    it('should deny system users from writing invalid data (wrong types) to global_stats', async () => {
      const db = testEnv.authenticatedContext('system_user', { system: true }).firestore();
      await assertFails(
        setDoc(doc(db, statsPath), {
          nodeCount: 'five-hundred', // Invalid type: must be int
          lastUpdated: serverTimestamp(),
        })
      );
    });
  });
});
