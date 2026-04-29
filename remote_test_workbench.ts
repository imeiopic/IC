/**
 * Remote Workbench: A test harness for Firestore Remote Synchronization logic.
 * This script demonstrates how to synthesize RemoteEvents and apply them to 
 * the persistence layer interfaces provided in the context.
 */

import { SnapshotVersion } from './node_modules/@firebase/firestore/dist/firestore/src/core/snapshot_version';
import { RemoteEvent, TargetChange } from './node_modules/@firebase/firestore/dist/firestore/src/remote/remote_event';
import { TargetId } from './node_modules/@firebase/firestore/dist/firestore/src/core/types';
import { ByteString } from './node_modules/@firebase/firestore/dist/firestore/src/util/byte_string';
import { DocumentKeySet, MutableDocumentMap } from './node_modules/@firebase/firestore/dist/firestore/src/model/collections';
import { SortedMap } from './node_modules/@firebase/firestore/dist/firestore/src/util/sorted_map';
import { MutableDocument } from './node_modules/@firebase/firestore/dist/firestore/src/model/document';
import { DocumentKey } from './node_modules/@firebase/firestore/dist/firestore/src/model/document_key';
import { ObjectValue } from './node_modules/@firebase/firestore/dist/firestore/src/model/object_value';

// Import Iopic Domain Models
import { person01 } from './src/personModel';
import { exampleCoinX01 } from './src/coinxModel';

async function runWorkbench() {
    console.log("--- Initializing Iopic World Remote Workbench ---");

    // 1. Simulate a Snapshot Version (Logical Time)
    const mockVersion = SnapshotVersion.fromTimestamp({ seconds: 1711545600, nanoseconds: 0 }); 
    const targetId = 1 as TargetId;
    const guestUid = "guest_iopic_002";

    // 2. Synthesize a Document Change for Person 01
    // This simulates the backend pushing an update after a successful guest connection handshake
    const personKey = DocumentKey.fromPath(`0001_instances/${person01.id}`);
    const personDoc = MutableDocument.newFoundDocument(
        personKey,
        mockVersion,
        ObjectValue.fromMap({
            name: person01.name,
            status: "ACTIVE_IN_VRE",
            vre_id: "vre-0001",
            creatorId: "ime_iopic_uid",
            accessCode: "secret_123",
            // The server state now includes the guest UID in the participants list
            participants: ["ime_iopic_uid", guestUid]
        })
    );

    const documentUpdates = MutableDocumentMap.emptyMap();
    documentUpdates.insert(personKey, personDoc);

    // 3. Construct a TargetChange
    // Simulates the backend marking the query as 'CURRENT' (synced)
    const targetChange = new TargetChange(
        ByteString.fromBase64String('resume-token-alpha'),
        true, 
        DocumentKeySet.emptyElementMap().add(personKey), 
        DocumentKeySet.emptyElementMap(), // modified
        DocumentKeySet.emptyElementMap()  // removed
    );

    const targetChanges = new Map<TargetId, TargetChange>();
    targetChanges.set(targetId, targetChange);

    // 4. Create the RemoteEvent
    const remoteEvent = new RemoteEvent(
        mockVersion,
        targetChanges,
        new SortedMap<TargetId, any>((a, b) => a - b),
        documentUpdates,
        DocumentKeySet.emptyElementMap()
    );

    console.log("SUCCESS: Synthesized Remote Event for Iopic World Logic.");
    console.log(`- Snapshot Version: ${remoteEvent.snapshotVersion.toString()}`);
    console.log(`- Documents Updated: ${remoteEvent.documentUpdates.size}`);

    remoteEvent.documentUpdates.forEach((key, doc) => {
        console.log(`  -> Syncing Document: ${key.path.toString()}`);
    });

    console.log("--- Workbench Test Complete ---");
}

runWorkbench().catch(err => {
    console.error("CRITICAL: Workbench Execution Failed!");
    console.error(err);
});