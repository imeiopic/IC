/* eslint-disable @typescript-eslint/no-var-requires */
// Cloud Function for real-time Root Steward handshake verification
const admin = require("firebase-admin");

/**
 * POST /api/steward-handshake
 * Body: { stewardId: string }
 * Returns: { verified: boolean, allStewards: [{id, name, verified}] }
 */
module.exports = async (req, res) => {
  const {stewardId} = req.body;
  if (!stewardId) return res.status(400).json({error: "Missing stewardId"});

  // Mark this steward as verified in Firestore
  const ref = admin.firestore().doc(`stewards/${stewardId}`);
  await ref.set({verified: true, verifiedAt: new Date()}, {merge: true});

  // Get all stewards
  const snap = await admin.firestore().collection("stewards").get();
  const allStewards = snap.docs.map((doc) => ({id: doc.id, ...doc.data()}));
  const allVerified = allStewards.every((s) => s.verified);

  res.json({verified: true, allStewards, allVerified});
};
