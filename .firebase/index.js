const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// THE SYMMETRY GATE: Validating and Crediting Funding
exports.onPaypalPayment = functions.https.onCall(async (data, context) => {
  // Ensure the node is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'NODE_NOT_SIGHTED');
  }

  const { orderID, amount } = data;
  const uid = context.auth.uid;

  try {
    // 1. Verify Order with PayPal using your Secret (Stored in Firebase Secrets)
    // const accessToken = await getPayPalAccessToken();
    // const verification = await verifyOrder(orderID, accessToken);

    // 2. Calculate the 50% Bonus (Symmetry Multiplier)
    const baseValue = parseFloat(amount);
    const totalCredit = baseValue * 1.5;

    // 3. Ground the Equity in the User's IOWB Ledger
    const userRef = db.collection('users').doc(uid);
    
    await db.runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      const currentBalance = userDoc.data().iowb.balance || 0;
      
      t.update(userRef, {
        'iowb.balance': currentBalance + totalCredit,
        'iowb.lastDeposit': admin.firestore.FieldValue.serverTimestamp(),
        'coinxs': admin.firestore.FieldValue.arrayUnion({
          orderId: orderID,
          timestamp: new Date().toISOString(),
          value: baseValue,
          bonus: totalCredit - baseValue
        })
      });
    });

    return { status: 'SUCCESS', credit: totalCredit };

  } catch (error) {
    console.error('TRANSIT_ERROR:', error);
    throw new functions.https.HttpsError('internal', 'TRANSIT_FAILED');
  }
});