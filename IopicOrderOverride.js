// IopicOrderOverride.js
// Master Node override logic for OrderTaker (Threads 9–12)
// Ensures global monitoring of mass/equity flow while respecting MYB firewall

/**
 * Symmetry Thresholds (can be dynamically adjusted by I.T Real)
 * Example: Minimum IO$ required for different resource types
 */
const SYMMETRY_THRESHOLDS = {
  food: 10, // IO$
  medicine: 5,
  energy: 8,
  general: 1
};

// Global aggregate stats (MYB-compliant)
const globalOrderStats = {
  totalOrders: 0,
  totalValue: 0,
  byType: {}
};

/**
 * Monitor all order requests and allow override/alert if thresholds or patterns are breached
 * @param {Object} order - The order request object
 * @param {Object} node - The member-owner node info (ignored for privacy)
 * @returns {Object} - { allowed: boolean, reason?: string, override?: boolean }
 */
function monitorOrder(order, node) {
  // MYB: Only monitor aggregate, not personal details
  const { type, value } = order;
  const threshold = SYMMETRY_THRESHOLDS[type] || SYMMETRY_THRESHOLDS.general;

  // Update global stats (no node info stored)
  globalOrderStats.totalOrders++;
  globalOrderStats.totalValue += value;
  if (!globalOrderStats.byType[type]) globalOrderStats.byType[type] = { count: 0, value: 0 };
  globalOrderStats.byType[type].count++;
  globalOrderStats.byType[type].value += value;

  if (value < threshold) {
    return {
      allowed: false,
      reason: `Order below symmetry threshold for ${type}`,
      override: false
    };
  }
  // Example: Alert if global flow exceeds certain rate (pseudo-code)
  // if (getGlobalFlow(type) > MAX_FLOW[type]) { ... }
  return { allowed: true };
}

/**
 * Get global aggregate stats (MYB-compliant)
 */
function getGlobalOrderStats() {
  return JSON.parse(JSON.stringify(globalOrderStats));
}

/**
 * Allows I.T Real to update thresholds at runtime
 */
function setSymmetryThreshold(type, value) {
  SYMMETRY_THRESHOLDS[type] = value;
}

module.exports = {
  monitorOrder,
  setSymmetryThreshold,
  SYMMETRY_THRESHOLDS
};
