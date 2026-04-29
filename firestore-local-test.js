const admin = require('firebase-admin');

/**
 * Refactored to use Application Default Credentials (ADC).
 * This is more secure for local development as it avoids local JSON keys.
 */
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'calcium-channel-489906-m2'
});

const db = admin.firestore();

async function testFirestoreConnection() {
  try {
    console.log('Attempting to fetch collections from Firestore...');
    const collections = await db.listCollections();
    
    console.log('✅ Connection Successful!');
    console.log('Available collections:', collections.map(col => col.id));
  } catch (error) {
    console.error('❌ Firestore connection failed:', error.message);
  }
}

testFirestoreConnection();