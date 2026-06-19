// DIC Service Worker - Background Synchronization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-lite.js';

// Configuration passed from the main thread during registration
let firebaseConfig = null;
let userId = null;

self.addEventListener('message', (event) => {
  if (event.data.type === 'SET_CONFIG') {
    firebaseConfig = event.data.config;
    userId = event.data.userId;
  }
});

/**
 * BACKGROUND SYNC: Process queued mutations when connectivity is restored.
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'process-mutations') {
    event.waitUntil(processMutationQueue());
  }
});

async function processMutationQueue() {
  const db = await openMutationDB();
  const tx = db.transaction('mutation-queue', 'readwrite');
  const store = tx.objectStore('mutation-queue');
  const requests = await getAllRequests(store);

  for (const request of requests) {
    try {
      // Note: In a real app, you'd reconstruct the httpsCallable or use raw fetch
      // with a stored Firebase Auth token.
      const response = await fetch(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.data),
      });

      if (response.ok) {
        await deleteRequest(db, request.id);
        console.log('[DIC-SW] Successfully processed queued mutation:', request.id);
      }
    } catch (err) {
      console.error('[DIC-SW] Failed to process queued mutation:', err);
      // Keep in queue for next sync attempt
    }
  }
}

function openMutationDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DIC_OFFLINE_DB', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('mutation-queue')) {
        request.result.createObjectStore('mutation-queue', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'dic-node-heartbeat') {
    event.waitUntil(performHeartbeat());
  }
});

async function performHeartbeat() {
  if (!firebaseConfig || !userId) return;

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      'status_metadata.lastHeartbeat': serverTimestamp(),
      'status_metadata.syncMode': 'BACKGROUND_SW'
    });
    
    console.log('[DIC-SW] Background heartbeat successful for:', userId);
  } catch (error) {
    console.error('[DIC-SW] Background heartbeat failed:', error);
  }
}

function getAllRequests(store) {
  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

function deleteRequest(db, id) {
  return new Promise((resolve) => {
    const tx = db.transaction('mutation-queue', 'readwrite');
    const store = tx.objectStore('mutation-queue');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
  });
}