const { GoogleAuth } = require('google-auth-library');

/**
 * Simple script to verify Application Default Credentials (ADC).
 * Run this with: node verify-credentials.js
 */
async function verify() {
  try {
    const auth = new GoogleAuth();
    
    // This triggers the credential discovery logic (ADC)
    const projectId = await auth.getProjectId();
    const client = await auth.getClient();

    console.log('✅ SUCCESS: Application Default Credentials found.');
    console.log(`📍 Project ID: ${projectId}`);
    console.log(`👤 Client Type: ${client.constructor.name}`);
  } catch (error) {
    console.error('❌ FAILURE: Could not find Application Default Credentials.');
    console.error(error.message);
  }
}

verify();