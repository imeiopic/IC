// Cloud Functions for IO Law & Order for IoT
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Device/User Registration Trigger
exports.onDeviceRegister = functions.firestore
  .document('devices/{deviceId}')
  .onCreate(async (snap, context) => {
    const device = snap.data();
    // Add registration logic, e.g., assign certificate, validate info
    // Log registration
    await admin.firestore().collection('audit').add({
      type: 'registration',
      deviceId: context.params.deviceId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: device
    });
    return null;
  });

// Policy Enforcement Function (HTTP)
exports.enforcePolicy = functions.https.onCall(async (data, context) => {
  // data: { deviceId, action, userId }
  // Fetch device/user policy
  // Evaluate policy (allow/deny)
  // Log action
  // Return result
  return { allowed: true, reason: 'Policy check passed' };
});

// Action Logger Trigger
exports.onAction = functions.firestore
  .document('actions/{actionId}')
  .onCreate(async (snap, context) => {
    const action = snap.data();
    // Log action for audit
    await admin.firestore().collection('audit').add({
      type: 'action',
      actionId: context.params.actionId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: action
    });
    return null;
  });

// Anomaly Detection (simplified)
exports.detectAnomaly = functions.firestore
  .document('actions/{actionId}')
  .onCreate(async (snap, context) => {
    const action = snap.data();
    // Example: flag if action is outside allowed hours
    const hour = new Date().getUTCHours();
    if (hour < 6 || hour > 22) {
      await admin.firestore().collection('alerts').add({
        type: 'anomaly',
        actionId: context.params.actionId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: action
      });
    }
    return null;
  });

// Dispute Handler (HTTP)
exports.handleDispute = functions.https.onCall(async (data, context) => {
  // data: { actionId, reason }
  // Log dispute, trigger workflow
  await admin.firestore().collection('disputes').add({
    actionId: data.actionId,
    reason: data.reason,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    status: 'open'
  });
  return { status: 'received' };
});
