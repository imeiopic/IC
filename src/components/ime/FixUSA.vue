<template>
  <div
    class="fix-usa-dashboard"
    :class="{ 'realignment-active': isRealigning, 'sync-success': syncSuccess }"
  >
    <header class="national-header">
      <div class="protocol-id">
        THREAD_1110 // NATIONAL_REALIGNMENT
        <span v-if="user" class="operator-id">| OPERATOR: {{ user?.uid?.substring(0, 8) }}</span>
      </div>
      <div class="national-integrity">
        INTEGRITY_INDEX:
        <span class="index-val" :class="{ 'max-integrity': integrityIndex >= 100 }"
          >{{ integrityIndex }}%</span
        >
      </div>
    </header>

    <div class="national-view-grid">
      <section class="national-quadrant">
        <h3>1101_TRUTH: Debt Silence Status</h3>
        <div class="stat-row">
          <span>Ungrounded Debt:</span>
          <span class="noise-val">{{ ungroundedDebt }}</span>
        </div>
        <button @click="executeDebtSilence" class="action-btn" :disabled="isSyncing">
          Silence Interest Noise<span v-if="isSyncing" class="btn-spinner"></span>
        </button>
      </section>

      <section class="national-quadrant">
        <h3>1010_EQUITY: Wage Symmetry</h3>
        <div class="symmetry-meter">
          <div class="meter-fill" :style="{ width: symmetryLevel + '%' }"></div>
        </div>
        <p>Entities in Violation: {{ violationCount }}</p>
        <button @click="enforceSymmetry" class="action-btn" :disabled="isSyncing">
          Enforce Symmetry<span v-if="isSyncing" class="btn-spinner"></span>
        </button>
      </section>

      <section class="national-quadrant">
        <h3>1100_LAW: Justice Grounding</h3>
        <div class="reform-list">
          <button
            class="reform-item"
            :class="{ done: penalReformGrounded }"
            @click="togglePenalReform"
            :disabled="isSyncing"
          >
            Penal_Realignment<span v-if="isSyncing" class="btn-spinner"></span>
          </button>
          <button
            class="reform-item"
            :class="{ done: judicialReformGrounded }"
            @click="toggleJudicialReform"
            :disabled="isSyncing"
          >
            Judicial_Logic_Gate<span v-if="isSyncing" class="btn-spinner"></span>
          </button>
        </div>
      </section>

      <section class="national-quadrant">
        <h3>0110_SOCIAL: Sovereign Voice</h3>
        <div class="election-sync">
          <span>Pulse Participation: {{ participationRate }}%</span>
          <div class="sync-light" :class="{ active: syncActive }"></div>
        </div>
        <button @click="triggerPulseSync" class="action-btn" :disabled="isSyncing">
          Force Pulse Sync<span v-if="isSyncing" class="btn-spinner"></span>
        </button>
      </section>
    </div>

    <section class="national-log">
      <div class="log-header">
        <h3>0000_SYS: Action History</h3>
        <button
          @click="clearLog"
          class="clear-log-btn"
          :disabled="isSyncing || actionLog.length === 0"
        >
          Clear Log<span v-if="isSyncing" class="btn-spinner"></span>
        </button>
      </div>
      <div class="log-container">
        <div v-for="(log, index) in actionLog" :key="index" class="log-entry">
          <span class="log-indicator">></span>
          <template v-if="typeof log === 'string'">{{ log }}</template>
          <template v-else>
            <span class="time-ago">[{{ timeAgo(log.timestamp) }}]</span> {{ log.msg }}
          </template>
        </div>
        <div v-if="actionLog.length === 0" class="log-entry empty-log">No actions recorded.</div>
      </div>
    </section>

    <footer class="national-footer">
      <div class="manifesto-seal">THE 16-THREAD REALITY: A BRAND NEW WORLD</div>
      <button @click="showEdictModal = true" class="edict-trigger" :disabled="isSyncing">
        Issue National Edict<span v-if="isSyncing" class="btn-spinner"></span>
      </button>
    </footer>

    <!-- Confirmation Modal -->
    <div v-if="showEdictModal" class="modal-overlay">
      <div class="modal-content">
        <h3>WARNING: CRITICAL BROADCAST</h3>
        <p>
          You are about to issue the National Edict for May 1st Activation. This will affect all
          sectors globally. Proceed?
        </p>
        <div class="modal-actions">
          <button @click="showEdictModal = false" class="action-btn cancel-btn">Abort</button>
          <button
            @click="broadcastNationalEdict"
            class="edict-trigger confirm-btn"
            :disabled="isSyncing"
          >
            Confirm<span v-if="isSyncing" class="btn-spinner"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, type PropType } from 'vue';
