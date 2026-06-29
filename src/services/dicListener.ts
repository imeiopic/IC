// src/services/dicListener.ts
import { useMeshStore } from '@/stores/meshStore';
import { useGlobalMandates } from '@/utils/mandates';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export const initDicHandshakeMonitor = () => {
  const meshStore = useMeshStore();
  const { calculateAccessFee } = useGlobalMandates();

  // Querying for inbound nodes stuck in an unauthenticated or handshaking phase
  const q = query(
    collection(db, 'mesh_registry'),
    where('connectionStatus', '==', 'HANDSHAKING')
  );

  console.log('[DIC_MONITOR] Inbound handshake listener established on 16-thread bus.');

  return onSnapshot(q, async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type === 'added') {
        const nodeData = change.doc.data();
        const nodeId = change.doc.id;

        console.log(`[HANDSHAKE_REQUEST] Node ${nodeId.substring(0, 8)} attempting to align.`);
        
        try {
          // Grounding support check
          await groundInboundNode(nodeId, nodeData, calculateAccessFee);
        } catch (error) {
          console.error(`[MANDATE_FRACTURE] Failed to ground node ${nodeId}:`, error);
        }
      }
    }
  });
};

/**
 * Validates, registers, and stabilizes a new node within the mesh configuration.
 */
async function groundInboundNode(nodeId: string, nodeData: any, feeCalculator: Function) {
  const nodeRef = doc(db, 'mesh_registry', nodeId);
  
  // Verify Node cryptographic signature formatting
  if (!nodeData.publicKey || !nodeData.publicKey.startsWith('0x')) {
    await updateDoc(nodeRef, { connectionStatus: 'ERROR', diagnostic: 'INVALID_PUBLIC_KEY' });
    return;
  }

  // Calculate allocation cost based on connection medium
  const fee = feeCalculator(nodeData.accessSource || 'IDEAL_NODE');
  
  console.log(`[STABILIZING] Node ${nodeId.substring(0, 8)} cleared. Deducting network commitment: ${fee} IO$.`);

  // Update backend registry state to transition the peer to live status
  await updateDoc(nodeRef, {
    connectionStatus: 'ACTIVE',
    meshAlignmentTimestamp: Date.now(),
    allocatedThreadId: Math.floor(Math.random() * 16) + 1, // Balance into one of the 16 threads
    networkCommitmentFee: fee
  });

  console.log(`[NODE_GROUNDED] Peer ${nodeId.substring(0, 8)} synchronized successfully.`);
}