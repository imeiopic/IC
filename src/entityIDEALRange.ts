export interface EntityIDEALRange {
  center: { lat: number; lng: number; alt: number };
  radius_meters: number;
  active_ordertaker: string;
  protocol: string;
}

export const entityIDEALRange: EntityIDEALRange = {
  center: { lat: 40.7128, lng: -74.0060, alt: 10 }, // New York example
  radius_meters: 50, // The proximity boundary
  active_ordertaker: "1000_GENIE_SERVICE",
  protocol: "LOGIC"
};

import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase-config";

export const saveEntityIDEALRange = async (entityId: string, range: EntityIDEALRange) => {
  const ref = doc(db, "1101_earth_logic", entityId);
  await setDoc(ref, range);
  console.log("Entity IDEAL range saved to Firestore.");
};

// Client-side detection logic example
export function isWithinRadius(userPos: { lat: number; lng: number }, entityPos: { lat: number; lng: number }, radius: number): boolean {
  const toRad = (x: number) => x * Math.PI / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(entityPos.lat - userPos.lat);
  const dLng = toRad(entityPos.lng - userPos.lng);
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(userPos.lat)) * Math.cos(toRad(entityPos.lat)) * Math.sin(dLng/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance < radius;
}

// Usage:
// if (isWithinRadius(userPos, entityIDEALRange.center, entityIDEALRange.radius_meters)) {
//   triggerOrderTaker(); // Proximity Connect!
// }