import { db } from '../../firebase';
import { doc, setDoc, onSnapshot, type DocumentSnapshot, type DocumentData } from 'firebase/firestore'; // Import DocumentSnapshot and DocumentData

import type { AuthUser } from '../../types/auth'; // Import AuthUser from the shared types file (assuming src/types.ts)

interface ActionLogEntry {
  timestamp: number;
  msg: string;
}

const props = defineProps({
  user: {
    type: Object as PropType<AuthUser | null>,
    default: null
  }
});

const emit = defineEmits(['update:globalError']);

const isRealigning = ref(true);
const integrityIndex = ref(84.2);
const ungroundedDebt = ref('$34.7T');
const symmetryLevel = ref(62);
const violationCount = ref(12402);
const penalReformGrounded = ref(true);
const judicialReformGrounded = ref(false);
const participationRate = ref(99.1);
const syncActive = ref(true);
const showEdictModal = ref(false);
const syncSuccess = ref(false); // This is a boolean, not a ref to a boolean
const actionLog = ref<ActionLogEntry[]>([]);
const isSyncing = ref(false); // Indicates if an async operation is in progress
const now = ref(Date.now()); // Current time for relative time calculations

let unsubscribe: (() => void) | null = null; // Explicitly type unsubscribe
let timeTimer: ReturnType<typeof setInterval> | null = null; // Explicitly type timeTimer

