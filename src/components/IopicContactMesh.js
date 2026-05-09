// IopicContactMesh.js
// Peer discovery for Contact Mesh Sync (Step 4 Onboarding)
// This version uses Firestore presence for real peer discovery.

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
export function joinContactMesh(userId, displayName, onPeersUpdate) {
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
    const peers = [];
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
export async function leaveContactMesh(userId) {
  // Optionally, delete or update presence
  // await deleteDoc(doc(db, MESH_COLLECTION, userId));
}
