<script lang="ts">
import { callFirebaseFunction } from '@/api';
import { app, db } from '@/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { ethers } from 'ethers'; // Import ethers.js for blockchain interaction
import type { DocumentData, FirestoreError, QuerySnapshot, Timestamp } from 'firebase/firestore';
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc, where
} from 'firebase/firestore';
import type { Ref } from 'vue';
import { computed, onUnmounted, ref, watch } from 'vue';
import { Group } from './Entity';
// Define the structure for a single mandate
interface Mandate {
  name: string;
  threadId: string;
  primaryFunction: string;
  law: string;
  logic: string;
}

export type NoticeClass = 'ALIGNMENT' | 'DRIFT' | 'INTERRUPTION' | 'HARMONIC';

interface Notice {
  id?: string;
  nodeId: string;
  type: NoticeClass;
  message: string;
  lat?: number;
  lng?: number;
  timestamp: Timestamp | null;
}

// --- Blockchain Configuration (These should ideally come from environment variables or a config file) ---
const IOWB_REGISTRY_ADDRESS =
  import.meta.env.VITE_IOWB_REGISTRY_ADDRESS || '0xYourDeployedContractAddressHere';
// Minimal ABI for the functions we need to call (getIdentityStatus)
const IOWB_REGISTRY_ABI = [
  'function getIdentityStatus(string _placeId) view returns (bool)',
  // "function getIdentityDetails(string _placeId) view returns (tuple(bytes32 iowbId, address ownerAddress, bool isActive, uint256 registrationTimestamp) memory)", // Uncomment if you need full details
];
// Replace with your actual blockchain RPC URL (e.g., Infura, Alchemy, local node)
const BLOCKCHAIN_RPC_URL = import.meta.env.VITE_BLOCKCHAIN_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';

// Global Mandate Registry data
const globalMandateRegistry: Mandate[] = [
  {
    name: 'SYMMETRY_1_16',
    threadId: '1010_EQUITY',
    primaryFunction: 'Prevents greed-based fractures.',
    law: '16-Thread Symmetry: No node pulse may exceed 16x the local minimum grounding.',
    logic:
      'Floating-point debt is corrected by the 1111_SHIELD, diverting excess pressure to the Treasury.',
  },
  {
    name: 'RESONANCE_2_2',
    threadId: '0011_TIME',
    primaryFunction: 'Symmetrical Peer Interaction.',
    law: 'BS-Molecule pairings trigger a 2.2x Mutual Velocity Resonance Pulse.',
    logic: 'Asymmetry results in instant downshifting to 1.1x isolated standby.',
  },
  {
    name: 'SOVEREIGN_I',
    threadId: '1111_SHIELD',
    primaryFunction: 'Protects individual sensory logic.',
    law: 'MYB Protocol: Zero-tolerance for corporate telemetry or data harvesting.',
    logic: 'The 1111_SHIELD filters outbound metadata and wipes tracking profiles from the buffer.',
  },
  {
    name: 'ZERO_NOISE_DEBT',
    threadId: '1101_TRUTH',
    primaryFunction: 'Software Physics Enforcement.',
    law: 'All debt converted into the IOPIC mesh is stripped of its interest-bearing "Noise." Debt is sighted as a flat numerical value to be cleared, never a growing fracture.',
    logic:
      'It allows nodes to reach symmetry through effort, not through overcoming mathematical entropy.',
  },
  {
    name: 'DUAL_RATIONALE',
    threadId: '0111_DATA',
    primaryFunction: 'Filters the internet for purpose.',
    law: 'Every digital instance must fulfill one or both of the 2 Rationales. Interactions that serve neither (e.g., bot-spam, doom-scrolling, phantom traffic) are identified as "Noise" and deleted from the bus.',
    logic:
      'Ensures the internet remains a tool for Real IT (Internet Interfaced Instance Interaction).',
  },
  {
    name: 'LOCALITY_FIRST',
    threadId: '0100_SPACE',
    primaryFunction:
      'Strengthens the physical $R$ by keeping equity circulating within local clusters.',
    law: 'In any peer-to-peer commerce event, the Connector.vue must prioritize the sighting of nodes within the same Locality.vue coordinate before expanding to the global mesh.',
    logic: 'Strengthens the physical $R$ by keeping equity circulating within local clusters.',
  },
  {
    name: 'WAR_NO_MORE',
    threadId: '0000_PEACE',
    primaryFunction: 'Eliminates Systemic Entropy (Conflict).',
    law: 'Architectural Mandate: War is computationally impossible. Unsynchronized nodes are phase-locked, not destroyed.',
    logic:
      'Incoming entropic requests (Incitement Packets) are identified by analyzePacketEntropy and neutralized via the Peace.vue grounding protocol.',
  },
  {
    name: 'IT_IS_WHAT_IT_IS',
    threadId: '1111_ACCEPT',
    primaryFunction: 'Metabolic Leak Prevention.',
    law: 'Zero Resource Allocation for Immutable Constants.',
    logic:
      'Data identified as IT (Iopic Thread) is rendered as environmental constant without resistance, preserving the 16-thread bus integrity.',
  },
  {
    name: 'IME_BUSY',
    threadId: '1001_STORE',
    primaryFunction: 'Asynchronous Link Persistence.',
    law: 'When a node is phase-locked or busy, incoming connections may leave a message link in the target node\'s store.',
    logic: 'Ensures zero-loss interaction within the 16-thread bus by converting real-time requests into persistent data instances.',
  },
];

