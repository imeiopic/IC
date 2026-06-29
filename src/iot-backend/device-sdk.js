// Minimal Device SDK for IO Law & Order for IoT
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, collection } from 'firebase/firestore';

export class IOTDevice {
  constructor({ deviceId, token, db, auth }) {
    this.deviceId = deviceId;
    this.db = db;
    this.auth = auth;
    this.token = token;
  }

  async registerDevice(info) {
    await setDoc(doc(this.db, 'devices', this.deviceId), info);
  }

  async authenticate() {
    await signInWithCustomToken(this.auth, this.token);
  }

  async logAction(action) {
    await addDoc(collection(this.db, 'actions'), {
      deviceId: this.deviceId,
      ...action,
      timestamp: new Date().toISOString()
    });
  }

  async checkPolicy(action) {
    // Call backend policy function (assume callable function is set up)
    // Example: firebase.functions().httpsCallable('enforcePolicy')
    // For demo, always allow
    return { allowed: true };
  }
}
