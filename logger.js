/**
 * utility to handle conditional logging based on Vite modes.
 */
const isLogEnabled = !import.meta.env.PROD || import.meta.env.MODE === 'staging';

export const debugLog = (...args) => {
  if (isLogEnabled) {
    // Use the shorthand directly in the template literal
    console.log(`[${import.meta.env.MODE.toUpperCase()}]`, ...args);
  }
};