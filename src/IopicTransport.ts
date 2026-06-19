/**
 * THE SYMMETRICAL RIDE BOND
 * Logic: Connecting Node A to Node B via Mobile Resource C
 * This module implements the Global Fleet Handshake, converting all legacy rideshare drivers
 * into Sovereign Transport Stewards within the IOPIC 16-Thread Architecture.
 */

import { RideService } from './RideService'; // Import the production-ready RideService

export const initiateRide = async (destinationAddress: string) => {
  console.log("IopicTransport: Initiating ride to destination:", destinationAddress);

  // 1. Get authenticated passenger
  const passenger = await RideService.getCurrentUser();
  if (!passenger) {
    throw new Error("No authenticated passenger found.");
  }

  // 2. Geocode the destination address
  const destinationCoords = await RideService.geocodeAddress(destinationAddress);
  if (!destinationCoords) {
    throw new Error(`Could not determine coordinates for destination: ${destinationAddress}`);
  }

  // 3. Find the nearest sovereign driver
  const driver = await RideService.findNearestSovereignDriver(passenger.coordinates);
  if (!driver) {
    throw new Error("No sovereign driver available.");
  }

  // 4. Calculate the molecular mass (cost) of the trip
  const cost = await RideService.calculateMolecularMass(passenger.coordinates, destinationCoords);

  // 5. Form the BS-MOLECULE (trip bond) for the trip
  const tripBond = {
    buyer: passenger.uid,
    seller: driver.uid,
    destination: destinationAddress, // Store the human-readable destination
    destinationCoords: destinationCoords, // Store the geocoded coordinates
    cost: cost, // Distance-based IO$
    velocity: "8.09V", // This might also be dynamically calculated
  };

  // 6. Dispatch the ride bond
  return await RideService.dispatchRide(tripBond);
};
