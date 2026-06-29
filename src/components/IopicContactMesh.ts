import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const MESH_COLLECTION = "contactMesh";

// Call this when user enters Step 4. Returns unsubscribe function.
export function joinContactMesh(
  userId: string,
  displayName: string,
  onPeersUpdate: (peers: any[]) => void,
) {
  // Register self as present
  const myDoc = doc(db, MESH_COLLECTION, userId);
  setDoc(
    myDoc,
    {
      name: displayName || "Anonymous Node",
      lastSeen: serverTimestamp(),
    },
    { merge: true },
  );

  // Listen for all present peers (excluding self)
  const meshCol = collection(db, MESH_COLLECTION);
  const unsubscribe = onSnapshot(meshCol, (snap) => {
    const peers: any[] = [];
    snap.forEach((docSnap) => {
      if (docSnap.id !== userId) {
        peers.push({ id: docSnap.id, ...docSnap.data() });
      }
    });
    onPeersUpdate(peers);
  });
  return unsubscribe;
}

// Optionally, call this when user leaves onboarding to clean up
export async function leaveContactMesh(userId: string) {
  // Optionally, delete or update presence
  // await deleteDoc(doc(db, MESH_COLLECTION, userId));
}
