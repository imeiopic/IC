/* eslint-disable @typescript-eslint/no-var-requires */
// Cloud Function for real-time Root Steward handshake status
const admin = require("firebase-admin");

/**
 * GET /api/steward-handshake-status
 * Returns: { allStewards: [{id, name, verified}], allVerified: boolean }
 */
module.exports = async (req, res) => {
  // Get all stewards
  const snap = await admin.firestore().collection("stewards").get();
  const allStewards = snap.docs.map((doc) => ({id: doc.id, ...doc.data()}));
  const allVerified = allStewards.every((s) => s.verified);
  res.json({allStewards, allVerified});
};
