import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase'; // Assuming 'db' is exported from firebase.ts

// Define the Node interface that NodeService will manage
export interface Node {
  id: string;
  origin_cluster?: string; // Added for setClusterID
  // Add other node properties as needed, e.g., origin_cluster
  activateDividend(amount: number): Promise<void>;
  setStatus(status: string): Promise<void>;
  setClusterID?(clusterId: string): Promise<void>; // Optional, as per GlobalLiberation.ts
}

export const NodeService = {
  /**
   * Creates a mock Node object with methods that simulate real node operations.
   * In a production system, this would likely fetch a Node from a database
   * and return a rich object with methods that interact with backend services.
   */
  createMockNode: (nodeId: string, originClusterId: string): Node => {
    return {
      id: nodeId,
      origin_cluster: originClusterId,
      activateDividend: async (amount: number) => {
        console.log(`MOCK_NODE_SERVICE: Node ${nodeId} activated dividend of ${amount} IO$.`);
        // In a real system, this would update the node's balance in a ledger.
        await setDoc(doc(db, 'nodes', nodeId), { dividend_activated: true, dividend_amount: amount }, { merge: true });
      },
      setStatus: async (status: string) => {
        console.log(`MOCK_NODE_SERVICE: Node ${nodeId} status set to ${status}.`);
        // In a real system, this would update the node's status in a registry.
        await setDoc(doc(db, 'nodes', nodeId), { status: status }, { merge: true });
      },
      setClusterID: async (clusterId: string) => {
        console.log(`MOCK_NODE_SERVICE: Node ${nodeId} re-grounded to cluster ${clusterId}.`);
        // In a real system, this would update the node's cluster affiliation.
        await setDoc(doc(db, 'nodes', nodeId), { cluster_id: clusterId }, { merge: true });
      }
    };
  }
};