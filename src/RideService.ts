/**
 * RIDE SERVICE v1.0
 * Purpose: Encapsulates all ride-related operations, including authentication,
 * driver finding, cost calculation, and ride dispatch, using Firebase.
 */

import { db, auth as firebaseAuth } from '@/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { calculateDistance } from './idealModel'; // Assuming idealModel.ts contains calculateDistance

// Represents the current authenticated user.
interface CurrentUser {
  uid: string; // Firebase Auth User ID
  email: string | null;
  coordinates: { lat: number; lng: number }; // User's last known coordinates
  // Add other user properties as needed
}

// Represents a Sovereign Driver
interface SovereignDriver {
  uid: string; // Driver's User ID
  coordinates: { lat: number; lng: number }; // Driver's current coordinates
  status: 'SOVEREIGN' | 'AVAILABLE' | 'BUSY' | 'OFFLINE'; // Driver's availability status
  // Add other driver properties as needed
}

export const RideService = {
  /**
   * Retrieves the current authenticated user and their coordinates from Firestore.
   * @returns CurrentUser object or null if no user is authenticated or coordinates are missing.
   */
  async getCurrentUser(): Promise<CurrentUser | null> {
    const firebaseUser = firebaseAuth.currentUser;
    if (!firebaseUser) {
      console.log("RideService: No authenticated Firebase user found.");
      return null;
    }

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      if (userData.coordinates && typeof userData.coordinates.lat === 'number' && typeof userData.coordinates.lng === 'number') {
        console.log(`RideService: Authenticated user ${firebaseUser.uid} found with coordinates.`);
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          coordinates: userData.coordinates,
        };
      } else {
        console.warn(`RideService: User ${firebaseUser.uid} found, but coordinates are missing or invalid.`);
        return { uid: firebaseUser.uid, email: firebaseUser.email, coordinates: { lat: 0, lng: 0 } }; // Default or error
      }
    } else {
      console.warn(`RideService: User document for ${firebaseUser.uid} not found in Firestore.`);
      return { uid: firebaseUser.uid, email: firebaseUser.email, coordinates: { lat: 0, lng: 0 } }; // Default or error
    }
  },

  /**
   * Finds the nearest available sovereign driver to the given passenger coordinates.
   * This implementation performs a basic nearest neighbor search among all sovereign drivers
   * by calculating the distance to each. For large datasets, a more advanced geospatial
   * indexing strategy (e.g., geohashes with server-side functions) would be required.
   * @param passengerCoordinates - The passenger's current geographic coordinates.
   * @returns SovereignDriver object or null if no driver is found.
   */
  async findNearestSovereignDriver(passengerCoordinates: { lat: number; lng: number }): Promise<SovereignDriver | null> {
    console.log("RideService: Searching for nearest sovereign driver...");
    const driversRef = collection(db, 'drivers');
    // Query for available sovereign drivers. In a real app, this would involve geo-queries
    // or filtering by geohash prefixes to reduce the number of documents fetched.
    const q = query(driversRef, where('status', '==', 'SOVEREIGN'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("RideService: No sovereign drivers found.");
      return null;
    }

    const driversWithDistance: Array<{ driver: SovereignDriver; distance: number }> = [];

    for (const driverDoc of snapshot.docs) {
      const driverData = driverDoc.data();
      const driverCoordinates = driverData.coordinates;

      if (driverCoordinates && typeof driverCoordinates.lat === 'number' && typeof driverCoordinates.lng === 'number') {
        const distance = calculateDistance(
          passengerCoordinates.lat,
          passengerCoordinates.lng,
          driverCoordinates.lat,
          driverCoordinates.lng
        );
        driversWithDistance.push({
          driver: {
            uid: driverDoc.id,
            coordinates: driverCoordinates,
            status: driverData.status as SovereignDriver['status'], // Ensure type safety
          },
          distance: distance,
        });
      } else {
        console.warn(`RideService: Driver ${driverDoc.id} has missing or invalid coordinates. Skipping.`);
      }
    }

    if (driversWithDistance.length === 0) {
      console.log("RideService: No sovereign drivers with valid coordinates found.");
      return null;
    }

    // Sort drivers by distance (nearest first)
    driversWithDistance.sort((a, b) => a.distance - b.distance);

    const nearestDriver = driversWithDistance[0];
    console.log(`RideService: Found nearest sovereign driver ${nearestDriver.driver.uid} at ${nearestDriver.distance.toFixed(2)} meters.`);
    return nearestDriver.driver;
  },

  /**
   * Calculates the "molecular mass" (cost) of a trip based on distance and a base rate.
   * @param origin - The origin coordinates of the trip.
   * @param destinationCoords - The destination coordinates of the trip.
   * @returns The calculated cost in IO$.
   */
  async calculateMolecularMass(origin: { lat: number; lng: number }, destinationCoords: { lat: number; lng: number }): Promise<number> {
    const distance = calculateDistance(origin.lat, origin.lng, destinationCoords.lat, destinationCoords.lng); // Distance in meters
    const configDoc = await getDoc(doc(db, 'config', 'pricing'));
    const baseRatePerKm = configDoc.exists() ? configDoc.data().baseRatePerKm || 0.5 : 0.5; // Example base rate
    const cost = (distance / 1000) * baseRatePerKm; // Cost per kilometer
    console.log(`RideService: Calculated trip cost: ${cost.toFixed(2)} IO$ for ${distance.toFixed(2)} meters.`);
    return parseFloat(cost.toFixed(2));
  },

  /**
   * Converts a human-readable address string into geographic coordinates (latitude, longitude)
   * using a geocoding service (e.g., Nominatim OpenStreetMap).
   * @param address - The address string to geocode.
   * @returns An object with lat and lng, or null if geocoding fails.
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    console.log(`RideService: Attempting to geocode address: "${address}"`);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.statusText}`);
      }
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        return { lat, lng };
      }
      console.warn(`RideService: Could not geocode address: "${address}". No valid results found.`);
      return null;
    } catch (error) {
      console.error(`RideService: Error during geocoding for "${address}":`, error);
      return null;
    }
  },

  /**
   * Dispatches a ride bond by storing it in Firestore.
   * @param tripBond - The details of the trip bond to be dispatched.
   * @returns The dispatched trip bond with its ID and initial status.
   */
  async dispatchRide(tripBond: any): Promise<any> {
    console.log("RideService: Dispatching trip bond to Firestore:", tripBond);
    const ridesCollection = collection(db, 'rides');
    const docRef = await addDoc(ridesCollection, {
      ...tripBond,
      status: 'PENDING_DRIVER_ACCEPTANCE', // Initial status
      createdAt: new Date(),
    });
    console.log(`RideService: Trip bond dispatched with ID: ${docRef.id}`);
    return { ...tripBond, id: docRef.id, status: 'PENDING_DRIVER_ACCEPTANCE', timestamp: Date.now() };
  },
};

// Export interfaces for external use if needed
export type { CurrentUser, SovereignDriver };