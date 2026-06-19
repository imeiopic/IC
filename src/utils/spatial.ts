export const parseVRELocality = (localityString: string) => {
  // Example Input: "CLEVELAND [41.81]"
  const regex = /^([A-Z_]+)\s\[(\d+)\.(\d+)\]$/;
  const match = localityString.match(regex);

  if (match) {
    return {
      cityName: match[1], // "CLEVELAND"
      approxLat: parseInt(match[2]), // 41
      approxLng: parseInt(match[3]) // 81
    };
  }
  throw new Error('LOGIC_FRACTURE: Invalid VRE spatial string format.');
};
