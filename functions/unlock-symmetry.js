// Cloud Function endpoint for symmetry unlock
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  const { nodeId } = req.body;
  if (!nodeId) return res.status(400).json({ error: "Missing nodeId" });
  try {
    await admin.firestore().doc(`nodes/${nodeId}`).set(
      {
        status: "ACKNOWLEDGE_CLEAR",
        validatedBy: "ValidatorNode", // TODO: Use real validator
        validatedAt: new Date(),
      },
      { merge: true },
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
