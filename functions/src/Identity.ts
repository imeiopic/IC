// functions/src/identity.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const generateGenesisBinding = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Node not grounded.');

    const { lat, lng, alt } = data;
    const timestamp = admin.firestore.Timestamp.now().toMillis();
    
    // The Spatiotemporal Hash: The "True ID"
    const bindingID = `IO-${lat.toFixed(6)}-${lng.toFixed(6)}-${timestamp}`;

    await admin.firestore().collection('users').doc(context.auth.uid).set({
        genesis: {
            bindingID,
            coords: new admin.firestore.GeoPoint(lat, lng),
            altitude: alt,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        },
        status: 'SPATIOTEMPORAL_BOUND'
    }, { merge: true });

    return { bindingID };
});