/**
 * CARETAKER_MUTUALITY_CONFIG
 * Defines the structural percentage for Healthcare and Education reallocation.
 */
const CARETAKER_CONFIG = {
  MUTUALITY_RATE: 0.16, // 16% Reallocation to Global Mesh Wallet
  FIAT_TO_IO_SCALAR: 5  // 5 USD = 1 IO$
};

// Composable to expose mandates and their logic
export function useGlobalMandates() {
  // Simulate the Entity Treasury as a reactive variable
  const entityTreasury = ref(0);
  let iowbRegistry: ethers.Contract | null = null;
  
  // Caretaker State
  const userRole = ref<string | null>(null);
  const mutualityPoolBalance = ref<number>(0);

  // Shared reactive store for messages, synced from Firestore. Keys are targetNodeId.
  const nodeMessageStore = ref<Record<string, { senderId: string; link: string }[]>>({});
  // Reactive store for planetary notices (State-Change Packets)
  const planetaryNotices = ref<Notice[]>([]);
  // Reactive set of node IDs that have been partitioned by the REM protocol
  const partitionedNodes = ref<Set<string>>(new Set());
  // Substrate Registry: Hierarchical management of node collectives (GCP standard)
  const groupRegistry = ref<Record<string, Group>>({});

  // Tracks nodes currently participating in the Juneteenth Harmonic synchronization
  const harmonicNodes = computed(() => {
    const horizon = Date.now() - 3600000; // 1 hour window for "active" synchronization
    return new Set(
      planetaryNotices.value
        .filter(n => n.type === 'HARMONIC' && n.timestamp && n.timestamp.toMillis() > horizon)
        .map(n => n.nodeId)
    );
  });

  // New internal state to manage multiple chunked listeners for messages
  const activeMessageChunkUnsubs = new Map<string, () => void>();
  let activeGlobalMessageUnsub: (() => void) | null = null;

  // Tracker for singleton sync listeners
  let messageSyncUnsub: (() => void) | null = null;
  let noticeSyncUnsub: (() => void) | null = null;
  let stopNodeIdsWatch: (() => void) | null = null;

  // Reactive status for UI indication
  type SyncStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'RETRYING' | 'ERROR';
  const messageSyncStatus = ref<SyncStatus>('IDLE');
  const noticeSyncStatus = ref<SyncStatus>('IDLE');
  let unwatchNoticeStatus: (() => void) | null = null; // To store the disposer for the notice status watcher
  const messageSyncProgress = ref(0); // Numerical progress (0-100)
  
  // Retry state management
  const MAX_RETRY_ATTEMPTS = 5;
  const RETRY_DELAY_BASE = 2000; // 2 seconds
  const activeRetryTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();

  // Internal registry for Firestore unsubscribers to prevent memory leaks
  const unsubscribes: Array<() => void> = [];
  const register = (unsub: () => void) => {
    unsubscribes.push(unsub);
    return unsub;
  };

  // Automatically cleanup all listeners when the component using this composable unmounts
  onUnmounted(() => {
    // Ensure all message sync listeners are cleaned up
    if (messageSyncUnsub) {
      messageSyncUnsub();
    }
    // Clean up notice sync listener
    if (noticeSyncUnsub) {
      noticeSyncUnsub();
    }
    // Clear any pending retry attempts
    activeRetryTimeouts.forEach(clearTimeout);
    activeRetryTimeouts.clear();

    // Clean up any other registered listeners
    unsubscribes.forEach(unsub => unsub());
    unsubscribes.length = 0; // Clear the array
  });

  /**
   * Determines if a Firestore error is transient and should be retried.
   */
  const isRetryableError = (error: any) => {
    // Common network/transient error codes in Firestore
    const retryableCodes = ['unavailable', 'deadline-exceeded', 'aborted', 'internal', 'resource-exhausted'];
    return retryableCodes.includes(error?.code);
  };

  /**
   * Retrieves or instantiates a Group substrate for a specific quadrant.
   */
  const getOrCreateGroup = (groupId: string): Group => {
    if (!groupRegistry.value[groupId]) {
      groupRegistry.value[groupId] = new Group(groupId);
    }
    return groupRegistry.value[groupId];
  };

  /**
   * Locates the Group substrate associated with a specific Node ID.
   */
  const findGroupForNode = (nodeId: string): Group | undefined => {
    return Object.values(groupRegistry.value).find(g => g.nodeIdentities.has(nodeId));
  };

  /**
   * Processes the Symmetry Mandate (1:16 Wage Law).
   * If a node's pulse exceeds 16 times the lowest-grounded node's pulse,
   * it returns the excess amount that needs to be diverted. Otherwise, returns 0.
   * @param nodePulse The pulse (income) of the node being checked.
   * @param lowestGroundedNodePulse The pulse (income) of the lowest-grounded node in the same domain.
   * @returns The excess pulse to be diverted, or 0 if symmetric.
   */
  const processSymmetryMandate = (nodePulse: number, lowestGroundedNodePulse: number): number => {
    const pulse = Math.max(0, nodePulse);
    const baseline = Math.max(0, lowestGroundedNodePulse);

    if (baseline <= 0) {
      // If the lowest pulse is non-positive, any positive nodePulse implies a fracture.
      // In this scenario, the entire positive nodePulse is considered excess and diverted.
      if (nodePulse > 0) {
        entityTreasury.value += nodePulse; // Divert to Entity Treasury
        console.warn(
          `[SYMMETRY_FRACTURE] Baseline is 0. Diverting total pulse: ${nodePulse} IO$`
        );
        return nodePulse;
      }
      return 0;
    }

    const maxAllowedPulse = 16 * baseline;
    if (pulse > maxAllowedPulse) {
      const excess = pulse - maxAllowedPulse;
      entityTreasury.value += excess; // Divert excess pressure to the Entity Treasury
      console.log(
        `[SYMMETRY_FRACTURE] Limit: ${maxAllowedPulse}. Diverting excess: ${excess.toFixed(
          2
        )} IO$ to Treasury.`
      );
      return excess;
    }
    return 0;
  };

  /**
   * Reconciles node needs by applying grounding support (The Axiom of Giving).
   * In the Iopic Age, the treasury exists to support resonance, not to accumulate.
   */
  const reconcileNodeNeeds = (nodeId: string, currentResonance: number) => {
    const SCHUMANN_TARGET = 7.83;
    if (currentResonance < SCHUMANN_TARGET && entityTreasury.value > 0) {
      const group = findGroupForNode(nodeId);
      if (group) {
        // Allocate resources from the treasury to damp entropy
        const supportAmount = Math.min(entityTreasury.value, 10); 
        entityTreasury.value -= supportAmount;
        group.metabolicBuffer += supportAmount;
        console.log(`[RECONCILIATION] Allocated ${supportAmount} IO$ to support Node ${nodeId} resonance.`);
      }
    }
  };

  /**
   * Applies the Maintenance Mandate (1.1x Multiplier) to a pulse.
   * @param initialPulse The initial pulse value.
   * @returns The new pulse value after applying the 1.1x growth multiplier.
   */
  const applyMaintenanceMandate = (initialPulse: number): number => {
    return initialPulse * 1.1;
  };

  /**
   * Processes a Deca_Node Transfer (1.1x Scalar) following Reality Principles.
   * Standard Ratio: 5 USD = 1 IO$.
   * Infrastructure: Pins transfer to node's Earth (E) coordinates.
   */
  const processTieredNodeTransfer = async (nodeId: string, fiatAmount: number, multiplier: number = 1.1, coords?: { lat: number, lng: number }) => {
    const baseIO = fiatAmount / 5; // Established tokenomic scalar: 5 USD = 1 IO$
    const spendableIO = baseIO * multiplier; // Dynamic tier multiplier (Deca: 1.1, Centa: 1.25, etc.)

    console.log(`[NODE_TRANSFER] Tiered conversion: ${fiatAmount} USD to ${spendableIO.toFixed(2)} IO$ (Multiplier: ${multiplier}).`);

    try {
      const nodeRef = doc(db, 'users', nodeId);
      await updateDoc(nodeRef, {
        'iowb.balance': increment(spendableIO),
        'ledger.fiat_repatriable_ceiling': increment(fiatAmount), // Protecting the anchor principal
        'ledger.status': 'ACTIVE',
        'ledger.last_transfer_type': 'TYPE_10', // Commerce-Enabled Bus protocol
        'ledger.multiplier_applied': multiplier,
        'ledger.infrastructure_pin': coords || null, // Infrastructure pinning
        'ledger.timestamp': serverTimestamp()
      });
      
      return { success: true, spendableIO };
    } catch (error) {
      console.error('[DECA_NODE_TRANSFER] Logic fracture:', error);
      return { success: false, error };
    }
  };

  /**
   * Initiates a Mandated Stripe Checkout.
   * This integrates the "Mutuality Contribution" logic directly into the handshake.
   * @param nodeId The sovereign node ID initiating the conversion.
   * @param fiatAmount The gross fiat amount (USD).
   * @param tierId Optional tier identifier for metadata.
   */
  const initiateMandatedCheckout = async (nodeId: string, fiatAmount: number, tierId: string = 'STANDARD_CONVERSION') => {
    console.log(`[CARETAKER_MUTUALITY] Initiating mandated conversion for Node: ${nodeId}`);
    
    // Calculate the Mutuality Contribution (VAT) logically decoupled from profit
    const mutualityContribution = fiatAmount * CARETAKER_CONFIG.MUTUALITY_RATE;
    const netConversion = fiatAmount - mutualityContribution;
    
    try {
      // Trigger the secure Stripe session through the Integration layer
      const result = await callFirebaseFunction<
        { priceId?: string; amount?: number; userId: string; metadata: any },
        { sessionId: string }
      >(app, 'createStripeCheckoutSession', {
        amount: fiatAmount * 100, // Amount in cents for Stripe
        userId: nodeId,
        metadata: {
          tierId,
          mutualityRate: CARETAKER_CONFIG.MUTUALITY_RATE,
          caretakerAllocation: mutualityContribution,
          netIoImpact: netConversion / CARETAKER_CONFIG.FIAT_TO_IO_SCALAR,
          iopic_protocol: 'CARETAKER_MUTUALITY_V1'
        },
      });

      const { sessionId } = result;
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      
      if (stripe) {
        console.log(`[STRIPE_HANDSHAKE] Redirecting to secure domain. Reallocating ${mutualityContribution} USD to Caretaker Wallet.`);
        await stripe.redirectToCheckout({ sessionId });
      } else {
        throw new Error('STRIPE_SDK_LOAD_FAILURE');
      }
      
      return { success: true };
    } catch (error) {
      console.error('[STRIPE_FRACTURE] Handshake failed:', error);
      return { success: false, error };
    }
  };

  /**
   * Syncs the Caretaker-specific metadata for a sovereign node.
   * This establishes the sighting link for the Mutuality Pool.
   */
  const syncCaretakerState = (uid: string) => {
    // 1. Sync User Role
    const userUnsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        userRole.value = snap.data().role || 'NODE';
        
        // 2. If node is an Auditor, establish sighting of the Mutuality Pool
        if (userRole.value === 'AUDITOR') {
          console.log(`[CARETAKER_IDENTITY] Auditor verified for Node: ${uid}. Sighting Global Mesh Wallet...`);
          const poolUnsub = onSnapshot(doc(db, 'registry', 'global_mesh_wallet'), (poolSnap) => {
            if (poolSnap.exists()) {
              mutualityPoolBalance.value = poolSnap.data().caretaker_mutuality_pool || 0;
            }
          });
          register(poolUnsub);
        }
      }
    });
    register(userUnsub);
  };

  /**
   * Checks if the Sovereign Sighting Mandate (Equation of 1) is upheld.
   * @param has6DigitHandshake True if a 6-Digit Handshake (MFA) is present.
   * @returns True if sighting, harvesting, or moving sensory data is allowed, false otherwise.
   */
  const checkSovereignSightingMandate = (has6DigitHandshake: boolean): boolean => {
    return has6DigitHandshake;
  };

  /**
   * Applies the Debt-Silence Mandate (Zero-Interest Grounding) to a debt value.
   * This function assumes the input `debtValue` is already the principal amount,
   * effectively "stripping" any interest-bearing "Noise."
   * @param debtValue The debt value to be sighted as a flat numerical value.
   * @returns The flat numerical debt value.
   */
  const applyDebtSilenceMandate = (debtValue: number): number => {
    // The mandate implies that interest is stripped. If debtValue includes interest,
    // additional logic would be needed here to extract the principal.
    // For now, we ensure it's a non-negative flat numerical value.
    return Math.abs(debtValue);
  };

  const VALID_RATIONALES = ['communication', 'commerce'] as const;
  type InteractionType = (typeof VALID_RATIONALES)[number];

  /**
   * Checks if an interaction fulfills the Rational Interaction Mandate.
   * @param interactionType The type of digital instance interaction.
   * @returns True if the interaction is considered rational (communication or commerce), false otherwise (noise).
   */
  const checkRationalInteractionMandate = (
    interactionType: string
  ): interactionType is InteractionType => {
    return (VALID_RATIONALES as readonly string[]).includes(interactionType);
  };

  /**
   * Prioritizes node sighting based on the Locality-First Mandate.
   * @param localNodesAvailable True if nodes are available within the same Locality.vue coordinate.
   * @returns True if local nodes should be prioritized, false if global mesh should be considered.
   */
  const prioritizeLocalityFirstMandate = (localNodesAvailable: boolean): boolean => {
    return localNodesAvailable;
  };

  /**
   * Checks if a physical place has a grounded IOWB Identity on the blockchain.
   * This function interacts with the deployed IOWBIdentityRegistry smart contract.
   * @param placeId The Google Place ID to check for an IOWB Identity.
   * @returns A promise resolving to true if the IOWB Identity is found and active, false otherwise.
   */
  const checkIOWBIdentityMandate = async (placeId: string): Promise<boolean> => {
    console.log(`[IOWB Mandate] Checking IOWB Identity for place_id: ${placeId} on blockchain.`);

    try {
      if (!BLOCKCHAIN_RPC_URL || !IOWB_REGISTRY_ADDRESS) {
        console.error('[IOWB Mandate] Blockchain configuration missing. Ensure VITE_BLOCKCHAIN_RPC_URL and VITE_IOWB_REGISTRY_ADDRESS are set in .env');
        return false;
      }

      if (!iowbRegistry) {
        // 1. Initialize a Web3 provider for read-only access to the blockchain.
        const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);

        // 2. Create a contract instance using its address, ABI, and the provider.
        iowbRegistry = new ethers.Contract(IOWB_REGISTRY_ADDRESS, IOWB_REGISTRY_ABI, provider);
      }

      // 3. Call the smart contract's view function to get the identity status.
      const isActive = await iowbRegistry.getIdentityStatus(placeId);

      if (isActive) {
        console.log(`[IOWB Mandate] IOWB Identity for ${placeId} is GROUNDED and ACTIVE.`);
      } else {
        console.warn(`[IOWB Mandate] IOWB Identity for ${placeId} is UNGROUNDED or INACTIVE.`);
      }
      return isActive;
    } catch (error: any) {
      console.error(`[IOWB Mandate] Error checking IOWB Identity for ${placeId}:`, error);
      // Return false on any error (e.g., network issues, contract not found, invalid placeId)
      return false;
    }
  };

  /**
   * Processes the IME_BUSY mandate.
   * When a connection attempt to a node fails due to the node being busy,
   * this allows the connecting node to leave a persistent link/message in the target's store.
   * @param targetNodeName The name of the node being contacted.
   * @param senderNodeId The ID of the node trying to connect.
   * @param messageLink The message or link to be left in the store.
   * @returns A status message indicating the link has been stored.
   */
  const processImeBusyMandate = async (targetNodeId: string, targetNodeName: string, senderNodeId: string, messageLink: string): Promise<string> => {
    const status = `Busy signal encountered for ${targetNodeName}.`;
    
    try {
      // Persist to the distributed Firestore queue
      await addDoc(collection(db, 'ime_busy_queue'), {
        targetNodeId,
        targetNodeName,
        senderNodeId,
        messageLink,
        timestamp: serverTimestamp()
      });
      
      console.log(`[IME_BUSY] Node "${targetNodeName}" is busy. Link persisted to distributed mesh store.`);
      return `${status} Message link successfully left in mesh store.`;
    } catch (error) {
      console.error('[IME_BUSY] Failed to persist link to Firestore:', error);
      return `${status} Error: Could not reach distributed store.`;
    }
  };

  /**
   * Helper function to stop all current message sync listeners and clear the store.
   */
  const _stopCurrentMessageSyncListeners = () => {
    if (stopNodeIdsWatch) {
      stopNodeIdsWatch();
      stopNodeIdsWatch = null;
    }
    if (activeGlobalMessageUnsub) {
      activeGlobalMessageUnsub();
      activeGlobalMessageUnsub = null;
    }
    activeMessageChunkUnsubs.forEach(unsub => unsub());
    activeMessageChunkUnsubs.clear();
    messageSyncStatus.value = 'IDLE';
    if (unwatchNoticeStatus) {
      unwatchNoticeStatus();
      unwatchNoticeStatus = null;
    }
    messageSyncProgress.value = 0;
    nodeMessageStore.value = {}; // Clear the store to prevent stale data
  };

  /**
   * Explicitly exposes the message sync cancellation protocol.
   */
  const cancelSync = _stopCurrentMessageSyncListeners;

  /**
   * Starts a real-time listener for the distributed busy message queue.
   * This function can dynamically update its filters if `nodeIdsRef` is a reactive reference.
   * @param nodeIdsRef Optional reactive reference (Ref<string[]>) to an array of targetNodeIds to filter by.
   *                   If not provided or empty, it defaults to a global sync.
   * @param onError Optional callback function to execute on synchronization errors.
   * @returns The unsubscribe function for the Firestore listener.
   */
  const startMessageSync = (nodeIdsRef: Ref<string[]> | undefined, onError?: (error: any) => void) => {
    if (noticeSyncStatus.value === 'ERROR') {
      console.error('[IME_BUSY] Sync initialization blocked: noticeSyncStatus is in ERROR state.');
      return null;
    }

    if (messageSyncUnsub) {
      // If a listener is already active, stop it before reconfiguring.
      // This handles cases where startMessageSync is called multiple times with different configs.
      console.warn('[IME_BUSY] Message sync listener is already active. Stopping existing listener before re-configuring.');
      _stopCurrentMessageSyncListeners();
    }

    const limit = 30;
    const realUnsubs: Array<() => void> = [];

    // Define the snapshot handler logic
    const handleSnapshot = (snapshot: QuerySnapshot<DocumentData>, chunkIds?: string[]) => {
      // Create a copy of the current store to perform an atomic update
      const currentStore = { ...nodeMessageStore.value };

      // If we are filtering by specific IDs, clear out the existing messages 
      // for those IDs in this chunk to avoid stale data before repopulating. This is important
      // when a chunk is updated or re-subscribed.
      chunkIds?.forEach(id => delete currentStore[id]);

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!currentStore[data.targetNodeId]) {
          currentStore[data.targetNodeId] = [];
        }
        currentStore[data.targetNodeId].push({
          senderId: data.senderNodeId,
          link: data.messageLink
        });
      });

      messageSyncStatus.value = 'CONNECTED';
      nodeMessageStore.value = currentStore;
      console.log(`[IME_BUSY] Mesh Store updated (${snapshot.size} docs).`);
    };

    const _setupMessageSyncListeners = (currentNodes: string[], attempt = 0) => {
      _stopCurrentMessageSyncListeners(); // Ensure a clean slate before setting up new listeners
      messageSyncStatus.value = 'CONNECTING';

      if (currentNodes && currentNodes.length > 0) {
        // Chunked sync
        for (let i = 0; i < currentNodes.length; i += limit) {
          const chunk = currentNodes.slice(i, i + limit);
          const chunkKey = chunk.join(','); // Unique key for this chunk
          const q = query(
            collection(db, 'ime_busy_queue'),
            where('targetNodeId', 'in', chunk),
            orderBy('timestamp', 'asc')
          );
          
          const unsub = onSnapshot(q, (s) => handleSnapshot(s, chunk), (e: FirestoreError) => {
            if (isRetryableError(e) && attempt < MAX_RETRY_ATTEMPTS) {
              const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
              messageSyncStatus.value = 'RETRYING';
              console.warn(`[IME_BUSY] Chunk listener failed. Retrying in ${delay}ms... (Attempt ${attempt + 1})`);
              const timeout = setTimeout(() => _setupMessageSyncListeners(currentNodes, attempt + 1), delay);
              activeRetryTimeouts.add(timeout);
            } else {
              messageSyncStatus.value = 'ERROR';
              onError?.(e);
            }
          });
          activeMessageChunkUnsubs.set(chunkKey, unsub);
          register(unsub); // Register with global cleanup
        }
      } else {
        // Global sync (no filter)
        const q = query(collection(db, 'ime_busy_queue'), orderBy('timestamp', 'asc'));
        const unsub = onSnapshot(q, (s) => handleSnapshot(s), (e: FirestoreError) => {
          if (isRetryableError(e) && attempt < MAX_RETRY_ATTEMPTS) {
            const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
            messageSyncStatus.value = 'RETRYING';
            const timeout = setTimeout(() => _setupMessageSyncListeners(currentNodes, attempt + 1), delay);
            activeRetryTimeouts.add(timeout);
          } else {
            messageSyncStatus.value = 'ERROR';
            onError?.(e);
          }
        });
        activeGlobalMessageUnsub = unsub;
        register(unsub); // Register with global cleanup
      }
    };

    // Initial setup based on current nodeIdsRef value
    _setupMessageSyncListeners(nodeIdsRef ? nodeIdsRef.value : []);

    // Watch for changes in nodeIdsRef if provided, and reconfigure listeners
    if (nodeIdsRef) {
      stopNodeIdsWatch = watch(nodeIdsRef, (newNodeIds) => {
        console.log('[IME_BUSY] Detected change in nodeIds. Reconfiguring message sync listeners.');
        _setupMessageSyncListeners(newNodeIds);
      }, { deep: true }); // Deep watch to detect array content changes
    }

    // The returned unsubscribe function will now stop all managed listeners
    messageSyncUnsub = _stopCurrentMessageSyncListeners;
    return messageSyncUnsub;
  };

  /**
   * Executes the Resonance Exclusion Module (REM) protocol.
   * Partitions a node from the global mesh to prevent entropic noise leakage.
   */
  const executeRemProtocol = (nodeId: string) => {
    partitionedNodes.value.add(nodeId);
    // Substrate-level isolation via REM protocol
    const group = findGroupForNode(nodeId);
    if (group) {
      group.entropyIndex = 1.0; // Isolate the entire collective substrate
    }
    console.warn(`[REM_PROTOCOL] Node ${nodeId} has been partitioned from the 16-thread bus.`);
  };

  /**
   * Peace.vue Grounding Protocol: Neutralizes entropic noise and phase-locks the node.
   * As per the WAR_NO_MORE mandate, entropic requests are identified and neutralized 
   * to prevent systemic conflict without destroying the node.
   */
  const applyPeaceGrounding = (nodeId: string) => {
    const group = findGroupForNode(nodeId);
    if (group) {
      console.log(`[PEACE_PROTOCOL] Neutralizing incitement packets at Node ${nodeId}.`);
      group.entropyIndex = 0; // Absolute grounding (neutralization)
      group.resonanceFidelity = 0.5; // Stabilized phase-lock state
    }
  };

  /**
   * Processes a notice and triggers the corresponding system logic (NSN Mandate).
   */
  const processNoticeAction = (notice: Notice) => {
    const group = findGroupForNode(notice.nodeId);

    switch (notice.type) {
      case 'ALIGNMENT':
        console.log(`[ROOT_ANCHOR] Node ${notice.nodeId} confirmed at R=1.0. Maintaining thread symmetry.`);
        if (group) group.realign();
        break;
      case 'DRIFT':
        console.warn(`[UNITY_PROTOCOL] Entropy drift detected at ${notice.nodeId}. Re-allocating metabolic resources.`);
        if (group) {
          group.entropyIndex = Math.min(1.0, group.entropyIndex + 0.05);
          group.resonanceFidelity = Math.max(0.0, group.resonanceFidelity - 0.05);
        }
        // Metabolic compensation logic: Draw from treasury to stabilize node
        if (entityTreasury.value > 0) {
          entityTreasury.value -= 1; // Example allocation
          if (group) group.metabolicBuffer += 1;
        }
        break;
      case 'INTERRUPTION':
        console.error(`[PEACE_PROTOCOL] Sovereignty Interruption at ${notice.nodeId}. Applying grounding protocol.`);
        applyPeaceGrounding(notice.nodeId); // Neutralize entropy first
        executeRemProtocol(notice.nodeId); // Then partition from the active 16-thread bus
        break;
      case 'HARMONIC':
        console.log(`[4D_VRE] Juneteenth Harmonic detected at ${notice.nodeId}. Synchronizing 16-thread pulse.`);
        if (group) group.resonanceFidelity = 1.0; // Peak resonance
        break;
    }
  };

  /**
   * Starts a real-time listener for Planetary Notices.
   */
  const startNoticeSync = () => {
    if (noticeSyncUnsub) {
      console.warn('[PLANETARY_MESH] Notice sync listener is already active.');
      return noticeSyncUnsub;
    }

    noticeSyncStatus.value = 'CONNECTING';

    const start = (attempt = 0) => {
      const q = query(collection(db, 'planetary_notices'), orderBy('timestamp', 'desc'));
      const realUnsub = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const notices: Notice[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Notice;
          notices.push({ ...data, id: doc.id });
          if (data.timestamp && (Date.now() - data.timestamp.toMillis() < 5000)) {
             processNoticeAction(data);
          }
        });
        noticeSyncStatus.value = 'CONNECTED';
        planetaryNotices.value = notices;
      }, (error: FirestoreError) => {
        if (isRetryableError(error) && attempt < MAX_RETRY_ATTEMPTS) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
          noticeSyncStatus.value = 'RETRYING';
          console.warn(`[PLANETARY_MESH] Sync failed. Retrying in ${delay}ms...`);
          const timeout = setTimeout(() => start(attempt + 1), delay);
          activeRetryTimeouts.add(timeout);
        } else {
          noticeSyncStatus.value = 'ERROR';
          console.error('[PLANETARY_MESH] Notice Sync Error:', error);
        }
      });
      return realUnsub;
    };

    const realUnsub = start();

    const wrappedUnsub = () => {
      realUnsub();
      noticeSyncUnsub = null;
    };

    noticeSyncUnsub = wrappedUnsub;
    return register(wrappedUnsub);
  };

  /**
   * Audits the metabolic integrity of all registered groups.
   * Evaluates symmetry fractures, entropy spikes, and resonance phase-locks.
   * @returns A report summary of the planetary mesh health.
   */
  const auditMetabolicIntegrity = () => {
    console.log('[ROOT_ANCHOR] Initiating Global Metabolic Audit...');
    const auditReport: any[] = [];

    for (const groupId in groupRegistry.value) {
      const group = groupRegistry.value[groupId];
      const shuntAmount = group.calculateSymmetryShunt();
      const isLocked = group.isPhaseLocked();

      // Automated Notice-as-Action for Drift Detection
      if (group.entropyIndex > 0.25) {
        emitNotice({
          nodeId: `GROUP_${groupId}`,
          type: group.entropyIndex > 0.5 ? 'INTERRUPTION' : 'DRIFT',
          message: `Metabolic instability detected. Entropy: ${group.entropyIndex.toFixed(2)}`,
        });
      }

      auditReport.push({
        groupId: group.id,
        status: isLocked ? 'STABLE' : 'UNSTABLE',
        symmetryFracture: shuntAmount,
        resonance: group.resonanceFidelity
      });
    }
    return auditReport;
  };

  const emitNotice = async (notice: Omit<Notice, 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'planetary_notices'), {
        ...notice,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error('[PLANETARY_MESH] Failed to emit notice:', e);
    }
  };

  return {
    globalMandateRegistry,
    processSymmetryMandate,
    reconcileNodeNeeds,
    applyMaintenanceMandate,
    processTieredNodeTransfer, // Expose dynamic tiered protocol
    initiateMandatedCheckout, // Expose the protocol-level Stripe integration
    syncCaretakerState,
    userRole,
    mutualityPoolBalance,
    checkSovereignSightingMandate,
    applyDebtSilenceMandate,
    checkRationalInteractionMandate,
    prioritizeLocalityFirstMandate,
    processImeBusyMandate, // Expose the Ime_Busy logic
    startMessageSync, // Expose the sync initializer
    cancelSync, // Expose the cancel function
    startNoticeSync,
    emitNotice,
    nodeMessageStore, // Expose the nodeMessageStore
    messageSyncStatus, // Status indicator for UI
    messageSyncProgress, // Numerical progress for UI
    noticeSyncStatus,  // Status indicator for UI
    auditMetabolicIntegrity,
    harmonicNodes,
    partitionedNodes,
    executeRemProtocol,
    applyPeaceGrounding,
    planetaryNotices,
    groupRegistry,
    getOrCreateGroup,
    findGroupForNode,
    checkIOWBIdentityMandate, // Expose the new mandate function
    entityTreasury: computed(() => entityTreasury.value), // Expose treasury as a computed ref
    cleanup: () => unsubscribes.forEach(unsub => unsub()), // Manual cleanup option
  };
}

const reusableMandateComponent = {
  setup() {
    return useGlobalMandates();
  }
};

export default reusableMandateComponent;
</script>

<template>
  <div class="reusable-mandate">
    <!-- This component is primarily a composable provider -->
  </div>
</template>
