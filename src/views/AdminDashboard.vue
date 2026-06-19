<template>
  <CContainer fluid class="p-4 bg-black min-vh-100 font-mono text-white">
    <header class="mb-5 border-bottom border-zinc-800 pb-3">
      <h2 class="text-danger italic font-black m-0">[ADMIN_OVERRIDE] SYSTEM FRACTURES: ACH</h2>
      <p class="text-zinc-500 tiny tracking-widest mt-1">
        Sighting all ungrounded nodes with failed pulses
      </p>
    </header>

    <div v-if="loading" class="text-info animate-pulse text-center my-5 tracking-widest">
      SCANNING GLOBAL MESH FOR FRACTURES...
    </div>

    <div
      v-else-if="error"
      class="text-danger text-center my-5 border border-danger p-3 bg-danger bg-opacity-10"
    >
      ERROR SIGHTING NODES: {{ error }}
    </div>

    <div
      v-else-if="failedPulses.length === 0"
      class="text-success text-center my-5 tracking-widest italic font-black"
    >
      [1010_EQUITY] ALL NODES GROUNDED. NO ACH FAILURES DETECTED.
    </div>

    <div v-else class="table-responsive">
      <table class="table table-dark table-bordered border-zinc-700 align-middle">
        <thead>
          <tr class="text-info extra-tiny tracking-widest text-center">
            <th>NODE_ID (UID)</th>
            <th>STATUS</th>
            <th>NOISE / FRACTURE REASON</th>
            <th>TIMESTAMP</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pulse in failedPulses" :key="pulse.uid">
            <td class="text-zinc-400 extra-tiny text-center">{{ pulse.uid }}</td>
            <td class="text-danger font-black italic text-center">FAILED</td>
            <td class="text-warning extra-tiny">{{ pulse.lastPaymentError }}</td>
            <td class="text-zinc-500 extra-tiny text-center">{{ formatDate(pulse.updatedAt) }}</td>
            <td class="text-center">
              <CButton
                color="info"
                variant="outline"
                class="extra-tiny py-1"
                @click="resolveFracture(pulse.uid)"
              >
                MARK AS RESOLVED
              </CButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { CContainer, CButton } from '@coreui/vue';
import { app } from '../firebase'; // Adjust path if necessary based on your folder structure

interface FailedPulse {
  uid: string;
  lastPaymentStatus: string;
  lastPaymentError: string;
  updatedAt: any;
}

const failedPulses = ref<FailedPulse[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const db = getFirestore(app);

const fetchFailures = async () => {
  loading.value = true;
  error.value = null;
  try {
    const q = query(collection(db, 'users'), where('lastPaymentStatus', '==', 'failed'));

    const querySnapshot = await getDocs(q);
    failedPulses.value = querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data()
    })) as FailedPulse[];
  } catch (err: any) {
    console.error('Failed to fetch ACH fractures:', err);
    error.value = err.message || 'Unknown error scanning mesh.';
  } finally {
    loading.value = false;
  }
};

const resolveFracture = async (uid: string) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      lastPaymentStatus: 'resolved_by_admin'
    });
    // Remove it from the local UI list immediately
    failedPulses.value = failedPulses.value.filter((p) => p.uid !== uid);
  } catch (err) {
    console.error('Error updating user document:', err);
    alert('FRACTURE: Failed to update node status.');
  }
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'UNKNOWN';
  // Convert Firestore Timestamp to JS Date
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
};

onMounted(() => {
  fetchFailures();
});
</script>
