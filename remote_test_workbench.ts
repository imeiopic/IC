/**
 * Remote Workbench: A test harness for Firestore Remote Synchronization logic.
 * This script demonstrates how to synthesize RemoteEvents and apply them to
 * the persistence layer interfaces provided in the context.
 */

// @ts-ignore - Importing internal Firestore types for workbench logic
import { SnapshotVersion } from '@firebase/firestore/dist/firestore/src/core/snapshot_version';
// @ts-ignore
import {
  RemoteEvent,
  TargetChange,
} from '@firebase/firestore/dist/firestore/src/remote/remote_event';
// @ts-ignore
import { TargetId } from '@firebase/firestore/dist/firestore/src/core/types';
// @ts-ignore
import { ByteString } from '@firebase/firestore/dist/firestore/src/util/byte_string';
// @ts-ignore
import * as Collections from '@firebase/firestore/dist/firestore/src/model/collections';
// @ts-ignore
import { SortedMap } from '@firebase/firestore/dist/firestore/src/util/sorted_map';
// @ts-ignore
import { MutableDocument } from '@firebase/firestore/dist/firestore/src/model/document';
// @ts-ignore
import { DocumentKey } from '@firebase/firestore/dist/firestore/src/model/document_key';
// @ts-ignore
import { ObjectValue } from '@firebase/firestore/dist/firestore/src/model/object_value';

// Explicitly cast internal types to any to allow value-level access for mocking
const { DocumentKeySet, MutableDocumentMap } = Collections as any;

// Import Iopic Domain Models
import { person01 } from './src/personModel';
import { exampleCoinX01 } from './src/coinxModel';

async function runWorkbench() {
  console.log('--- Initializing Iopic World Remote Workbench ---');

  // 1. Simulate a Snapshot Version (Logical Time)
  const mockVersion = (SnapshotVersion as any).fromTimestamp({ seconds: 1711545600, nanoseconds: 0 });
  const targetId = 1 as TargetId;
  const guestUid = 'guest_iopic_002';

  // 2. Synthesize a Document Change for Person 01
  // This simulates the backend pushing an update after a successful guest connection handshake
  const personKey = DocumentKey.fromPath(`0001_instances/${person01.id}`);
  const personDoc = MutableDocument.newFoundDocument(
    personKey,
    mockVersion,
    (ObjectValue as any).fromMap({
      name: person01.name,
      status: 'ACTIVE_IN_VRE',
      vre_id: 'vre-0001',
      creatorId: 'ime_iopic_uid',
      accessCode: 'secret_123',
      // The server state now includes the guest UID in the participants list
      participants: ['ime_iopic_uid', guestUid],
    }),
    mockVersion // 4. updateTime: snapshot version also acts as update time
  );

  const documentUpdates = (MutableDocumentMap as any).emptyMap();
  documentUpdates.insert(personKey, personDoc);

  // 3. Construct a TargetChange
  // Simulates the backend marking the query as 'CURRENT' (synced)
  const targetChange = new TargetChange(
    ByteString.fromBase64String('resume-token-alpha'),
    true,
    (DocumentKeySet as any).emptyElementMap().add(personKey),
    (DocumentKeySet as any).emptyElementMap(), // modified
    (DocumentKeySet as any).emptyElementMap() // removed
  );

  const targetChanges = new Map<TargetId, TargetChange>();
  targetChanges.set(targetId, targetChange);

  // 4. Create the RemoteEvent
  const remoteEvent = new RemoteEvent(
    mockVersion,
    targetChanges,
    new (SortedMap as any)((a: number, b: number) => a - b),
    documentUpdates,
    (DocumentKeySet as any).emptyElementMap()
  );

  console.log('SUCCESS: Synthesized Remote Event for Iopic World Logic.');
  console.log(`- Snapshot Version: ${remoteEvent.snapshotVersion.toString()}`);
  console.log(`- Documents Updated: ${remoteEvent.documentUpdates.size}`);

  remoteEvent.documentUpdates.forEach((key, doc) => {
    console.log(`  -> Syncing Document: ${key.path.toString()}`);
  });

  console.log('--- Workbench Test Complete ---');
}

runWorkbench().catch((err) => {
  console.error('CRITICAL: Workbench Execution Failed!');
  console.error(err);
});
