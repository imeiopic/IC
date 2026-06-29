import type { EntityIDEALRange } from './entityIDEALRange';

/**
 * IDEAL Model
 * 
 * Represents the logical workflow:
 * I - Instance (The Member Instance 0001)
 * D - Detect (Proximity detection event)
 * E - Entity (The target Domain 0110)
 * A - Access (Permission/Logic calculation)
 * L - Location (4D spatial context)
 */

export type IDEALAccessStatus = 'LOCKED' | 'PENDING_INVITE' | 'AUTHORIZED' | 'DENIED' | 'OUT_OF_RANGE' | 'BLUETOOTH_VALIDATING' | 'DETECTED';

/** 30 Feet converted to meters for precise logical validation */
export const BLUETOOTH_VALIDATION_THRESHOLD_METERS = 9.144;

export interface IDEALRecord {
  id: string;
  instanceId: string;      // Fulfills 0001_instances
  entityId: string;        // Fulfills 0110_entities
  detectedAt: string;      // ISO Timestamp
  location: {              // Precise coordinate
    lat: number;
    lng: number;
    alt: number;
  };
  status: IDEALAccessStatus;
  rangeSnapshot: EntityIDEALRange;
  proximityMeters: number;
}

/**
 * Calculates the distance between two coordinates in meters using the Haversine formula.
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validates if the Instance is within the 30ft threshold required for Bluetooth Handshake.
 */
export function isWithinBluetoothRange(proximityMeters: number): boolean {
  return proximityMeters <= BLUETOOTH_VALIDATION_THRESHOLD_METERS;
}

/**
 * Determines if a record is ready to transition from Detection to Access.
 */
export function shouldAttemptBluetoothValidation(record: IDEALRecord): boolean {
  return isWithinBluetoothRange(record.proximityMeters) && record.status !== 'AUTHORIZED';
}

/**
 * Generates 8 boundary points around a location based on the 30ft Bluetooth threshold.
 * These points anchor the "Access" phase of the IDEAL model in 4D space.
 */
export function generateEightBoundaryPoints(lat: number, lng: number, alt: number): Array<{ lat: number; lng: number; alt: number }> {
  // Convert 30ft threshold to degree offsets
  const latOffset = BLUETOOTH_VALIDATION_THRESHOLD_METERS / 111320;
  const lngOffset = BLUETOOTH_VALIDATION_THRESHOLD_METERS / (111320 * Math.cos(lat * (Math.PI / 180)));
  const altOffset = 3.0; // 3 meter vertical offset for elevation validation

  const points: Array<{ lat: number; lng: number; alt: number }> = [];
  
  [lat - latOffset, lat + latOffset].forEach(l => {
    [lng - lngOffset, lng + lngOffset].forEach(g => {
      [alt - altOffset, alt + altOffset].forEach(a => {
        points.push({ lat: l, lng: g, alt: a });
      });
    });
  });

  return points;
}

/**
 * Checks if a coordinate is logically inside the volume formed by the 8 boundary points.
 * This fulfills the 'Access' validation for stationary targets in the IDEAL model.
 */
export function isInsideStationaryBoundary(
  currentLoc: { lat: number; lng: number; alt: number },
  boundaryPoints: Array<{ lat: number; lng: number; alt: number }>
): boolean {
  if (boundaryPoints.length !== 8) return false;

  const lats = boundaryPoints.map(p => p.lat);
  const lngs = boundaryPoints.map(p => p.lng);
  const alts = boundaryPoints.map(p => p.alt);

  return (
    currentLoc.lat >= Math.min(...lats) && currentLoc.lat <= Math.max(...lats) &&
    currentLoc.lng >= Math.min(...lngs) && currentLoc.lng <= Math.max(...lngs) &&
    currentLoc.alt >= Math.min(...alts) && currentLoc.alt <= Math.max(...alts)
  );
}

/**
 * Validates stationary access during the 'Access' phase.
 */
export function validateStationaryAccess(
  currentLoc: { lat: number; lng: number; alt: number },
  inviteBoundaryPoints?: Array<{ lat: number; lng: number; alt: number }>
): boolean {
  if (!inviteBoundaryPoints) return false;
  return isInsideStationaryBoundary(currentLoc, inviteBoundaryPoints);
}

export const exampleIDEALRecord: IDEALRecord = {
  id: 'ideal-evt-001',
  instanceId: 'person01',
  entityId: 'global-exchange-0110',
  detectedAt: new Date().toISOString(),
  location: { lat: 40.7128, lng: -74.0060, alt: 10 },
  status: 'DETECTED',
  rangeSnapshot: { center: { lat: 40.7128, lng: -74.0060, alt: 10 }, radius_meters: 50, active_ordertaker: "1000_GENIE_SERVICE", protocol: "LOGIC" },
  proximityMeters: 5.5
};