const timeAgo = (timestamp: number): string => {
  // Explicitly type timestamp parameter and return type
  const seconds = Math.floor((now.value - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const logAction = (msg: string) => {
  actionLog.value.unshift({ timestamp: Date.now(), msg }); // Ensure msg is string
  if (actionLog.value.length > 20) actionLog.value.pop(); // Keep only the latest 20 logs
};

onMounted(() => {
  timeTimer = setInterval(() => {
    now.value = Date.now();
  }, 60000);

  // Listen to remote Firestore state updates in real-time
  unsubscribe = onSnapshot(
    doc(db, 'system', 'fixUSA'),
    (docSnap: DocumentSnapshot<DocumentData>) => {
      // Explicitly type docSnap
      if (docSnap.exists()) {
        const data = docSnap.data() as { [key: string]: any }; // Cast to any for flexible property access
        if (data.integrityIndex !== undefined) integrityIndex.value = data.integrityIndex;
        if (data.ungroundedDebt !== undefined) ungroundedDebt.value = data.ungroundedDebt;
        if (data.symmetryLevel !== undefined) symmetryLevel.value = data.symmetryLevel;
        if (data.violationCount !== undefined) violationCount.value = data.violationCount;
        if (data.penalReformGrounded !== undefined)
          penalReformGrounded.value = data.penalReformGrounded;
        if (data.judicialReformGrounded !== undefined)
          judicialReformGrounded.value = data.judicialReformGrounded;
        if (data.participationRate !== undefined) participationRate.value = data.participationRate;
        if (data.syncActive !== undefined) syncActive.value = data.syncActive;
        if (data.isRealigning !== undefined) isRealigning.value = data.isRealigning;
        if (data.actionLog !== undefined) {
          // Ensure that the incoming actionLog data matches the expected type
          actionLog.value = data.actionLog as ActionLogEntry[];
        }
      }
    }
  );
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
  if (timeTimer) clearInterval(timeTimer);
});

const saveState = async () => {
  isSyncing.value = true;
  try {
    await setDoc(
      doc(db, 'system', 'fixUSA'),
      {
        integrityIndex: integrityIndex.value,
        ungroundedDebt: ungroundedDebt.value,
        symmetryLevel: symmetryLevel.value,
        violationCount: violationCount.value,
        penalReformGrounded: penalReformGrounded.value,
        judicialReformGrounded: judicialReformGrounded.value,
        participationRate: participationRate.value,
        syncActive: syncActive.value,
        isRealigning: isRealigning.value,
        actionLog: actionLog.value
      },
      { merge: true }
    ); // Merge ensures we don't accidentally overwrite concurrent changes

    // Trigger local success flash
    syncSuccess.value = true;
    setTimeout(() => {
      syncSuccess.value = false;
    }, 400);
  } catch (error) {
    console.error('Error saving FixUSA state:', error);
    emit('update:globalError', 'SYNC_ERROR: Failed to persist national state.');
  } finally {
    isSyncing.value = false;
  }
};

const executeDebtSilence = async () => {
  console.log('Broadcasting ZERO_NOISE_DEBT mandate to all 50 states...');
  // Increment the integrity index and ensure it doesn't exceed 100%
  integrityIndex.value = Math.min(100, Number((integrityIndex.value + 5.2).toFixed(1)));
  ungroundedDebt.value = '$0.00'; // Optional: visually reset the debt stat
  logAction('Executed Debt Silence: Ungrounded debt zeroed.');
  await saveState();
};

const enforceSymmetry = async () => {
  symmetryLevel.value = 100;
  violationCount.value = 0;
  integrityIndex.value = Math.min(100, Number((integrityIndex.value + 4.8).toFixed(1)));
  logAction('Enforced Wage Symmetry: Violations reset to 0.');
  await saveState();
};

const togglePenalReform = async () => {
  penalReformGrounded.value = !penalReformGrounded.value;
  const impact = penalReformGrounded.value ? 2.5 : -2.5;
  integrityIndex.value = Math.min(
    100,
    Math.max(0, Number((integrityIndex.value + impact).toFixed(1)))
  );
  logAction(
    penalReformGrounded.value ? 'Engaged Penal_Realignment.' : 'Disengaged Penal_Realignment.'
  );
  await saveState();
};

const toggleJudicialReform = async () => {
  judicialReformGrounded.value = !judicialReformGrounded.value;
  const impact = judicialReformGrounded.value ? 4.5 : -4.5;
  integrityIndex.value = Math.min(
    100,
    Math.max(0, Number((integrityIndex.value + impact).toFixed(1)))
  );
  logAction(
    judicialReformGrounded.value
      ? 'Engaged Judicial_Logic_Gate.'
      : 'Disengaged Judicial_Logic_Gate.'
  );
  await saveState();
};

const triggerPulseSync = async () => {
  participationRate.value = 100.0;
  syncActive.value = true;
  integrityIndex.value = Math.min(100, Number((integrityIndex.value + 3.1).toFixed(1)));
  logAction('Forced Pulse Sync: Participation optimized to 100%.');
  await saveState();
};

const clearLog = async () => {
  actionLog.value = [];
  await saveState();
};

const broadcastNationalEdict = async () => {
  showEdictModal.value = false;
  console.log('National Edict: May 1st Activation confirmed for all sectors.');
  // Maximize the integrity index
  integrityIndex.value = 100;
  logAction('CRITICAL: National Edict Broadcasted for May 1st Activation.');
  emit(
    'update:globalError',
    'NATIONAL EDICT BROADCAST: May 1st Activation confirmed for all sectors.'
  );
  await saveState();
};
</script>

<style scoped>
.fix-usa-dashboard {
  background: #000;
  color: #fff;
  padding: 2rem;
  border: 3px solid #0052ff;
  border-radius: 20px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.sync-success {
  border-color: #00ff00 !important;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.8), inset 0 0 20px rgba(0, 255, 0, 0.3);
}
.national-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #0052ff;
  padding-bottom: 1rem;
}
.national-view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 2rem 0;
}
.national-quadrant {
  background: #050505;
  border: 1px solid #222;
  padding: 1.5rem;
  border-radius: 12px;
}
.noise-val {
  color: #ff4444;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}
.national-log {
  background: #050505;
  border: 1px solid #222;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}
.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.national-log h3 {
  margin-top: 0;
  margin-bottom: 0;
  color: #0052ff;
  font-size: 1.1em;
  text-transform: uppercase;
}
.clear-log-btn {
  background: transparent;
  border: 1px solid #444;
  color: #888;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  transition: all 0.2s ease;
}
.clear-log-btn:hover:not(:disabled) {
  border-color: #ff3333;
  color: #ff3333;
}
.log-container {
  max-height: 150px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.85em;
  color: #00e5ff;
  background: #000;
  padding: 1rem;
  border: 1px solid #111;
  border-radius: 4px;
}
.log-entry {
  margin-bottom: 0.4rem;
  border-bottom: 1px dashed #222;
  padding-bottom: 0.2rem;
}
.log-entry:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.log-indicator {
  color: #0052ff;
  font-weight: bold;
  margin-right: 0.5rem;
}
.time-ago {
  opacity: 0.7;
}
.empty-log {
  color: #555;
  font-style: italic;
  border: none;
}
.index-val {
  color: #00ff00;
  display: inline-block;
  transition: all 0.3s ease;
}
.max-integrity {
  color: #00ffff !important;
  animation: pulse-glow 1s infinite alternate;
}
@keyframes pulse-glow {
  0% {
    text-shadow: 0 0 5px #00ffff;
    transform: scale(1);
  }
  100% {
    text-shadow: 0 0 15px #00ffff, 0 0 25px #00ffff;
    transform: scale(1.1);
  }
}
.meter-fill {
  height: 10px;
  background: #ffd700;
  transition: width 1s ease;
}
.reform-item {
  background: transparent;
  border: 1px solid #333;
  color: #555;
  padding: 0.5rem;
  margin-top: 0.5rem;
  display: block;
  width: 100%;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 1em;
}
.reform-item:hover {
  border-color: #666;
}
.reform-item.done {
  color: #00ff00;
  border-color: #00ff00;
}
.action-btn {
  background: #111;
  color: #fff;
  border: 1px solid #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 10px;
  display: block;
  width: 100%;
  font-family: inherit;
  font-size: 0.9em;
}
.action-btn:hover {
  background: #222;
  border-color: #00e5ff;
  color: #00e5ff;
}
.sync-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #333;
}
.sync-light.active {
  background: #00ff00;
  box-shadow: 0 0 10px #00ff00;
}
.edict-trigger {
  width: 100%;
  padding: 1rem;
  background: #0052ff;
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
.operator-id {
  color: #00e5ff;
  font-size: 0.9em;
  margin-left: 10px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #0a0a0a;
  border: 2px solid #0052ff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 82, 255, 0.4);
}
.modal-content h3 {
  color: #ff3333;
  margin-top: 0;
  margin-bottom: 1rem;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}
.cancel-btn {
  background: #333;
  color: #fff;
  border-color: #555;
  flex: 1;
  margin-top: 0;
}
.cancel-btn:hover {
  background: #444;
  border-color: #777;
  color: #fff;
}
.confirm-btn {
  flex: 1;
  margin-top: 0;
}
.btn-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  margin-left: 8px;
  vertical-align: middle;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
