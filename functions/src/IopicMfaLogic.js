/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * THE LOGIC KEY GENERATOR
 * Securely pulses a 6-digit handshake to the Node's secondary device.
 */
const admin = require("firebase-admin");
const {hashLogic, pulseToNode} = require("./utils"); // You must implement these helpers

exports.generateLogicKey = async (userId) => {
  const logicKey = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 30 * 1000; // 30-second window

  await admin
    .firestore()
    .doc(`nodes/${userId}/security/mfa`)
    .set({
      keyHash: await hashLogic(logicKey),
      expires: expiry,
      status: "PENDING",
    });

  // Pulse to secondary device via DIC Client
  return pulseToNode(userId, `Your IOPIC Logic Key: ${logicKey}`);
};
