

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase-config";

// Firestore Path: /0110_entities/{entityId}
export interface EntityDomain {
  binary_id: string;
  type: string;
  name: string;
  members: string[];
  gatekeeper_rules: string;
  status: string;
}


export async function saveEntityDomain(entityId: string, entityDomain: EntityDomain) {
  const ref = doc(db, "0110_entities", entityId);
  await setDoc(ref, entityDomain);
}

// Function to fulfill the Logic of Reality for a new user
export const createInstance = async (
  userId: string,
  location: { x: number; y: number; z: number }
) => {
  const instanceRef = doc(db, "0001_instances", userId);
  await setDoc(instanceRef, {
    thread: "0001",
    status: "CONNECTED", // Fulfills 0011
    timestamp: serverTimestamp(), // Represents 'TIME' from your 4D concept
    location,
  });
  console.log("Logical Digital Reality Initiated.");
};
