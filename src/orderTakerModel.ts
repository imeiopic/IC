import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp, 
    updateDoc, 
    doc, 
    setDoc,
    getDoc,
    getDocs,
    type Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebase-config';
import { safeOnSnapshot } from './firestoreUtils';

/**
 * IOPIC Protocol: Order Status Definitions
 * INIT: BS-Molecule initialized, waiting for backbone symmetry.
 * SYNCING: 16-thread bridge protocol actively validating.
 * LOCKED: Logical Truth achieved, entry added to IDEAL ledger.
 * DISRUPTED: Hallucination detected or connection lost.
 */
export type OrderStatus = 'INIT' | 'SYNCING' | 'LOCKED' | 'DISRUPTED' | 'FULFILLED';

export interface MenuItem {
    id: string;
    name: string;
    price: number;
}

export interface Menu {
    id?: string;
    entityId: string;
    items: MenuItem[];
    version: number;
}

export interface OrderBond {
    id?: string;
    initiatorUid: string;
    targetUid: string;
    assignedMemberUid?: string; // The "Entity's concerned member"
    payload: {
        description: string;
        items: MenuItem[];
        totalValue: number;
        currency: string;
    };
    status: OrderStatus;
    verificationThreads: number; // 0 to 16
    createdAt: any;
    updatedAt: any;
    vreId: string;
    targetCoords?: {
        lat: number;
        lon: number;
        alt?: number;
    };
    verificationData?: {
        coordinates: { lat: number; lon: number; alt: number | null };
        distanceMeters: number | null;
        verifiedAt: string;
        deviceId?: string;
        signature?: string;
    };
}

/**
 * Model for handling BS-Molecule Bonds (Orders)
 */
export const OrderTakerModel = {
    /**
     * Initializes a new logical bond between two entities.
     */
    async initializeBond(initiatorUid: string, targetUid: string, data: OrderBond['payload'], vreId: string, assignedMemberUid?: string, targetCoords?: OrderBond['targetCoords']) {
        const bondData: Omit<OrderBond, 'id'> = {
            initiatorUid,
            targetUid,
            assignedMemberUid: assignedMemberUid || null,
            payload: data,
            status: 'INIT',
            verificationThreads: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            vreId,
            targetCoords: targetCoords || null
        };

        return await addDoc(collection(db, 'bonds'), bondData);
    },

    /**
     * Fetches the current menu for a specific entity.
     */
    async getEntityMenu(entityId: string): Promise<Menu | null> {
        const menuRef = doc(db, 'menus', entityId);
        const snap = await getDoc(menuRef);
        if (snap.exists()) {
            return { id: snap.id, ...snap.data() } as Menu;
        }
        return null;
    },

    /**
     * Publishes a menu for an entity substrate.
     */
    async publishMenu(entityId: string, items: MenuItem[]) {
        const menuRef = doc(db, 'menus', entityId);
        return await setDoc(menuRef, {
            entityId,
            items,
            lastUpdated: serverTimestamp()
        });
    },

    /**
     * Monitors the IDEAL ledger for bonds involving the current entity.
     */
    subscribeToBonds(userUid: string, onUpdate: (bonds: OrderBond[]) => void): Unsubscribe {
        // Query for bonds where the user is either the initiator or the target
        const bondsRef = collection(db, 'bonds');
        const q = query(
            bondsRef, 
            where('initiatorUid', '==', userUid), 
            orderBy('createdAt', 'desc')
        );

        return safeOnSnapshot(q, (snapshot) => {
            const bonds = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as OrderBond));
            onUpdate(bonds);
        }, {
            includeMetadataChanges: true,
            shouldReport: (err) => err.code !== 'permission-denied'
        });
    },

    /**
     * Monitors the IDEAL ledger for bonds assigned to the current entity (the concerned member).
     */
    subscribeToAssignedBonds(userUid: string, onSnapshotReceived: (snapshot: any) => void): Unsubscribe {
        const bondsRef = collection(db, 'bonds');
        const q = query(
            bondsRef, 
            where('assignedMemberUid', '==', userUid), 
            orderBy('createdAt', 'desc')
        );

        return safeOnSnapshot(q, onSnapshotReceived, {
            includeMetadataChanges: true,
            shouldReport: (err) => err.code !== 'permission-denied'
        });
    },

    /**
     * Updates the verification state of a specific thread bridge.
     */
    async updateVerificationThreads(bondId: string, threadCount: number) {
        const bondRef = doc(db, 'bonds', bondId);
        const status: OrderStatus = threadCount >= 16 ? 'LOCKED' : 'SYNCING';
        
        return await updateDoc(bondRef, {
            verificationThreads: Math.min(threadCount, 16),
            status,
            updatedAt: serverTimestamp()
        });
    },

    /**
     * Updates the status of a specific bond.
     */
    async updateBondStatus(bondId: string, status: OrderStatus, verificationData?: any) {
        const bondRef = doc(db, 'bonds', bondId);
        const updatePayload: any = {
            status,
            updatedAt: serverTimestamp()
        };

        if (verificationData) {
            updatePayload.verificationData = verificationData;
        }

        return await updateDoc(bondRef, updatePayload);
    }
};

export default OrderTakerModel;